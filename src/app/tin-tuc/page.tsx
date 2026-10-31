import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const { data: posts } = await createClient().from('cms_posts').select('title,slug,excerpt,featured_image_url,published_at,cms_categories(name)').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false });
  return <main className="public-articles"><header><p>TIN TỨC AKACONS</p><h1>Kiến thức về sơn hiệu ứng và hoàn thiện bề mặt</h1></header><section>{(posts || []).length ? posts?.map((post) => <article key={post.slug}>{post.featured_image_url && <img src={post.featured_image_url} alt="" />}<div><small>{(post.cms_categories as unknown as { name?: string }[] | null)?.[0]?.name || 'Kiến thức'} · {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : ''}</small><h2><Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link href={`/tin-tuc/${post.slug}`}>Đọc bài viết →</Link></div></article>) : <p>Chưa có bài viết được xuất bản.</p>}</section></main>;
}
