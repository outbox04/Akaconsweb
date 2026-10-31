import Link from 'next/link';
import { CmsPostEditor } from '@/components/cms-post-editor';

export default function NewCmsPostPage() { return <main className="cms-page"><Link href="/admin/cms/posts" className="cms-back">← Bài viết</Link><header className="cms-header compact"><div><p>CMS · BÀI VIẾT</p><h1>Tạo bài viết mới</h1></div></header><CmsPostEditor /></main>; }
