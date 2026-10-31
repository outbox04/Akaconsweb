"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import "./brand-home.css";

const finishes = [
  { name: "Hiệu ứng gỉ sét", image: "/home/finishes/texture-rust.png", house: "/home/finishes/house-rust.png" },
  { name: "Hiệu ứng đá khối", image: "/home/finishes/texture-stone.jpg", house: "/home/finishes/house-stone.png" },
  { name: "Đá hoa cương", image: "/home/finishes/texture-granite.jpg", house: "/home/finishes/house-granite.png" },
  { name: "Sơn vôi xanh", image: "/home/finishes/texture-limewash.jpg", house: "/home/finishes/house-limewash.png" },
  { name: "Bê tông ghi", image: "/home/finishes/texture-concrete.jpg", house: "/home/finishes/house-concrete.png" },
];

const rooms = [
  { name: "Phòng ngủ", slug: "bedroom", image: "/home/rooms/bedroom.png" },
  { name: "Phòng khách", slug: "living-room", image: "/home/rooms/living-room.png" },
  { name: "Phòng làm việc", slug: "office", image: "/home/rooms/office.png" },
];
const finishSlugs = ["rust", "stone", "granite", "limewash", "concrete"] as const;
const applicationFinishOrder = [4, 1, 2, 0, 3] as const;

const library = [
  ["Sơn đá", "/paints/xt-301.jpg"],
  ["Vữa hiệu ứng", "/paints/xt-101.png"],
  ["Sơn hiệu ứng bê tông", "/paints/xt-01.png"],
  ["Sơn hiệu ứng ánh kim", "/paints/mp-06.webp"],
  ["Sơn hiệu ứng gỉ sét", "/paints/xm-03.png"],
  ["Sơn vôi Limewash", "/paints/xv-180.jpg"],
] as const;

function FacetedStar() {
  return (
    <svg className="faceted-star" viewBox="0 0 100 100" aria-label="5 sao">
      <polygon points="50,2 50,50 38,36" fill="#07898d" />
      <polygon points="50,2 62,36 50,50" fill="#62ddd5" />
      <polygon points="62,36 98,38 50,50" fill="#92ebe4" />
      <polygon points="98,38 69,60 50,50" fill="#22b8b5" />
      <polygon points="69,60 80,96 50,50" fill="#76dfd8" />
      <polygon points="80,96 50,74 50,50" fill="#08797f" />
      <polygon points="50,74 20,96 50,50" fill="#32bcb8" />
      <polygon points="20,96 31,60 50,50" fill="#075f69" />
      <polygon points="31,60 2,38 50,50" fill="#0b8388" />
      <polygon points="2,38 38,36 50,50" fill="#67d8d1" />
    </svg>
  );
}

