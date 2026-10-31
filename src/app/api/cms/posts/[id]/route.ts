import { NextResponse } from 'next/server';
import { CMS_EDITOR_ROLES, requireApiRole } from '@/lib/auth/authorization';
import { postInputSchema } from '@/lib/cms/post-schema';
import { createClient } from '@/lib/supabase/server';

type Context = { params: { id: string } };

export async function GET(_: Request, { params }: Context) {
  const authorization = await requireApiRole([...CMS_EDITOR_ROLES, 'viewer']);
  if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  const { data, error } = await createClient().from('cms_posts').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PUT(request: Request, { params }: Context) {
  const authorization = await requireApiRole(CMS_EDITOR_ROLES);
  if (!authorization.ok) return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  const parsed = postInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dữ liệu bài viết không hợp lệ.' }, { status: 400 });
  const value = parsed.data;
  if (value.status === 'scheduled' && !value.scheduledAt) return NextResponse.json({ error: 'Cần chọn thời gian lên lịch.' }, { status: 400 });
  const { data: existing } = await createClient().from('cms_posts').select('published_at').eq('id', params.id).single();
  const { error } = await createClient().from('cms_posts').update({
    title: value.title, slug: value.slug, excerpt: value.excerpt, content: value.content, featured_image_url: value.featuredImageUrl || null, featured_image_alt: value.featuredImageAlt || null, category_id: value.categoryId || null, tags: value.tags,
    status: value.status, scheduled_at: value.scheduledAt || null, published_at: value.status === 'published' ? existing?.published_at || new Date().toISOString() : null, editor_id: authorization.user.id,
    seo_title: value.seoTitle || null, meta_description: value.metaDescription || null, canonical_url: value.canonicalUrl || null, og_title: value.ogTitle || null, og_description: value.ogDescription || null, og_image_url: value.ogImageUrl || null, updated_at: new Date().toISOString(),
  }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Slug đã tồn tại.' : 'Không thể lưu bài viết.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
