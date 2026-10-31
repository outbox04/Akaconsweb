'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './public-site.css';

const navigation = [
  ['/gioi-thieu', 'Về AKACONS'],
  ['/bo-suu-tap', 'Bộ sưu tập'],
  ['/ma-son', 'Mã sơn'],
  ['/cong-cu', 'Công cụ AI'],
] as const;

export function PublicSite({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px' },
    );
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return <div className="public-site">
    <header className="public-header">
      <Link className="public-logo" href="/">
        <Image src="/reference/logo.png" alt="AKACONS" width={1680} height={645} priority />
      </Link>
      <nav className={open ? 'is-open' : ''}>
        {navigation.map(([href, label]) =>
          <Link className={pathname === href ? 'active' : ''} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>
        )}
      </nav>
      <Link className="public-cta" href="/lien-he">Nhận tư vấn <ArrowRight size={17} /></Link>
      <button className="public-menu" aria-label={open ? 'Đóng menu' : 'Mở menu'} onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </header>
    <main>{children}</main>
    <footer className="public-footer">
      <div><Image src="/reference/logo.png" alt="AKACONS" width={1680} height={645} /><p>Kiến tạo bề mặt. Khơi mở cảm xúc.<br />Sơn hiệu ứng thủ công cho không gian Việt.</p></div>
      <nav>{navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
      <div className="public-footer-contact"><a href="mailto:hello@akacons.vn">hello@akacons.vn</a><a href="tel:0900000000">0900 000 000</a><span>Việt Nam</span></div>
      <small>© 2026 AKACONS Surface Studio.</small>
    </footer>
  </div>;
}

export function PageHero({ index, eyebrow, title, accent, description }: { index: string; eyebrow: string; title: string; accent?: string; description: string }) {
  return <section className="page-hero">
    <div className="page-kicker" data-reveal><span>{index}</span><small>{eyebrow}</small></div>
    <div data-reveal><h1>{title}{accent && <> <em>{accent}</em></>}</h1><p>{description}</p></div>
  </section>;
}
