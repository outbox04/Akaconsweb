import Link from 'next/link';
import { ArrowRight, Image, MonitorPlay, Settings } from 'lucide-react';
import { CmsNavigation } from '@/components/cms-navigation';

const actions = [
  { href: '/admin/live-preview', title: 'Sửa website trực tiếp', description: 'Chọn chữ, ảnh hoặc nền section trên bản xem trước để chỉnh sửa và xuất bản.', icon: MonitorPlay },
  { href: '/admin/cms/media', title: 'Quản lý hình ảnh', description: 'Chuẩn bị ảnh nền, hình công trình và ảnh dùng cho website.', icon: Image },
  { href: '/admin/cms/settings', title: 'Thiết lập website', description: 'Quản lý thông tin liên hệ, SEO và mã theo dõi.', icon: Settings },
];

export default function CmsDashboardPage() {
  return <main className="cms-page"><header className="cms-header"><div><p>AKACONS · WEBSITE CMS</p><h1>Quản trị nội dung website</h1><span>Chỉnh sửa website trực quan, xem trước trước khi xuất bản.</span></div><Link className="cms-primary-action" href="/admin/live-preview">Mở Live Preview <ArrowRight size={16} /></Link></header><CmsNavigation /><section className="cms-action-grid">{actions.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="cms-action-card"><Icon size={21} /><h2>{title}</h2><p>{description}</p><span>Đi tới <ArrowRight size={15} /></span></Link>)}</section></main>;
}
