'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RoleName, PERMISSION_MATRIX } from '@/lib/permissions/rbac';

interface SidebarProps {
  currentRole: RoleName;
  onRoleChange: (role: RoleName) => void;
}

const NAV_ITEMS = [
  { key: 'dashboard', href: '/', label: 'Bảng điều khiển', icon: '◆', group: 'Tổng quan' },
  { key: 'customers', href: '/customers', label: 'Khách hàng', icon: '◐', group: 'CRM' },
  { key: 'projects', href: '/projects', label: 'Công trình', icon: '▣', group: 'CRM' },
  { key: 'studio', href: '/studio', label: 'Studio Render AI', icon: '✦', group: 'Sản xuất' },
  { key: 'pricing', href: '/pricing', label: 'Dự toán & Bảng giá', icon: '฿', group: 'Kinh doanh' },
  { key: 'quotes', href: '/quotes', label: 'Báo giá', icon: '▤', group: 'Kinh doanh' },
  { key: 'materials', href: '/admin/materials', label: 'CRM vật liệu', icon: '◩', group: 'Hệ thống' },
  { key: 'cms', href: '/admin/cms', label: 'Website CMS', icon: '◈', group: 'Hệ thống' },
  { key: 'live_preview', href: '/admin/live-preview', label: 'Live preview website', icon: '◈', group: 'Hệ thống' },
  { key: 'admin', href: '/admin', label: 'Quản trị hệ thống', icon: '⚙', group: 'Hệ thống' },
];

export function Sidebar({ currentRole, onRoleChange }: SidebarProps) {
  const pathname = usePathname();
  const allowedKeys = PERMISSION_MATRIX[currentRole] || [];

  const visibleNavs = NAV_ITEMS.filter(
    (item) => allowedKeys.includes('*') || allowedKeys.includes(item.key)
  );

  const groups = Array.from(new Set(visibleNavs.map((i) => i.group)));

  return (
    <aside className="w-64 bg-[#1C2321] text-[#EFEAE1] flex flex-col h-screen sticky top-0 z-20 shrink-0 border-r border-white/10">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex gap-1.5 mb-2.5">
          <div className="w-3 h-3 rounded-sm bg-[#A6592C]" />
          <div className="w-3 h-3 rounded-sm bg-[#5B6B4F]" />
          <div className="w-3 h-3 rounded-sm bg-[#46586B]" />
          <div className="w-3 h-3 rounded-sm bg-[#B8862B]" />
        </div>
        <div className="font-serif text-xl font-bold tracking-tight text-[#FAF7F2]">
          Sơn Hiệu Ứng Việt
        </div>
        <div className="text-[10.5px] uppercase tracking-widest text-[#A8A090] mt-0.5 font-medium">
          Nền tảng vận hành AI
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {groups.map((groupName) => (
          <div key={groupName}>
            <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#8B8375]">
              {groupName}
            </div>
            <div className="space-y-0.5 mt-1">
              {visibleNavs
                .filter((item) => item.group === groupName)
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#A6592C] text-white font-semibold shadow-md'
                          : 'text-[#D8D2C4] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-base opacity-90">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Role Switcher */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
          Xem theo vai trò
        </label>
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value as RoleName)}
          className="w-full bg-[#2A322F] text-[#EFEAE1] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#A6592C]"
        >
          <option value="sale">Sale (Kinh doanh)</option>
          <option value="technician">Kỹ thuật (Duyệt AI)</option>
          <option value="manager">Quản lý (Duyệt giá/Quote)</option>
          <option value="admin">Admin (Hệ thống)</option>
          <option value="customer">Khách hàng (Public Token)</option>
        </select>
        <div className="text-[10.5px] text-[#A8A090] mt-1.5 leading-snug">
          Phân quyền linh hoạt theo RBAC Matrix mục 5.
        </div>
      </div>
    </aside>
  );
}
