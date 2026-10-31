/* AKACONS – điều khiển giao diện: chuyển trang, slide, bộ đếm, tìm kiếm, Dữ liệu, Surface Studio */
(function () {
  const A = window.AKA;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const pad = (i) => (i + 1 < 10 ? '0' : '') + (i + 1);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arrow = (size) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const dlIcon = (size) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>';
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
  const anchorToPage = Object.fromEntries(Object.entries(A.PAGES).map(([k, v]) => [v, k]));

  const state = { page: 'home', phase: 'idle', slide: 0, step: 0, kcat: 'all', dtab: 'pub', dlog: false, ddept: 0, dq: '', sdFx: 2, sdColor: 1, sdImg: null, sdGen: 'done', sdSplit: 50 };

  /* ---------- Điều hướng ---------- */
  function renderNav() {
    const link = (n, cls) => '<a href="#' + A.PAGES[n.key] + '" class="' + cls + '" data-nav="' + n.key + '">' + esc(n.label) + '</a>';
    $('#nav-main').innerHTML = A.NAV.map((n) => link(n, 'nl')).join('');
    $('#nav-mobile').innerHTML = A.NAV.map((n) => link(n, 'mm-link')).join('');
    $('#nav-footer').insertAdjacentHTML('beforeend', A.NAV.map((n) => link(n, 'nl')).join(''));
    const soc = A.SOCIAL.map((s) => s.href === '#'
      ? '<span class="soc' + (s.text ? ' soc-zalo' : '') + '" aria-label="' + esc(s.label) + '">' + (s.svg || s.text) + '</span>'
      : '<a class="soc' + (s.text ? ' soc-zalo' : '') + '" href="' + s.href + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' + (s.svg || s.text) + '</a>').join('');
    $$('[data-social]').forEach((el) => { el.innerHTML = soc; });
  }

  function initStatCounters() {
    const counters = $$('.about-stat strong[data-count]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = (el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const value = $('.count-value', el), target = Number(el.dataset.count), decimals = Number(el.dataset.decimals || 0);
      const format = (n) => n.toFixed(decimals).replace('.', ',');
      if (reduceMotion) { value.textContent = format(target); return; }
      const start = performance.now(), duration = 1350;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        value.textContent = format(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      value.textContent = format(0);
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); }
    }), { threshold: 0.45 });
    counters.forEach((counter) => observer.observe(counter));
  }

  function markNav() {
    $$('#nav-main a').forEach((a) => {
      const on = a.dataset.nav === state.page;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const cta = $('.head-cta');
    if (state.page === 'studio') cta.setAttribute('aria-current', 'page'); else cta.removeAttribute('aria-current');
    $$('.mbn-link[data-nav]').forEach((link) => {
      const on = link.dataset.nav === state.page;
      link.classList.toggle('on', on);
      if (on) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }

  function showPage(p) {
    state.page = p;
    $$('main[data-page]').forEach((m) => { m.hidden = m.dataset.page !== p; });
    $('#cta').hidden = p === 'contact';
    markNav();
    if (p === 'home') { startTimer(); watchStats(); }
  }

  function scrollTop() { try { window.scrollTo(0, 0); } catch (e) {} }

  /* One shared, passive scroll observer for the story position indicator. */
  function updateStoryProgress() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const bar = $('#story-progress-bar');
    if (bar) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, window.scrollY / max)) + ')';
  }

  function closeOverlays() { setMenu(false); setSearch(false); }

  const curtain = $('#curtain');
  function go(p, push) {
    if (!A.PAGES[p] || state.phase !== 'idle') return;
    if (push) history.pushState(null, '', '#' + A.PAGES[p]);
    if (p === state.page) { closeOverlays(); scrollTop(); return; }
    closeOverlays();
    $('#root').classList.remove('first');
    state.phase = 'cover';
    curtain.className = 'pg-curtain cover';
    setTimeout(() => {
      showPage(p);
      state.phase = 'reveal';
      curtain.className = 'pg-curtain reveal';
      scrollTop();
      setTimeout(() => { state.phase = 'idle'; curtain.className = 'pg-curtain'; }, 800);
    }, 700);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const p = anchorToPage[a.getAttribute('href').slice(1)];
    if (!p) { if (a.getAttribute('href') === '#') e.preventDefault(); return; }
    e.preventDefault();
    go(p, true);
  });
  window.addEventListener('popstate', () => go(anchorToPage[location.hash.slice(1)] || 'home', false));
  window.addEventListener('scroll', updateStoryProgress, { passive: true });
  window.addEventListener('resize', updateStoryProgress, { passive: true });

  /* ---------- Menu và tìm kiếm ---------- */
  function setMenu(open) { $('#mmenu').hidden = !open; }
  function setSearch(open) {
    $('#srch').hidden = !open;
    if (open) { setMenu(false); const q = $('#site-q'); q.value = ''; renderSearch(); q.focus(); }
  }

  const IDX = [
    { type: 'Trang', title: 'Về AKACONS', desc: 'Câu chuyện, sứ mệnh, tầm nhìn, đội ngũ và thư ngỏ', page: 'about' },
    { type: 'Trang', title: 'Dịch vụ Heritage và Bespoke', desc: 'Bộ sưu tập có sẵn và thiết kế riêng, bảy dòng sơn hiệu ứng', page: 'services' },
    { type: 'Trang', title: 'Dự án', desc: 'Các công trình AKACONS đã hoàn thiện', page: 'projects' },
    { type: 'Trang', title: 'Quy trình thi công, bảo hành và bảo trì', desc: 'Sáu nguyên tắc tổ chức thi công; phản hồi bảo hành 24 giờ; bảo trì 30, 90, 180 ngày', page: 'process' },
    { type: 'Trang', title: 'Kiến thức', desc: 'Bài viết về sơn hiệu ứng, chọn hiệu ứng, thi công và bảo trì', page: 'knowledge' },
    { type: 'Trang', title: 'Dữ liệu và tài liệu tải về', desc: 'Hồ sơ năng lực, quy trình, chính sách bảo hành', page: 'data' },
    { type: 'Trang', title: 'Tuyển dụng', desc: 'Làm việc tại AKACONS, nhóm vị trí, gửi hồ sơ ứng tuyển', page: 'careers' },
    { type: 'Công cụ', title: 'Surface Studio', desc: 'Phối thử sơn hiệu ứng lên ảnh công trình bằng AI', page: 'studio' },
    { type: 'Liên hệ', title: 'Liên hệ và đăng ký khảo sát', desc: 'Hotline 0568.717.712 · lienhe@akacons.vn · 18BT1-X2 Bắc Linh Đàm, Hà Nội', page: 'contact' }
  ]
    .concat(A.PROJECTS.map((p) => ({ type: 'Dự án', title: p.name, desc: p.place + ' · ' + p.effect + ' · ' + p.area + ' m²', page: 'projects' })))
    .concat(A.EFFECTS.map((f) => ({ type: 'Hiệu ứng', title: f.name, desc: f.used ? 'Đã thi công: ' + f.used : 'Dòng sơn hiệu ứng AKACONS thi công', page: 'services' })))
    .concat(A.STEPS.map((s) => ({ type: 'Quy trình', title: s.title, desc: s.body, page: 'process' })))
    .concat(A.ARTICLES.map((a) => ({ type: 'Kiến thức', title: a.title, desc: 'Bài viết đang được biên soạn', page: 'knowledge' })))
    .concat(A.DOCS.map((d) => ({ type: 'Tài liệu', title: d.name, desc: d.desc + ' · ' + d.fmt, page: 'data' })));

  function renderSearch() {
    const raw = $('#site-q').value;
    const q = norm(raw).trim();
    $('#sr-suggest-wrap').hidden = !!q;
    $('#sr-results-wrap').hidden = !q;
    if (!q) return;
    const res = IDX.filter((it) => norm(it.title + ' ' + it.desc + ' ' + it.type).includes(q)).slice(0, 14);
    $('#sr-count').textContent = res.length
      ? res.length + ' kết quả cho “' + raw.trim() + '”'
      : 'Không tìm thấy kết quả cho “' + raw.trim() + '”. Thử từ khóa khác hoặc liên hệ hotline 0568.717.712.';
    $('#sr-results').innerHTML = res.map((r) =>
      '<a href="#' + A.PAGES[r.page] + '" class="sr-item"><span class="sr-type">' + esc(r.type) + '</span>' +
      '<span style="flex: 1;"><span class="sr-t" style="display: block;">' + esc(r.title) + '</span><span style="display: block; margin-top: 4px; font-size: 14px; line-height: 22px; color: #B7C2D4;">' + esc(r.desc) + '</span></span>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3FB8B5" stroke-width="1.5" aria-hidden="true" style="flex: none; align-self: center;"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>').join('');
  }

  $('#sr-suggest').innerHTML = A.SEARCH_SUGGEST.map((s) => '<button type="button" class="chip" data-suggest="' + esc(s) + '">' + esc(s) + '</button>').join('');
  $('#sr-suggest').addEventListener('click', (e) => { const b = e.target.closest('[data-suggest]'); if (b) { $('#site-q').value = b.dataset.suggest; renderSearch(); } });
  $('#site-q').addEventListener('input', renderSearch);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlays(); });

  /* ---------- Slide màn hình đầu ---------- */
  function renderHero() {
    $('#hero-bgs').innerHTML = A.SLIDES.map((s) => '<div class="hs ' + s.cls + '" aria-hidden="true"></div>').join('');
    $('#hero-texts').innerHTML = A.SLIDES.map((s) =>
      '<div class="st"><p class="big-h ht" style="margin: 0; font-size: 60px; line-height: 68px; font-weight: 200; letter-spacing: -0.01em; color: #FFFFFF;">' + esc(s.title).replace(/\n/g, '<br>') + '</p>' +
      '<p style="margin: 28px 0 0; font-size: 17px; line-height: 28px; color: #D5DCE6;">' + esc(s.body) + '</p></div>').join('');
    $('#hero-tabs').innerHTML = A.SLIDES.map((s, i) =>
      '<button type="button" class="hs-tab" data-slide="' + i + '" aria-label="Slide ' + pad(i) + ': ' + esc(s.tab) + '">' +
      '<span class="hs-no" style="display: block; font-size: 13px; letter-spacing: 0.1em;">' + pad(i) + '</span>' +
      '<span class="hs-label" style="margin-top: 8px; font-size: 15px; line-height: 22px;">' + esc(s.tab) + '</span></button>').join('');
    updateHero();
  }

  function updateHero() {
    const hi = state.slide;
    $$('#hero-bgs .hs').forEach((el, i) => { const on = i === hi; el.classList.toggle('is-active', on); el.style.opacity = on ? 1 : 0; el.style.transform = 'scale(' + (on ? 1 : 1.08) + ')'; });
    $$('#hero-texts .st').forEach((el, i) => {
      const on = i === hi;
      el.style.opacity = on ? 1 : 0;
      el.style.transform = 'translateY(' + (on ? '0px' : (i > hi ? '24px' : '-24px')) + ')';
      el.style.pointerEvents = on ? 'auto' : 'none';
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $$('#hero-tabs .hs-tab').forEach((el, i) => {
      const on = i === hi;
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('.hs-no', el).style.color = on ? '#3FB8B5' : 'rgba(244,246,249,0.7)';
      $('.hs-label', el).style.color = on ? '#FFFFFF' : 'rgba(244,246,249,0.7)';
      const prog = $('.hs-prog', el);
      if (prog) prog.remove();
      if (on) el.insertAdjacentHTML('afterbegin', '<span class="hs-prog"></span>');
    });
    $('#hero-no').textContent = pad(hi);
  }

  let timer;
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => { if (state.page === 'home') { state.slide = (state.slide + 1) % 6; updateHero(); } }, 7000);
  }
  function goSlide(i) { state.slide = (i + 6) % 6; updateHero(); startTimer(); }
  $('#hero-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-slide]'); if (b) goSlide(Number(b.dataset.slide)); });

  /* ---------- Bộ đếm số liệu ---------- */
  let io;
  function watchStats() {
    const els = $$('[data-count]').filter((el) => !el.dataset.done);
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') { els.forEach((el) => setCount(el, 1)); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.target.dataset.done) return;
        en.target.dataset.done = '1';
        io.unobserve(en.target);
        runCount(en.target);
      });
    }, { threshold: 0.75 });
    els.forEach((el) => io.observe(el));
  }
  function setCount(el, e) {
    const v = Number(el.dataset.count) * e;
    const dec = Number(el.dataset.dec);
    $('.num', el).textContent = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
  }
  function runCount(el) {
    const dur = 2200, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setCount(el, 1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Dải dự án trượt ngang ---------- */
  function renderMarquee() {
    const P = A.PROJECTS;
    $('#pj-track').innerHTML = P.concat(P).map((p, i) =>
      '<article class="pj-card"' + (i >= P.length ? ' aria-hidden="true"' : '') + '>' +
      '<div class="pj-img"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"></div><div class="pj-shade"></div>' +
      '<div class="pj-info"><div style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #3FB8B5;">' + esc(p.kind) + '</div>' +
      '<div style="margin-top: 10px; font-size: 30px; line-height: 36px; font-weight: 200; color: #FFFFFF;">' + esc(p.name) + '</div>' +
      '<div style="margin-top: 6px; font-size: 15px; color: #D5DCE6;">' + esc(p.place) + '</div>' +
      '<div class="pj-meta"><span style="font-size: 14px; line-height: 20px; color: #D5DCE6;">' + esc(p.effect) + '</span>' +
      '<span style="text-align: right; white-space: nowrap;"><span style="display: block; font-size: 26px; line-height: 30px; font-weight: 200; color: #FFFFFF;">' + p.area + '<span style="font-size: 14px; font-weight: 300; margin-left: 4px; color: #D5DCE6;">m²</span></span><span style="font-size: 12px; color: #B7C2D4;">sơn hiệu ứng</span></span></div></div></article>').join('');
    const mq = $('#pj-marquee'), track = $('#pj-track');
    const resume = () => { track.style.animationPlayState = 'running'; };
    mq.addEventListener('mousemove', (e) => { if (e.movementX || e.movementY) track.style.animationPlayState = 'paused'; });
    mq.addEventListener('mouseleave', resume);
    mq.addEventListener('wheel', resume, { passive: true });
    document.addEventListener('scroll', resume, { capture: true, passive: true });
  }

  /* ---------- Quy trình ---------- */
  function renderSteps() {
    $('#home-steps').innerHTML = A.STEPS.map((s, i) =>
      '<a href="#quy-trinh" class="rv lnk-row" style="display: block; padding: 28px 0 32px; border-top: 1px solid rgba(255,255,255,0.16); text-decoration: none; color: inherit;">' +
      '<div style="font-size: 13px; color: #3FB8B5; letter-spacing: 0.1em;">' + pad(i) + '</div><div data-live-key="process-step-' + i + '-title" data-live-type="text" style="margin-top: 10px; font-size: 21px; line-height: 30px; color: #F4F6F9;">' + esc(s.title) + '</div></a>').join('');
    $('#step-btns').innerHTML = A.STEPS.map((s, i) =>
      '<button type="button" class="step-btn" data-step="' + i + '"><span class="sb-no" style="font-size: 14px; min-width: 28px;">' + pad(i) + '</span><span class="sb-name" style="font-size: 18px;">' + esc(s.title) + '</span></button>').join('');
    $('#step-imgs').innerHTML = A.STEPS.map((s) => '<img class="proj-img" src="' + s.img + '" alt="' + esc(s.alt) + '" style="object-position: ' + s.pos + ';" loading="lazy">').join('');
    $('#step-texts').innerHTML = A.STEPS.map((s) =>
      '<div class="st" style="position: relative;"><div style="position: absolute; left: 48px; right: 48px; bottom: 48px;"><div style="width: 40px; height: 1px; background: #3FB8B5; margin-bottom: 24px;"></div>' +
      '<h3 style="margin: 0; font-size: 36px; line-height: 44px; font-weight: 300; color: #FFFFFF;">' + esc(s.title) + '</h3>' +
      '<p style="margin: 20px 0 0; max-width: 560px; font-size: 18px; line-height: 30px; color: #D5DCE6;">' + esc(s.body) + '</p></div></div>').join('');
    $('#step-btns').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (b) { state.step = Number(b.dataset.step); updateSteps(); } });
    updateSteps();
  }
  function updateSteps() {
    const si = state.step;
    $$('#step-btns .step-btn').forEach((b, i) => {
      const on = i === si;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('.sb-no', b).style.color = on ? '#3FB8B5' : '#B7C2D4';
      const n = $('.sb-name', b); n.style.color = on ? '#FFFFFF' : '#D5DCE6'; n.style.fontWeight = on ? 400 : 300;
    });
    $$('#step-imgs img').forEach((im, i) => {
      const on = i === si;
      im.style.opacity = on ? 0.75 : 0; im.style.transform = 'scale(' + (on ? 1 : 1.08) + ')';
      im.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $$('#step-texts .st').forEach((el, i) => {
      const on = i === si;
      el.style.opacity = on ? 1 : 0;
      el.style.transform = 'translateY(' + (on ? '0px' : (i > si ? '24px' : '-24px')) + ')';
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
  }

  /* ---------- Dịch vụ, Dự án, Tuyển dụng ---------- */
  function renderLists() {
    $('#effects').innerHTML = A.EFFECTS.map((f, i) =>
      '<div class="fx-row rv"><span style="font-size: 13px; color: #3FB8B5; letter-spacing: 0.1em; min-width: 28px;">' + pad(i) + '</span>' +
      '<span style="flex: 1;"><span class="fx-name" style="display: block; font-size: 26px; line-height: 34px; font-weight: 200; color: #F4F6F9;">' + esc(f.name) + '</span>' +
      (f.used ? '<span style="display: block; margin-top: 6px; font-size: 14px; color: #B7C2D4;">Đã thi công: ' + esc(f.used) + '</span>' : '') + '</span></div>').join('');
    $('#project-cards').innerHTML = A.PROJECTS.map((c) =>
      '<article class="pg-card card rv"><div class="zoom"><img src="' + c.img + '" alt="' + esc(c.name) + '" loading="lazy"></div><div style="padding: 32px 36px 28px;">' +
      '<div style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #3FB8B5;">' + esc(c.kind) + '</div>' +
      '<h2 style="margin: 10px 0 0; font-size: 34px; line-height: 40px; font-weight: 200; color: #FFFFFF;">' + esc(c.name) + '</h2>' +
      '<p style="margin: 8px 0 24px; font-size: 15px; color: #B7C2D4;">' + esc(c.place) + '</p>' +
      '<div class="pg-row"><span style="color: #B7C2D4;">Hiệu ứng</span><span style="color: #F4F6F9; text-align: right;">' + esc(c.effect) + '</span></div>' +
      '<div class="pg-row"><span style="color: #B7C2D4;">Diện tích sơn hiệu ứng</span><span style="color: #FFFFFF; font-size: 20px; font-weight: 300;">' + c.area + '<span style="font-size: 13px; margin-left: 3px; color: #D5DCE6;">m²</span></span></div>' +
      '<div class="pg-row"><span style="color: #B7C2D4;">Thông tin</span><span style="color: #F4F6F9; text-align: right;">' + esc(c.owner) + '</span></div></div></article>').join('');
    $('#roles').innerHTML = A.ROLES.map((n, i) =>
      '<div class="fx-row rv"><span style="font-size: 13px; color: #3FB8B5; letter-spacing: 0.1em; min-width: 28px;">' + pad(i) + '</span><span class="fx-name" style="font-size: 22px; line-height: 30px; font-weight: 200; color: #F4F6F9;">' + esc(n) + '</span></div>').join('');
  }

  /* ---------- Kiến thức ---------- */
  function renderKnowledge() {
    $('#kcats').innerHTML = A.KCATS.map((c) => {
      const on = state.kcat === c.key;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-kcat="' + c.key + '" aria-pressed="' + on + '">' + esc(c.label) + '</button>';
    }).join('');
    $('#articles').innerHTML = A.ARTICLES.filter((a) => state.kcat === 'all' || a.cat === state.kcat).map((a) =>
      '<article class="art card"><div class="zoom"><img src="' + a.img + '" alt="" loading="lazy"></div>' +
      '<div style="padding: 28px 28px 30px; display: flex; flex-direction: column; gap: 12px; flex: 1;">' +
      '<span style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #3FB8B5;">' + esc((A.KCATS.find((c) => c.key === a.cat) || {}).label) + '</span>' +
      '<h2 style="margin: 0; font-size: 24px; line-height: 32px; font-weight: 300; color: #FFFFFF;">' + esc(a.title) + '</h2>' +
      '<span style="margin-top: auto; padding-top: 16px; font-size: 13px; color: #B7C2D4; border-top: 1px solid rgba(255,255,255,0.12);">Bài viết đang được biên soạn</span></div></article>').join('');
  }
  $('#kcats').addEventListener('click', (e) => { const b = e.target.closest('[data-kcat]'); if (b) { state.kcat = b.dataset.kcat; renderKnowledge(); } });

  /* ---------- Dữ liệu ---------- */
  function renderDocs() {
    $('#docs').innerHTML = A.DOCS.map((d) =>
      '<div class="doc-row rv"><span class="doc-ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg></span>' +
      '<span><span style="display: block; font-size: 21px; line-height: 28px; color: #FFFFFF; font-weight: 300;">' + esc(d.name) + '</span><span style="display: block; margin-top: 4px; font-size: 14px; color: #B7C2D4;">' + esc(d.desc) + '</span></span>' +
      '<span style="font-size: 13px; color: #B7C2D4; letter-spacing: 0.08em;">' + d.fmt + '</span>' +
      (d.ready
        ? '<a href="' + (d.href || '#') + '" class="btn-line" style="padding: 10px 18px; min-height: 44px; font-size: 13px; justify-content: center;"' + (d.href ? ' download' : '') + '>Tải về' + dlIcon(16) + '</a>'
        : '<span class="doc-pend">Đang cập nhật</span>') + '</div>').join('');
  }

  function renderDataTab() {
    const pub = state.dtab === 'pub';
    $('#tab-pub').className = pub ? 'tab on' : 'tab'; $('#tab-pub').setAttribute('aria-selected', pub);
    $('#tab-int').className = pub ? 'tab' : 'tab on'; $('#tab-int').setAttribute('aria-selected', !pub);
    $('#dt-pub').hidden = !pub;
    $('#dt-int').hidden = pub;
    $('#dt-locked').hidden = state.dlog;
    $('#dt-open').hidden = !state.dlog;
    if (state.dlog) renderInternal();
  }

  function renderInternal() {
    const dq = state.dq.trim().toLowerCase();
    $('#depts').innerHTML = A.DEPTS.map((dp, i) => {
      const on = !dq && state.ddept === i;
      const n = dp.groups.reduce((s, g) => s + g.items.length, 0);
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-dept="' + i + '" aria-pressed="' + on + '">' + esc(dp.label) + ' <span style="opacity: 0.7; margin-left: 4px;">' + n + '</span></button>';
    }).join('');
    const groups = dq
      ? A.DEPTS.flatMap((dp) => dp.groups.map((g) => ({ title: dp.label + ' · ' + g.title, items: g.items.filter((it) => it.name.toLowerCase().includes(dq)) }))).filter((g) => g.items.length)
      : A.DEPTS[state.ddept].groups;
    $('#dgroups').innerHTML = groups.map((g) =>
      '<div><div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid rgba(63,184,181,0.6);"><h3 style="margin: 0; font-size: 20px; font-weight: 300; color: #FFFFFF;">' + esc(g.title) + '</h3><span style="font-size: 13px; color: #B7C2D4;">' + g.items.length + ' tài liệu</span></div>' +
      g.items.map((it) => '<div class="idoc"><span class="fmt">' + it.fmt + '</span><span style="flex: 1; font-size: 16px; line-height: 24px; color: #F4F6F9;">' + esc(it.name) + '</span><a href="#" class="idl" aria-label="Tải ' + esc(it.name) + '">' + dlIcon(18) + '</a></div>').join('') + '</div>').join('');
    $('#dempty').hidden = groups.length > 0;
  }

  $('.tabbar').addEventListener('click', (e) => { const b = e.target.closest('[data-dtab]'); if (b) { state.dtab = b.dataset.dtab; renderDataTab(); } });
  $('#depts').addEventListener('click', (e) => { const b = e.target.closest('[data-dept]'); if (b) { state.ddept = Number(b.dataset.dept); state.dq = ''; $('#d-search').value = ''; renderInternal(); } });
  $('#d-search').addEventListener('input', (e) => { state.dq = e.target.value; renderInternal(); });

  /* ---------- Surface Studio ---------- */
  let sdTimer;
  function renderStudio() {
    $('#sd-fx').innerHTML = A.EFFECTS.map((f, i) => {
      const on = state.sdFx === i;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-fx="' + i + '" aria-pressed="' + on + '" style="font-size: 13px; padding: 8px 14px;">' + esc(f.name) + '</button>';
    }).join('');
    $('#sd-colors').innerHTML = A.STUDIO_COLORS.map((c, i) => {
      const on = state.sdColor === i;
      return '<button type="button" class="sd-sw" data-color="' + i + '" aria-label="Tông ' + esc(c.name) + '" aria-pressed="' + on + '" style="background: ' + c.hex + '; border-color: ' + (on ? '#FFFFFF' : 'transparent') + ';"></button>';
    }).join('');
    const fxName = A.EFFECTS[state.sdFx].name, color = A.STUDIO_COLORS[state.sdColor];
    $('#sd-color-name').textContent = color.name;
    $$('[data-sd-fx-name]').forEach((el) => { el.textContent = fxName; });
    $$('[data-sd-color-name]').forEach((el) => { el.textContent = color.name; });
    $$('[data-sd-img]').forEach((im) => { im.src = state.sdImg || 'assets/img/2132f6cb6df720eb6f22d7e7e467d63a.jpg'; });
    $('#sd-note').textContent = state.sdImg ? 'Đã tải ảnh của bạn. Bấm để đổi ảnh khác.' : 'JPG hoặc PNG. Đang hiển thị ảnh mẫu.';
    $('#sd-tint').style.background = color.hex;
    $('#sd-tex').style.backgroundSize = A.STUDIO_TEX[state.sdFx];
    const done = state.sdGen === 'done';
    $('#sd-result').hidden = !done;
    $('#sd-compare').hidden = !done;
    $('#sd-scan').hidden = state.sdGen !== 'running';
    $('#sd-step3').style.borderTopColor = done ? '#3FB8B5' : 'rgba(255,255,255,0.18)';
    updateSplit();
  }
  function updateSplit() {
    $('#sd-after').style.clipPath = 'inset(0 0 0 ' + state.sdSplit + '%)';
    $('#sd-handle').style.left = state.sdSplit + '%';
    $('#sd-split').value = state.sdSplit;
  }
  const sdChanged = () => { if (state.sdGen === 'done') state.sdGen = 'idle'; renderStudio(); };
  $('#sd-fx').addEventListener('click', (e) => { const b = e.target.closest('[data-fx]'); if (b) { state.sdFx = Number(b.dataset.fx); sdChanged(); } });
  $('#sd-colors').addEventListener('click', (e) => { const b = e.target.closest('[data-color]'); if (b) { state.sdColor = Number(b.dataset.color); sdChanged(); } });
  $('#sd-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (state.sdImg) URL.revokeObjectURL(state.sdImg);
    state.sdImg = URL.createObjectURL(f);
    state.sdGen = 'idle';
    renderStudio();
  });
  $('#sd-split').addEventListener('input', (e) => { const v = Number(e.target.value); state.sdSplit = isNaN(v) ? 50 : v; updateSplit(); });

  /* ---------- Nút hành động chung ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    switch (b.dataset.action) {
      case 'toggle-menu': setMenu($('#mmenu').hidden); break;
      case 'open-search': setSearch(true); break;
      case 'close-search': setSearch(false); break;
      case 'prev-slide': goSlide(state.slide - 1); break;
      case 'next-slide': goSlide(state.slide + 1); break;
      case 'back-to-top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'login': state.dlog = true; renderDataTab(); break;
      case 'logout': state.dlog = false; state.dq = ''; $('#d-search').value = ''; renderDataTab(); break;
      case 'sd-run':
        clearTimeout(sdTimer);
        state.sdGen = 'running'; renderStudio();
        sdTimer = setTimeout(() => { state.sdGen = 'done'; state.sdSplit = 50; renderStudio(); }, 1800);
        break;
    }
  });

  /* ---------- Khởi động ---------- */
  renderNav();
  renderHero();
  renderMarquee();
  renderSteps();
  renderLists();
  renderKnowledge();
  renderDocs();
  renderDataTab();
  renderStudio();
  initStatCounters();
  $('#footer-year').textContent = new Date().getFullYear();
  showPage(anchorToPage[location.hash.slice(1)] || 'home');
  updateStoryProgress();
  if (location.hash) scrollTop();
  setTimeout(() => $('#root').classList.remove('first'), 900);
})();
