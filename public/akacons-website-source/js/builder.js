/* Live-preview bridge. It is inactive on the public website unless ?builder=1. */
(function () {
  const STORAGE_KEY = 'akacons-live-preview-draft-v1';
  const isBuilder = new URLSearchParams(location.search).get('builder') === '1';
  const textSelector = 'h1,h2,h3,h4,p,span,a,button,label,small,strong,li,figcaption';
  const imageSelector = 'img,[style*="background-image"],.hs,.ph,.sec-bg,.mission-bg,.cta-bg,.stats-bg';
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (_) { draft = {}; }

  function apply(key, value) {
    const element = document.querySelector('[data-live-key="' + CSS.escape(key) + '"]');
    if (!element) return;
    if (element.dataset.liveType === 'image') {
      if (element.tagName === 'IMG') element.src = value;
      else element.style.backgroundImage = 'url("' + value.replace(/"/g, '\\"') + '")';
    } else element.textContent = value;
  }

  function markEditable() {
    let textIndex = 0, imageIndex = 0;
    const sectionBackgroundCounts = {};
    document.querySelectorAll(textSelector).forEach((element) => {
      // Explicit fields (for generated lists such as the six process steps)
      // must keep a stable key. Otherwise the surrounding section background
      // becomes the nearest editable element and is selected as an image.
      if (element.closest('script,style,.builder-ignore') || element.dataset.liveKey) return;
      const ownText = Array.from(element.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim());
      if (!ownText.length) return;
      ownText.forEach((node) => {
        let target = element;
        if (element.children.length) {
          target = document.createElement('span');
          target.textContent = node.textContent;
          node.replaceWith(target);
        }
        const key = 'text-' + textIndex++;
        target.dataset.liveKey = key;
        target.dataset.liveType = 'text';
        if (Object.prototype.hasOwnProperty.call(draft, key)) apply(key, draft[key]);
      });
    });
    document.querySelectorAll(imageSelector).forEach((element) => {
      if (element.closest('.builder-ignore') || element.dataset.liveKey) return;
      const isSectionBackground = element.classList.contains('sec-bg');
      const sectionClass = isSectionBackground && Array.from(element.classList).find((name) => name.indexOf('bg-') === 0);
      const sectionName = sectionClass || element.id || 'section';
      const occurrence = sectionBackgroundCounts[sectionName] || 0;
      sectionBackgroundCounts[sectionName] = occurrence + 1;
      // Sections need semantic, stable keys. Positional image keys change as the
      // page evolves and can apply a published background to the wrong section.
      const key = isSectionBackground ? 'section-background-' + sectionName + '-' + occurrence : 'image-' + imageIndex++;
      element.dataset.liveKey = key;
      element.dataset.liveType = 'image';
      if (isSectionBackground) element.dataset.liveLabel = 'Ảnh nền section: ' + sectionName.replace(/^bg-/, '').replace(/-/g, ' ');
      if (Object.prototype.hasOwnProperty.call(draft, key)) apply(key, draft[key]);
    });
  }

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }

  function applyContent(content) {
    Object.entries(content || {}).forEach(([key, value]) => apply(key, String(value)));
  }

  function loadPublished() {
    return fetch('/api/site-content', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { content: {} })
      .then((payload) => applyContent(payload.content))
      .catch(() => undefined);
  }

  if (!isBuilder) {
    window.addEventListener('DOMContentLoaded', () => {
      markEditable();
      loadPublished();
    });
    return;
  }

  const style = document.createElement('style');
  style.textContent = '[data-live-key]{outline:1px solid transparent;outline-offset:3px;cursor:pointer!important}[data-live-key]:hover,[data-live-key].live-selected{outline:2px solid #3FB8B5!important;background-color:rgba(63,184,181,.10)!important}';
  document.head.appendChild(style);

  window.addEventListener('DOMContentLoaded', () => {
    markEditable();
    loadPublished().then(() => {
      applyContent(draft);
      window.parent.postMessage({ type: 'akacons-builder-ready' }, location.origin);
    });
  });

  document.addEventListener('click', (event) => {
    const element = event.target.closest('[data-live-key]');
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    document.querySelectorAll('.live-selected').forEach((node) => node.classList.remove('live-selected'));
    element.classList.add('live-selected');
    const type = element.dataset.liveType;
    const value = type === 'image'
      ? (element.tagName === 'IMG' ? element.currentSrc || element.src : getComputedStyle(element).backgroundImage.replace(/^url\(["']?|["']?\)$/g, ''))
      : element.textContent || '';
    window.parent.postMessage({ type: 'akacons-builder-select', key: element.dataset.liveKey, value, fieldType: type, label: element.dataset.liveLabel || '' }, location.origin);
  }, true);

  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || !event.data || event.data.type !== 'akacons-builder-update') return;
    draft[event.data.key] = event.data.value;
    apply(event.data.key, event.data.value);
    save();
  });
})();
