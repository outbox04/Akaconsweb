'use client';

import Link from 'next/link';
import { Activity, FileText, Image, LayoutDashboard, Menu, MonitorPlay, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/cms', label: 'Tổng quan CMS', icon: LayoutDashboard },
  { href: '/admin/cms/posts', label: 'Bài viết', icon: FileText },
  { href: '/admin/live-preview', label: 'Trang & Live Preview', icon: MonitorPlay },
  { href: '/admin/cms/media', label: 'Thư viện hình ảnh', icon: Image },
  { href: '/admin/cms/menu', label: 'Menu website', icon: Menu },
  { href: '/admin/cms/settings', label: 'Thiết lập website', icon: Settings },
  { href: '/admin/cms/activity', label: 'Hoạt động', icon: Activity },
];

export function CmsNavigation() {
  const pathname = usePathname();
  return (
    <nav className="cms-navigation" aria-label="Điều hướng CMS">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin/cms' ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} className={active ? 'active' : ''}><Icon size={16} />{label}</Link>;
      })}
    </nav>
  );
}
