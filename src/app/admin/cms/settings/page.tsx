import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { CmsNavigation } from '@/components/cms-navigation';

export default function CmsSettingsPage() {
  return <main className="cms-page"><Link href="/admin/cms" className="cms-back"><ArrowLeft size={16} /> Website CMS</Link><header className="cms-header compact"><div><p>THIẾT LẬP WEBSITE</p><h1>Thương hiệu & xuất bản</h1><span>Cấu hình SEO, liên hệ và kết nối sẽ được quản lý tại đây.</span></div></header><CmsNavigation /><section className="cms-empty-state"><Settings size={24} /><h2>Thiết lập đang được chuẩn bị</h2><p>Hiện tại nội dung, ảnh và ảnh nền section đã có thể xuất bản từ Live Preview.</p><Link className="cms-primary-action" href="/admin/live-preview">Chỉnh sửa website</Link></section></main>;
}
