/* Nội dung website AKACONS – sửa nội dung tại đây, không cần sửa app.js */
(function () {
  const img = (id) => 'assets/img/' + id + '.jpg';

  // Các trang: key nội bộ -> anchor trên URL
  const PAGES = { home: 'trang-chu', about: 've-chung-toi', services: 'dich-vu', projects: 'du-an', process: 'quy-trinh', knowledge: 'kien-thuc', data: 'du-lieu', careers: 'tuyen-dung', studio: 'surface-studio', contact: 'lien-he' };

  const NAV = [
    { key: 'about', label: 'Về chúng tôi' },
    { key: 'services', label: 'Dịch vụ' },
    { key: 'projects', label: 'Dự án' },
    { key: 'process', label: 'Quy trình' },
    { key: 'knowledge', label: 'Kiến thức' },
    { key: 'data', label: 'Dữ liệu' },
    { key: 'careers', label: 'Tuyển dụng' },
    { key: 'contact', label: 'Liên hệ' }
  ];

  // Slide màn hình đầu; cls khớp với .hs-1 … .hs-6 trong styles.css
  const SLIDES = [
    { cls: 'hs-1', tab: 'Thi công chuyên nghiệp', eyebrow: 'AKACONS · Kiến tạo giá trị trên từng bề mặt', title: 'Đơn vị thi công\nsơn hiệu ứng\nchuyên nghiệp', body: 'Hơn 10 năm kinh nghiệm thi công cùng Vingroup, Petrolimex, Regal Group. AKACONS mang chuẩn mực của những đại dự án vào không gian sống của mỗi gia đình.' },
    { cls: 'hs-6', tab: 'Đội ngũ AKACONS', eyebrow: 'Đội ngũ AKACONS', title: 'Một đội ngũ,\nmột chuẩn mực', body: 'Kỹ sư, cán bộ kỹ thuật và đội thợ cùng làm việc trên một quy trình chuẩn hóa, để gia chủ an tâm từ ngày khởi công đến nhiều năm sau bàn giao.' },
    { cls: 'hs-2', tab: 'Tay nghề và tác phong', eyebrow: 'Đội ngũ thi công', title: 'Tay nghề vững,\ntác phong chuẩn mực', body: 'Mỗi công trình có cán bộ kỹ thuật phụ trách và đội thợ phù hợp với quy mô. Đội thợ mặc đồng phục, làm việc theo quy chuẩn tác phong của AKACONS.' },
    { cls: 'hs-3', tab: 'Heritage và Bespoke', eyebrow: 'Heritage · Bespoke', title: 'Mỗi bề mặt\nlà một độc bản', body: 'Chọn từ bộ sưu tập màu sắc và hiệu ứng có sẵn, xem mẫu thực tế trước khi quyết định, hoặc phát triển riêng theo ý tưởng của gia chủ và kiến trúc sư.' },
    { cls: 'hs-4', tab: 'Năng lực đại dự án', eyebrow: 'Năng lực đã kiểm chứng', title: 'Chuẩn mực thi công\ncủa những đại dự án', body: 'Đồng hành cùng Vingroup, Petrolimex, Regal Group với hơn 1,5 triệu m² sơn hiệu ứng hoàn thiện tại hơn 20 tỉnh thành.' },
    { cls: 'hs-5', tab: 'Nghiệm thu từng lớp', eyebrow: 'Kiểm soát chất lượng', title: 'Nghiệm thu từng lớp,\nđúng mẫu đã duyệt', body: 'Lớp trước đạt yêu cầu kỹ thuật mới chuyển sang lớp sau. Bảo hành bằng văn bản, phản hồi yêu cầu bảo hành trong vòng 24 giờ.' }
  ];

  const PROJECTS = [
    { name: 'Vinhomes Royal Island', kind: 'Dự án · 5 phân khu thấp tầng', place: 'Đảo Vũ Yên, Hải Phòng', area: '336.966', effect: 'Thiên thạch, Kẻ sọc, Sần gấm, Đá tự nhiên', owner: 'Chủ đầu tư: Vinhomes & Nomura Real Estate', img: img('3efd59ab0ccef4fa80e4392323f52f07') },
    { name: 'The Fullton', kind: 'Dự án · 692 căn', place: 'Vinhomes Ocean Park 3, Hưng Yên', area: '170.561', effect: 'Đá Travertine, Sần gấm, Sần vỏ cam', owner: 'Chủ đầu tư: Vinhomes & CapitaLand', img: img('2132f6cb6df720eb6f22d7e7e467d63a') },
    { name: 'Imperial Palace Đà Lạt', kind: 'Tổ hợp căn hộ, shophouse, khách sạn', place: 'Phường Lâm Viên, Đà Lạt', area: '22.610', effect: 'Đá hoa cương 5DX', owner: 'Chủ đầu tư: Petrolimex Lâm Đồng', img: img('d666f108898c42e8d7d77528d3638d02') },
    { name: 'Biệt thự Phù Ninh', kind: 'Biệt thự', place: 'Phù Ninh, Phú Thọ', area: '2.189', effect: 'Đá tự nhiên', owner: 'Công trình dân dụng', img: img('ef10057d33bde6888870c7651e775367') },
    { name: 'Khách sạn Imperial Lạng Sơn', kind: 'Khách sạn', place: '69 Lý Thường Kiệt, Lạng Sơn', area: '883', effect: 'Đá hoa cương 5DX', owner: 'Công trình khách sạn', img: img('98ecef6a9efcd015ae886406459564df') },
    { name: 'S - Hill Villa', kind: 'Biệt thự', place: 'Tuần Châu, Quảng Ninh', area: '548', effect: 'Vân xước ngang', owner: 'Công trình dân dụng', img: img('7e5d01d2d0a4d5982fd8d8cc90279416') },
    { name: 'Biệt thự Garden Hill', kind: 'Biệt thự', place: 'Tam Đảo, Vĩnh Phúc', area: '438', effect: 'Vân xước ngang', owner: 'Công trình dân dụng', img: img('49a85e1229901c63a0a79f4ac1295cc2') },
    { name: 'Nhà phố Hải Dương', kind: 'Nhà phố', place: 'Hải Dương', area: '433', effect: 'Đường kẻ mềm, Vân xước ngang', owner: 'Công trình dân dụng', img: img('bc85efcd2187ebc6b67eaabef3b8cabf') }
  ];

  const STEPS = [
    { img: img('fddaf70a1a2a7f9673805c9164e63112'), pos: 'center 40%', alt: 'Đội ngũ AKACONS họp phân công công việc', title: 'Tổ chức và điều phối nhân sự', body: 'Mỗi công trình có cán bộ kỹ thuật phụ trách và đội thợ phù hợp với quy mô; phân công rõ việc, phối hợp đồng bộ theo kế hoạch đã thống nhất với gia chủ.' },
    { img: img('185a2c6e9161cef2bd96b361ccc8a641'), pos: 'center', alt: 'Vật tư sơn hiệu ứng chuẩn bị tại công trình', title: 'Quản lý vật tư và logistics', body: 'Vật tư được kiểm tra nguồn gốc, chủng loại và số lượng trước khi đưa vào công trình; cung ứng đúng thời điểm để thi công không bị gián đoạn.' },
    { img: img('73f61e1565b2937a010cec417b13daeb'), pos: 'center 30%', alt: 'Thợ AKACONS đội mũ bảo hộ, mặc đồng phục', title: 'An toàn, tác phong và vệ sinh công trường', body: 'Tuân thủ quy định an toàn lao động; che chắn bảo vệ tài sản, giữ mặt bằng gọn gàng mỗi ngày; đội thợ mặc đồng phục, làm việc theo quy chuẩn tác phong của AKACONS.' },
    { img: img('227d44ef93c589ff0e3945b2f8adf827'), pos: 'center 25%', alt: 'Cán bộ kỹ thuật kiểm tra bề mặt sơn', title: 'Nghiệm thu từng lớp', body: 'Nghiệm thu từng lớp sơn cùng gia chủ; lớp trước đạt yêu cầu kỹ thuật mới chuyển sang lớp sau, bảo đảm bề mặt hoàn thiện đúng mẫu đã duyệt.' },
    { img: img('eaba6b1f48d94ae4e44c46b66bb4abbf'), pos: 'center 25%', alt: 'Cán bộ kỹ thuật ghi nhận tiến độ tại công trình', title: 'Cập nhật tiến độ hằng ngày', body: 'Hình ảnh và tiến độ thi công được báo cáo hằng ngày, giúp gia chủ nắm rõ tình hình công trình mà không cần có mặt thường xuyên.' },
    { img: img('75c179584a431dc681adbc5eea762a6e'), pos: 'center 25%', alt: 'Cán bộ AKACONS kiểm tra công trình sau bàn giao', title: 'Bảo hành minh bạch, bảo trì chủ động', body: 'Bảo hành bằng văn bản với chính sách rõ ràng; phản hồi yêu cầu bảo hành trong vòng 24 giờ; bảo trì chủ động theo các mốc 30, 90 và 180 ngày sau bàn giao.' }
  ];

  const EFFECTS = [
    { name: 'Giả đá hoa cương 5DX', used: 'Imperial Palace Đà Lạt, Khách sạn Imperial Lạng Sơn' },
    { name: 'Giả đá tự nhiên', used: 'Vinhomes Royal Island, Biệt thự Phù Ninh' },
    { name: 'Stucco Travertine', used: 'The Fullton' },
    { name: 'Stucco Vân vải', used: '' },
    { name: 'Stucco Thiên thạch', used: 'Vinhomes Royal Island' },
    { name: 'Stucco Sần gấm', used: 'The Fullton, Vinhomes Royal Island' },
    { name: 'Stucco Sần cam', used: 'The Fullton' }
  ];

  const KCATS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'basic', label: 'Kiến thức sơn hiệu ứng' },
    { key: 'choose', label: 'Chọn hiệu ứng' },
    { key: 'build', label: 'Thi công và nghiệm thu' },
    { key: 'care', label: 'Bảo trì' }
  ];

  const ARTICLES = [
    { cat: 'basic', title: 'Sơn hiệu ứng là gì và khác gì sơn thông thường?', img: img('636f28faa09a4491dd37d575029ba680') },
    { cat: 'choose', title: 'Phân biệt Stucco Travertine, Sần gấm và Sần cam', img: img('1f72f9e9b93905513c961bebfcaab815') },
    { cat: 'choose', title: 'Đá hoa cương 5DX phù hợp với công trình nào?', img: img('d666f108898c42e8d7d77528d3638d02') },
    { cat: 'build', title: 'Vì sao cần nghiệm thu từng lớp sơn?', img: img('227d44ef93c589ff0e3945b2f8adf827') },
    { cat: 'build', title: 'Che chắn bảo vệ tài sản khi thi công tại nhà', img: img('73f61e1565b2937a010cec417b13daeb') },
    { cat: 'care', title: 'Bảo trì bề mặt sơn hiệu ứng sau bàn giao', img: img('75c179584a431dc681adbc5eea762a6e') }
  ];

  // Thêm href: 'files/ten-file.pdf' vào từng mục để nút "Tải về" trỏ tới file thật
  const DOCS = [
    { name: 'Hồ sơ năng lực AKACONS', desc: 'Giới thiệu năng lực, quy trình và dự án tiêu biểu', fmt: 'PDF', ready: true },
    { name: 'Phiếu cam kết bảo hành', desc: 'Chính sách bảo hành bằng văn bản', fmt: 'DOCX', ready: true },
    { name: 'Phiếu yêu cầu thi công', desc: 'Thông tin gia chủ cung cấp trước khi khảo sát', fmt: 'DOCX', ready: true },
    { name: 'Quy trình che chắn', desc: 'Bảo vệ nội thất, sàn, cửa trong quá trình thi công', fmt: 'PDF', ready: true },
    { name: 'Quy chuẩn tác phong', desc: 'Quy chuẩn làm việc của đội ngũ tại công trình', fmt: 'PDF', ready: true },
    { name: 'Quy trình nghiệm thu và bàn giao', desc: 'Các mốc nghiệm thu cùng gia chủ', fmt: 'DOCX', ready: true },
    { name: 'Quy trình xử lý bảo hành', desc: 'Tiếp nhận, kiểm tra và hoàn thành bảo hành', fmt: 'DOCX', ready: true },
    { name: 'Bộ sưu tập Heritage', desc: 'Catalogue màu sắc và hiệu ứng có sẵn', fmt: 'PDF', ready: false },
    { name: 'Hướng dẫn bảo trì bề mặt', desc: 'Vệ sinh và bảo trì sơn hiệu ứng sau bàn giao', fmt: 'PDF', ready: false }
  ];

  const D = (fmt, name) => ({ fmt, name });
  const DEPTS = [
    { label: 'Phát triển thị trường', groups: [
      { title: 'Quy chế - Quy trình', items: [D('XLSX', 'Bảng phân loại khách hàng'), D('DOCX', 'Chính sách giá thanh toán tiêu bản'), D('DOCX', 'Quy chế phân loại chăm sóc khách hàng'), D('DOCX', 'Quy trình kinh doanh')] },
      { title: 'Biểu mẫu - Hợp đồng', items: [D('DOCX', 'Hợp đồng khoán trọn gói'), D('DOCX', 'Hợp đồng đơn giá cố định'), D('DOCX', 'Phiếu cam kết bảo hành'), D('DOCX', 'Phiếu yêu cầu thi công'), D('DOCX', 'Phụ lục phát sinh')] }
    ] },
    { label: 'Thi công', groups: [
      { title: 'Quy chế - Quy trình', items: [D('XLSX', 'Định mức Stucco Eco'), D('DOCX', 'Hợp đồng nguyên tắc tổ đội'), D('DOCX', 'Hợp đồng giao khoán tổ đội'), D('PDF', 'Quy trình che chắn'), D('DOCX', 'Quy trình nghiệm thu và bàn giao'), D('DOCX', 'Quy trình vật tư'), D('DOCX', 'Quy trình xử lý bảo hành')] },
      { title: 'Biểu mẫu', items: [D('DOCX', 'Biên bản bàn giao đưa vào sử dụng'), D('DOCX', 'Biên bản bàn giao hiện trạng'), D('DOCX', 'Biên bản chấp thuận tiêu bản'), D('DOCX', 'Biên bản hoàn thành bảo hành'), D('DOCX', 'Biên bản khảo sát hiện trường'), D('DOCX', 'Biên bản kiểm tra hiện trường bảo hành'), D('DOCX', 'Biên bản nghiệm thu che chắn'), D('DOCX', 'Biên bản nghiệm thu theo mốc'), D('DOCX', 'Biên bản nghiệm thu vật tư tập kết'), D('DOCX', 'Biên bản xác nhận khối lượng hoàn thành'), D('DOCX', 'Checklist nghiệm thu tổng thể'), D('DOCX', 'Hồ sơ đề xuất kỹ thuật'), D('DOCX', 'Kế hoạch thi công'), D('DOCX', 'Nhật ký thi công'), D('DOCX', 'Phiếu tiếp nhận yêu cầu bảo hành'), D('XLSX', 'Phiếu yêu cầu vật tư'), D('DOCX', 'Thông báo từ chối tiếp nhận bề mặt'), D('DOCX', 'Văn bản chủ đầu tư tự chịu rủi ro')] }
    ] },
    { label: 'Kế toán - Cung ứng', groups: [
      { title: 'Quy chế - Quy trình', items: [D('DOCX', 'Quy trình thanh toán và quyết toán')] },
      { title: 'Biểu mẫu', items: [D('DOCX', 'Đề nghị thanh toán khách hàng'), D('XLSX', 'Mẫu biểu kế toán'), D('XLSX', 'Đề nghị thanh toán tổ đội'), D('DOCX', 'Quyết toán hợp đồng đơn giá cố định'), D('DOCX', 'Quyết toán hợp đồng khoán trọn gói'), D('DOCX', 'Quyết toán tổ đội')] }
    ] },
    { label: 'Hành chính - Nhân sự', groups: [
      { title: 'Quy chế - Quy trình', items: [D('PDF', 'Quy chuẩn tác phong'), D('DOCX', 'Quy chế quản lý văn bản')] },
      { title: 'Biểu mẫu', items: [D('DOC', 'NS-01 Phiếu đề nghị bổ sung nhân sự'), D('XLS', 'NS-02 Đánh giá tuyển dụng'), D('DOCX', 'NS-03 Đơn xin nghỉ việc'), D('DOC', 'NS-04 Biên bản bàn giao công việc'), D('DOCX', 'NS-05 Biên bản bàn giao hồ sơ tài liệu'), D('DOC', 'NS-06 Biên bản bàn giao tài sản công cụ'), D('DOCX', 'NS-07 Cam kết nghỉ việc'), D('DOC', 'NS-08 Phiếu xác nhận nghỉ việc'), D('DOCX', 'NS-09 Phiếu đăng ký sử dụng xe công ty'), D('DOCX', 'NS-10 Đơn xin nghỉ phép')] }
    ] }
  ];

  const ROLES = ['Cán bộ kỹ thuật hiện trường', 'Thợ thi công sơn hiệu ứng', 'Nhân viên kinh doanh', 'Nhân viên văn phòng'];

  const STUDIO_COLORS = [
    { name: 'Trắng ngà', hex: '#EDE6D8' },
    { name: 'Be cát', hex: '#D8C3A0' },
    { name: 'Xám đá', hex: '#9C9A94' },
    { name: 'Ghi đậm', hex: '#5E6166' },
    { name: 'Đất nung', hex: '#B5653F' },
    { name: 'Xanh rêu', hex: '#7A8466' }
  ];
  // Kích thước vân cho từng hiệu ứng (theo thứ tự EFFECTS)
  const STUDIO_TEX = ['220px', '420px', '520px', '300px', '160px', '260px', '200px'];

  const SOCIAL = [
    { label: 'Facebook AKACONS', href: 'https://www.facebook.com/akaconssonhieuung', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.6V10h3.6l-.5 3.8H14V22h-3.9v-8.2H7V10h3.1V8.1C10.1 5.3 11.7 3 15 3c1.2 0 2.4.2 2.4.2v3.4h-1.6C14.4 6.6 14 7.4 14 8.6z"/></svg>' },
    { label: 'TikTok AKACONS', href: '#', svg: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.2 2c.3 2.4 1.8 4.1 4.3 4.3v3.4c-1.6 0-3-.5-4.3-1.3v6.9a6.2 6.2 0 1 1-6.2-6.2c.3 0 .6 0 .9.1v3.5a2.8 2.8 0 1 0 1.9 2.6V2h3.4z"/></svg>' },
    { label: 'YouTube AKACONS', href: '#', svg: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.4 3.2z"/></svg>' },
    { label: 'Zalo AKACONS', href: 'https://zalo.me/0568717712', text: 'Zalo' }
  ];

  const SEARCH_SUGGEST = ['Travertine', 'Đá hoa cương 5DX', 'Bảo hành', 'Nghiệm thu', 'Royal Island', 'Tuyển dụng'];

  window.AKA = { PAGES, NAV, SLIDES, PROJECTS, STEPS, EFFECTS, KCATS, ARTICLES, DOCS, DEPTS, ROLES, STUDIO_COLORS, STUDIO_TEX, SOCIAL, SEARCH_SUGGEST };
})();
