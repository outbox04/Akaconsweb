import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import { CmsNavigation } from '@/components/cms-navigation';

export default function CmsActivityPage() {
  return <main className="cms-page"><Link href="/admin/cms" className="cms-back"><ArrowLeft size={16} /> Website CMS</Link><header className="cms-header compact"><div><p>NHẬT KÝ CMS</p><h1>Hoạt động xuất bản</h1><span>Lịch sử xuất bản sẽ hiển thị tại đây khi hệ thống lưu phiên bản được kích hoạt.</span></div></header><CmsNavigation /><section className="cms-empty-state"><Activity size={24} /><h2>Chưa có hoạt động để hiển thị</h2><p>Các thay đổi hiện được lưu và xuất bản từ Live Preview.</p></section></main>;
}
