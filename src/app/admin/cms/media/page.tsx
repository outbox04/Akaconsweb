import Link from 'next/link';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { CmsNavigation } from '@/components/cms-navigation';

export default function CmsMediaPage() {
  return <main className="cms-page"><Link href="/admin/cms" className="cms-back"><ArrowLeft size={16} /> Website CMS</Link><header className="cms-header compact"><div><p>THƯ VIỆN HÌNH ẢNH</p><h1>Ảnh dùng trên website</h1><span>Chọn một section trong Live Preview để thay ảnh nền hoặc ảnh nội dung.</span></div></header><CmsNavigation /><section className="cms-empty-state"><ImagePlus size={24} /><h2>Thay ảnh ngay tại Live Preview</h2><p>Để tránh ảnh bị dùng nhầm section, việc chọn và thay ảnh được thực hiện trong đúng vị trí trên website.</p><Link className="cms-primary-action" href="/admin/live-preview">Mở Live Preview</Link></section></main>;
}
