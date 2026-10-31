import { NextRequest, NextResponse } from 'next/server';
import { CMS_EDITOR_ROLES, requireApiRole } from '@/lib/auth/authorization';
import { postInputSchema } from '@/lib/cms/post-schema';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authorization = await requireApiRole([...CMS_EDITOR_ROLES, 'viewer']);
  if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  const search = request.nextUrl.searchParams.get('search')?.trim();
  const status = request.nextUrl.searchParams.get('status');
  const supabase = createClient();
  let query = supabase.from('cms_posts').select('id,title,slug,excerpt,status,published_at,scheduled_at,updated_at,featured_image_url,cms_categories(name,slug)', { count: 'exact' }).order('updated_at', { ascending: false }).range(0, 49);
  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.or(`title.ilike.%${search.replace(/[%_,()]/g, '')}%,slug.ilike.%${search.replace(/[%_,()]/g, '')}%`);
  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: 'Không thể tải bài viết.' }, { status: 500 });
  return NextResponse.json({ posts: data || [], total: count || 0 });
}

export async function POST(request: Request) {
  const authorization = await requireApiRole(CMS_EDITOR_ROLES);
  if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  const parsed = postInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dữ liệu bài viết không hợp lệ.' }, { status: 400 });
  const value = parsed.data;
  if (value.status === 'scheduled' && !value.scheduledAt) return NextResponse.json({ error: 'Cần chọn thời gian lên lịch.' }, { status: 400 });
  const publishNow = value.status === 'published';
  const { data, error } = await createClient().from('cms_posts').insert({
    title: value.title, slug: value.slug, excerpt: value.excerpt, content: value.content, featured_image_url: value.featuredImageUrl || null, featured_image_alt: value.featuredImageAlt || null,
    category_id: value.categoryId || null, tags: value.tags, status: value.status, scheduled_at: value.scheduledAt || null, published_at: publishNow ? new Date().toISOString() : null,
    author_id: authorization.user.id, editor_id: authorization.user.id, seo_title: value.seoTitle || null, meta_description: value.metaDescription || null, canonical_url: value.canonicalUrl || null, og_title: value.ogTitle || null, og_description: value.ogDescription || null, og_image_url: value.ogImageUrl || null,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Slug đã tồn tại.' : 'Không thể tạo bài viết.' }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