export default function BrandHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [finish, setFinish] = useState(1);
  const [applicationFinish, setApplicationFinish] = useState(4);
  const [room, setRoom] = useState<number | null>(null);

  return (
    <main className="surface-home">
      <header className="surface-nav">
        <Link href="/" className="surface-logo" aria-label="AKACONS trang chủ">
          <Image src="/brand/akacons-logo.png" alt="AKACONS" width={172} height={58} priority />
          <span>Surface Studio</span>
        </Link>
        <nav className={menuOpen ? "is-open" : ""}>
          <Link href="#about" onClick={() => setMenuOpen(false)}>Về AKACONS</Link>
          <Link href="#library" onClick={() => setMenuOpen(false)}>Bộ sưu tập</Link>
          <Link href="/ai" onClick={() => setMenuOpen(false)}>Thiết kế AI</Link>
          <Link className="mobile-consult" href="#contact" onClick={() => setMenuOpen(false)}>Nhận tư vấn</Link>
        </nav>
        <Link className="nav-cta" href="#contact">Nhận tư vấn</Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở trình đơn">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero">
        <div className="hero-surfaces" aria-hidden="true">
          {finishes.map((item, index) => <div key={item.name} className={finish === index ? "active" : ""} style={{ backgroundImage: `url(${item.image})` }} />)}
        </div>
        <div className="hero-copy">
          <p className="kicker">Nghệ thuật bề mặt</p>
          <h1><span>Kiến tạo không gian</span><span className="hero-line-two"><b>Đậm chất</b> <em data-shadow="riêng">riêng</em></span></h1>
          <h2>Bằng dịch vụ thi công <strong>tiêu chuẩn 5</strong><FacetedStar /></h2>
          <p>AKACONS tiên phong trong lĩnh vực tư vấn và thi công sơn hiệu ứng chuyên nghiệp.</p>
        </div>
        <div className="hero-house">
          {finishes.map((item, index) => <Image key={item.house} className={finish === index ? "active" : ""} src={item.house} alt={finish === index ? `Mặt tiền ${item.name}` : ""} fill priority={index === 1} sizes="(max-width:800px) 100vw, 58vw" />)}
        </div>
        <div className="finish-picker" aria-label="Chọn màu hoàn thiện mặt tiền">
          {finishes.map((item, index) => (
            <button key={item.name} className={finish === index ? "active" : ""} onClick={() => setFinish(index)} aria-label={item.name}>
              <Image src={item.image} alt="" fill sizes="60px" />
            </button>
          ))}
        </div>
      </section>

      <section className="reference-intro" id="about">
        <div className="reference-wrap reference-intro-grid">
          <p className="reference-eyebrow">Về AKACONS</p>
          <div>
            <h2>Kiến tạo giá trị<br />trên từng bề mặt</h2>
            <p>Hơn 10 năm tích luỹ kinh nghiệm thi công xây dựng cùng các đối tác lớn, AKACONS mang chuẩn mực của những dự án chuyên nghiệp đến từng không gian sống.</p>
            <Link href="/gioi-thieu" className="reference-link">Tìm hiểu về chúng tôi <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="reference-stats">
        <div className="reference-wrap">
          <p className="reference-eyebrow centered">AKACONS qua những con số</p>
          <div className="reference-stat-grid">
            <article><strong>1000<span>+</span></strong><i /><p>căn hộ, dự án, công trình đã thực hiện</p></article>
            <article><strong>1.5<span> triệu+</span></strong><i /><p>m² sơn hiệu ứng hoàn thiện</p></article>
            <article><strong>20<span>+</span></strong><i /><p>tỉnh thành trên toàn quốc</p></article>
          </div>
        </div>
      </section>

      <section className="signature">
        <div className="signature-surfaces" aria-hidden="true">
          {finishes.map((item, index) => <div key={item.name} className={applicationFinish === index ? "active" : ""} style={{ backgroundImage: `url(${item.image})` }} />)}
        </div>
        <div className="signature-copy">
          <p className="kicker">Không gian ứng dụng</p>
          <h2><span>Dấu ấn <em data-shadow="độc bản">độc bản</em></span><span>cho không gian đẳng cấp</span></h2>
          <p>Sơn hiệu ứng được ứng dụng linh hoạt trong nhà ở, nhà hàng, khách sạn và villa — nâng tầm trải nghiệm bằng chiều sâu vật liệu.</p>
          <div className="room-list">
            {rooms.map((item, index) => (
              <button key={item.name} className={room === index ? "active" : ""} onClick={() => setRoom(room === index ? null : index)}>
                <span><Image src={item.image} alt={item.name} fill sizes="130px" /></span>{item.name}
              </button>
            ))}
          </div>
          <div className="application-controls">
            <div className="swatches">
              {applicationFinishOrder.map((index) => { const item = finishes[index]; return <button key={item.name} onClick={() => setApplicationFinish(index)} className={applicationFinish === index ? "active" : ""}><Image src={item.image} alt={item.name} fill sizes="80px" /></button>; })}
            </div>
            <Link href="/ai" className="ai-button">Trợ lý chọn mẫu</Link>
          </div>
        </div>
        <div className="signature-visual">
          {finishes.map((item, index) => <Image key={item.house} className={`scene house-scene ${room === null && applicationFinish === index ? "active" : ""}`} src={item.house} alt={room === null && applicationFinish === index ? `Mặt tiền ${item.name}` : ""} fill sizes="(max-width: 800px) 100vw, 40vw" />)}
          {finishes.flatMap((item, finishIndex) => rooms.map((roomItem, roomIndex) => {
            const src = `/home/room-finishes/${finishSlugs[finishIndex]}-${roomItem.slug}.png`;
            const active = room === roomIndex && applicationFinish === finishIndex;
            return <Image key={src} className={`scene room-scene ${active ? "active" : ""}`} src={src} alt={active ? `${roomItem.name} · ${item.name}` : ""} fill sizes="(max-width: 800px) 100vw, 40vw" />;
          }))}
          <span>{room === null ? "Mặt tiền" : rooms[room].name} · {finishes[applicationFinish].name}</span>
        </div>
      </section>

      <section className="material-library" id="library">
        <p className="kicker">Thư viện vật liệu</p>
        <h2>Bề mặt tạo nên <em data-shadow="bản sắc">bản sắc</em> không gian</h2>
        <div className="library-grid">
          {library.map(([name, image]) => (
            <Link href="/bo-suu-tap" key={name}>
              <Image src={image} alt={name} fill sizes="(max-width:700px) 50vw, 32vw" />
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="reference-services">
        <div className="reference-wrap">
          <div className="reference-section-head"><div><p className="reference-eyebrow">Dịch vụ</p><h2>Hai cách để chọn<br />bề mặt cho ngôi nhà</h2></div><Link href="/bo-suu-tap" className="reference-link">Xem bộ sưu tập <ArrowRight size={18} /></Link></div>
          <div className="reference-service-grid">
            <Link href="/bo-suu-tap" className="reference-service-card"><span><Image src="/reference/636f28faa09a4491dd37d575029ba680.jpg" alt="Bộ sưu tập Heritage" fill sizes="(max-width: 800px) 100vw, 50vw" /></span><div><h3>Heritage</h3><p>Bộ sưu tập màu sắc và hiệu ứng có sẵn</p></div></Link>
            <Link href="/lien-he" className="reference-service-card"><span><Image src="/reference/1f72f9e9b93905513c961bebfcaab815.jpg" alt="Bề mặt Bespoke" fill sizes="(max-width: 800px) 100vw, 50vw" /></span><div><h3>Bespoke</h3><p>Màu sắc và hiệu ứng thiết kế riêng</p></div></Link>
          </div>
        </div>
      </section>

      <section className="reference-projects">
        <div className="reference-wrap"><div className="reference-section-head"><div><p className="reference-eyebrow">Dự án tiêu biểu</p><h2>Công trình đã hoàn thiện</h2></div><Link href="/projects" className="reference-outline">Tất cả dự án <ArrowRight size={18} /></Link></div></div>
        <div className="reference-project-track">
          {[
            ['/reference/8c1bfb9963794c47ef1091b83bbecb9e.jpg', 'Không gian thương mại', 'Dấu ấn bề mặt'],
            ['/reference/e3c9d59a77e099e7aeb935adea16d376.jpg', 'Biệt thự', 'Tinh tế trong từng lớp sơn'],
            ['/reference/1584ed0b3740ea657e81023a7663ad99.jpg', 'Nhà ở', 'Bề mặt mang cá tính riêng'],
          ].map(([image, type, title]) => <article key={image} className="reference-project-card"><Image src={image} alt={title} fill sizes="(max-width:800px) 86vw, 440px" /><div><small>{type}</small><h3>{title}</h3><p>Sơn hiệu ứng AKACONS</p></div></article>)}
        </div>
      </section>

      <section className="reference-process">
        <div className="reference-wrap"><div className="reference-section-head"><div><p className="reference-eyebrow">Quy trình</p><h2>Tổ chức và quản lý thi công chuyên nghiệp</h2></div><Link href="/lien-he" className="reference-link">Nhận tư vấn <ArrowRight size={18} /></Link></div>
          <div className="reference-process-grid">{['Khảo sát & tư vấn bề mặt', 'Lên phối cảnh & duyệt mẫu', 'Thi công theo tiêu chuẩn', 'Nghiệm thu & bảo hành'].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3></article>)}</div>
        </div>
      </section>

      <section className="service">
        <Image src="/reference/bf628f494ca4f0093e77fc70edf72a57.jpg" alt="Nghệ nhân AKACONS thi công sơn hiệu ứng" fill sizes="100vw" />
        <div>
          <p className="kicker">Chuẩn mực hoàn thiện khác biệt</p>
          <h2>Dịch vụ thi công<br />tiêu chuẩn <em>5★</em></h2>
          <p>AKACONS chuẩn hóa từng điểm chạm trong dịch vụ, mang đến sự an tâm tuyệt đối cho khách hàng.</p>
          <ol>
            <li><b>01</b> Dịch vụ đồng hành sớm</li>
            <li><b>02</b> Lên phối cảnh & duyệt mẫu thực tế</li>
            <li><b>03</b> Thi công chuyên nghiệp</li>
            <li><b>04</b> Kiểm soát chất lượng từng giai đoạn</li>
            <li><b>05</b> Nghiệm thu & bảo hành chủ động</li>
          </ol>
        </div>
      </section>

      <section className="contact" id="contact">
        <p className="kicker">Tư vấn mẫu miễn phí</p>
        <h2>Làm mới không gian sống<br />ngay hôm nay</h2>
        <p>Chia sẻ với chúng tôi về không gian của bạn. Đội ngũ AKACONS sẽ tư vấn màu sắc, hiệu ứng và gửi mẫu phù hợp.</p>
        <div>
          <a href="tel:+84900000000"><Phone size={18} /> Liên hệ ngay</a>
          <Link href="/lien-he">Gửi yêu cầu tư vấn <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
