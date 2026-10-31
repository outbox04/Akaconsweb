'use client';

import Link from 'next/link';
import { FilePlus2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type Post = { id: string; title: string; slug: string; status: string; updated_at: string; published_at: string | null };
const statuses = [{ value: 'all', label: 'Tất cả' }, { value: 'draft', label: 'Bản nháp' }, { value: 'in_review', label: 'Chờ duyệt' }, { value: 'scheduled', label: 'Đã lên lịch' }, { value: 'published', label: 'Đã xuất bản' }, { value: 'archived', label: 'Lưu trữ' }];

export function CmsPostsManager() {
  const [posts, setPosts] = useState<Post[]>([]); const [status, setStatus] = useState('all'); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { const controller = new AbortController(); setLoading(true); fetch(`/api/cms/posts?status=${status}&search=${encodeURIComponent(search)}`, { signal: controller.signal }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setPosts(body.posts); }).catch((reason) => { if (reason.name !== 'AbortError') setError('Không thể tải bài viết.'); }).finally(() => setLoading(false)); return () => controller.abort(); }, [status, search]);
  return <section className="cms-posts"><div className="cms-post-toolbar"><div className="cms-post-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tiêu đề hoặc slug" /></div><Link href="/admin/cms/posts/new" className="cms-primary-action"><FilePlus2 size={16} /> Tạo bài viết</Link></div><div className="cms-status-tabs">{statuses.map((item) => <button key={item.value} onClick={() => setStatus(item.value)} className={status === item.value ? 'active' : ''}>{item.label}</button>)}</div>{error && <p className="cms-error" role="alert">{error}</p>}<div className="cms-post-list">{loading ? <p>Đang tải bài viết…</p> : posts.length ? posts.map((post) => <Link key={post.id} href={`/admin/cms/posts/${post.id}`}><span className={`cms-post-status ${post.status}`}>{statuses.find((item) => item.value === post.status)?.label || post.status}</span><strong>{post.title}</strong><small>/{post.slug} · cập nhật {new Date(post.updated_at).toLocaleDateString('vi-VN')}</small></Link>) : <p>Chưa có bài viết phù hợp.</p>}</div></section>;
}
