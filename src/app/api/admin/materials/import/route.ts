import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApiAdmin } from '@/lib/auth/authorization';
import { materialImportSchema } from '@/lib/validation/admin';
import { hasAcceptableJsonBody, isSameOrigin, noStoreJson } from '@/lib/security/request';

const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type ImportItem = {
  code: string; name: string; displayName: string; productType: string; category: string; subcategory?: string;
  shortDescription?: string; detailedDescription?: string; seoTitle?: string; seoDescription?: string;
  colors: { code: string; name: string; imageUrl: string; storagePath: string }[];
};

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return noStoreJson({ error: 'Invalid request origin.' }, { status: 403 });
    if (!hasAcceptableJsonBody(request, 1_000_000)) return noStoreJson({ error: 'Request body is too large.' }, { status: 413 });
    const authorization = await requireApiAdmin();
    if (!authorization.ok) return noStoreJson({ error: authorization.message }, { status: authorization.status });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập tài khoản quản trị.' }, { status: 401 });
    const { data: roles, error: roleError } = await supabase.from('user_roles').select('role_name').eq('profile_id', user.id);
    if (roleError) throw roleError;
    if (!roles?.some(role => ['super_admin', 'admin', 'manager'].includes(role.role_name))) {
      return NextResponse.json({ error: 'Tài khoản không có quyền quản trị vật liệu.' }, { status: 403 });
    }
    const parsed = materialImportSchema.safeParse(await request.json());
    if (!parsed.success) return noStoreJson({ error: 'Invalid material import payload.' }, { status: 400 });
    const body = parsed.data as { items?: ImportItem[] };
    if (!body.items?.length) return NextResponse.json({ error: 'Danh sách sản phẩm trống.' }, { status: 400 });

    const upsertNode = async (name: string, kind: string, parentId: string | null, parentSlug = '') => {
      const slug = parentSlug ? `${parentSlug}-${slugify(name)}` : slugify(name);
      const { data, error } = await supabase.from('material_catalog_nodes').upsert({ name, slug, kind, parent_id: parentId }, { onConflict: 'slug' }).select('id,slug').single();
      if (error) throw error;
      return data as { id: string; slug: string };
    };

    for (const item of body.items) {
      const type = await upsertNode(item.productType, 'product_type', null);
      const category = await upsertNode(item.category, 'category', type.id, type.slug);
      const subcategory = item.subcategory?.trim() ? await upsertNode(item.subcategory.trim(), 'subcategory', category.id, category.slug) : null;
      const slug = `${slugify(item.name)}-${slugify(item.code)}`;
      const { data: product, error } = await supabase.from('material_products').upsert({
        code: item.code.toUpperCase(), name: item.name, display_name: item.displayName, slug,
        product_type_id: type.id, category_id: category.id, subcategory_id: subcategory?.id || null,
        short_description: item.shortDescription || null, description: item.detailedDescription || null,
        seo_title: item.seoTitle || item.displayName, seo_description: item.seoDescription || item.shortDescription || null,
        cover_image_url: item.colors[0]?.imageUrl || null, status: 'published', updated_at: new Date().toISOString(),
      }, { onConflict: 'code' }).select('id').single();
      if (error) throw error;
      const { error: deleteError } = await supabase.from('material_product_colors').delete().eq('product_id', product.id);
      if (deleteError) throw deleteError;
      if (item.colors.length) {
        const { error: colorError } = await supabase.from('material_product_colors').insert(item.colors.map((color, position) => ({ product_id: product.id, code: color.code, name: color.name, image_url: color.imageUrl, storage_path: color.storagePath, position })));
        if (colorError) throw colorError;
      }
    }
    return noStoreJson({ success: true, count: body.items.length });
  } catch (error) {
    console.error('Material import failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không thể nhập vật liệu.' }, { status: 500 });
  }
}
