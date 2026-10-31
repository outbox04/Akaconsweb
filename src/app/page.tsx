'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleName } from '@/lib/permissions/rbac';
import BrandHome from '@/components/brand-home';

function DashboardPage() {
  const [role, setRole] = useState<RoleName>('sale');
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'pricing' | 'quotes' | 'admin'>('overview');

  const roleLabels: Record<RoleName, string> = {
    sale: 'Sale (Kinh doanh)',
    technician: 'Kỹ thuật (Duyệt AI)',
    manager: 'Quản lý (Duyệt giá)',
    admin: 'Admin (Hệ thống)',
    super_admin: 'Super Admin',
    customer: 'Khách hàng Public',
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      {/* Sidebar Navigation */}
      <Sidebar currentRole={role} onRoleChange={(r) => setRole(r)} />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Bảng Điều Khiển Tổng Quan"
          roleLabel={roleLabels[role]}
          avatarInitial={role.charAt(0).toUpperCase()}
        />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1C2321]">
                Chào buổi sáng, {roleLabels[role]} 👋
              </h1>
              <p className="text-sm text-[#6B6459] mt-1">
                Hệ thống vận hành Sơn Hiệu Ứng Việt · Kết nối Supabase PostgreSQL & OpenAI API
              </p>
            </div>
            <Button variant="copper">+ Khởi tạo Công trình mới</Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Card hoverable>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6459]">
                Công trình đang chạy
              </div>
              <div className="text-3xl font-serif font-bold text-[#1C2321] mt-2">12</div>
              <div className="text-xs text-[#5B6B4F] mt-1.5 font-medium">trên tổng 18 dự án</div>
            </Card>

            <Card hoverable>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6459]">
                Chờ duyệt Render AI
              </div>
              <div className="text-3xl font-serif font-bold text-[#1C2321] mt-2">2</div>
              <div className="text-xs text-[#B8862B] mt-1.5 font-medium">Cần Kỹ thuật / Quản lý duyệt</div>
            </Card>

            <Card hoverable>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6459]">
                Báo giá đang gửi
              </div>
              <div className="text-3xl font-serif font-bold text-[#1C2321] mt-2">5</div>
              <div className="text-xs text-[#6B6459] mt-1.5 font-medium">Chờ phản hồi từ khách</div>
            </Card>

            <Card hoverable>
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6459]">
                Doanh thu đã chốt
              </div>
              <div className="text-2xl font-serif font-bold text-[#A6592C] mt-2">142.500.000 đ</div>
              <div className="text-xs text-[#5B6B4F] mt-1.5 font-medium">Tháng này</div>
            </Card>
          </div>

          {/* Project List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold font-serif text-[#1C2321]">Công trình tiến độ mới nhất</h2>
              <Button variant="outline" size="sm">Xem tất cả →</Button>
            </div>

            <div className="bg-white rounded-xl border border-[#DED6C6] overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0EBE1] text-xs uppercase text-[#6B6459] font-bold border-b border-[#DED6C6]">
                  <tr>
                    <th className="p-3.5">Mã công trình</th>
                    <th className="p-3.5">Tên công trình</th>
                    <th className="p-3.5">Khách hàng</th>
                    <th className="p-3.5">Loại</th>
                    <th className="p-3.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  <tr className="hover:bg-[#FAF7F2] transition-colors cursor-pointer">
                    <td className="p-3.5 font-mono text-xs">CT-2026-000001</td>
                    <td className="p-3.5 font-semibold">Biệt thự mặt tiền - Trần Phú</td>
                    <td className="p-3.5">Nguyễn Văn Long</td>
                    <td className="p-3.5"><Badge variant="dim">Ngoại thất</Badge></td>
                    <td className="p-3.5"><Badge variant="ochre">Chờ duyệt AI render</Badge></td>
                  </tr>
                  <tr className="hover:bg-[#FAF7F2] transition-colors cursor-pointer">
                    <td className="p-3.5 font-mono text-xs">CT-2026-000002</td>
                    <td className="p-3.5 font-semibold">Phòng khách chung cư cao cấp</td>
                    <td className="p-3.5">Trần Thị Hoa</td>
                    <td className="p-3.5"><Badge variant="dim">Nội thất</Badge></td>
                    <td className="p-3.5"><Badge variant="copper">Đã gửi báo giá</Badge></td>
                  </tr>
                  <tr className="hover:bg-[#FAF7F2] transition-colors cursor-pointer">
                    <td className="p-3.5 font-mono text-xs">CT-2026-000003</td>
                    <td className="p-3.5 font-semibold">Tường rào biệt thự sân vườn</td>
                    <td className="p-3.5">Nguyễn Văn Long</td>
                    <td className="p-3.5"><Badge variant="dim">Ngoại thất</Badge></td>
                    <td className="p-3.5"><Badge variant="sage">Khách đã chốt</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [hash, setHash] = useState('');
  const legacySectionHash = hash === '#about' || hash === '#library' || hash === '#contact';

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.toLowerCase());
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    if (!legacySectionHash) return;
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
  }, [hash, legacySectionHash]);

  // These anchors are part of the existing React public site.  Do not send
  // them into the imported visual source, which has its own internal routing.
  if (legacySectionHash) {
    return <BrandHome />;
  }

  return (
    <iframe
      title="AKACONS"
      src="/akacons-website-source/index.html"
      className="akacons-source-frame"
    />
  );
}
