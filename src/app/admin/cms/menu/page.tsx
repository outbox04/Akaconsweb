import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import { CmsNavigation } from '@/components/cms-navigation';

const items = ['Trang chủ', 'Giới thiệu', 'Hiệu ứng sơn', 'Công trình', 'Quy trình', 'Liên hệ'];
export default function CmsMenuPage() {
  return <main className="cms-page"><Link href="/admin/cms" className="cms-back"><ArrowLeft size={16} /> Website CMS</Link><header className="cms-header compact"><div><p>MENU WEBSITE</p><h1>Điều hướng công khai</h1><span>Danh sách trang đang hiển thị trên website AKACONS.</span></div></header><CmsNavigation /><section className="cms-list">{items.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong><Menu size={17} /></div>)}</section></main>;
}
