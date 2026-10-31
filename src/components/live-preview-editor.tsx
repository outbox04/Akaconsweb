'use client';

import { ImagePlus, Laptop, Monitor, RefreshCw, Send, Smartphone, Tablet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Device = 'desktop' | 'tablet' | 'mobile';
type Selection = { key: string; value: string; fieldType: 'text' | 'image'; label?: string } | null;
const deviceViewport: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 960 },
  mobile: { width: 390, height: 844 },
};

export default function LivePreviewEditor() {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [nonce, setNonce] = useState(0);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [stageWidth, setStageWidth] = useState(0);
  const viewport = deviceViewport[device];
  const scale = stageWidth ? Math.min(1, (stageWidth - 2) / viewport.width) : 1;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data) return;
      if (event.data.type === 'akacons-builder-ready') setReady(true);
      if (event.data.type === 'akacons-builder-select') {
        setSelection({ key: String(event.data.key), value: String(event.data.value || ''), fieldType: event.data.fieldType === 'image' ? 'image' : 'text', label: typeof event.data.label === 'string' ? event.data.label : undefined });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function update(value: string) {
    if (!selection) return;
    setSelection({ ...selection, value });
    setDraft((current) => ({ ...current, [selection.key]: value }));
    frame.current?.contentWindow?.postMessage({ type: 'akacons-builder-update', key: selection.key, value }, window.location.origin);
  }

  function upload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function publish() {
    setPublishing(true);
    setPublishMessage('');
    try {
      const response = await fetch('/api/site-content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: draft }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Không thể xuất bản website.');
      setPublishMessage('Đã xuất bản website.');
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Không thể xuất bản website.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="live-editor">
      <aside className="live-editor-panel">
        <p className="live-editor-kicker">Website AKACONS</p>
        <h1>Live preview</h1>
        <p className="live-editor-help">Bấm trực tiếp vào chữ hoặc ảnh trong website để chọn và chỉnh sửa ngay.</p>
        <Link href="/admin/cms" className="live-editor-cms-link">← Quay lại Website CMS</Link>
        <div className="live-editor-status"><i className={ready ? 'is-ready' : ''} />{ready ? 'Preview đã sẵn sàng' : 'Đang tải preview...'}</div>
        {selection ? (
          <section className="live-editor-fields">
            <p>{selection.label || (selection.fieldType === 'image' ? 'Hình ảnh đang chọn' : 'Nội dung đang chọn')}</p>
            {selection.fieldType === 'image' ? <>
              <div className="live-editor-image" style={{ backgroundImage: `url(${selection.value})` }} />
              <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(event) => { upload(event.target.files?.[0]); event.currentTarget.value = ''; }} />
              <button type="button" onClick={() => imageInput.current?.click()}><ImagePlus size={16} /> Tải ảnh mới</button>
              <label>Hoặc dán URL ảnh<input value={selection.value} onChange={(event) => update(event.target.value)} /></label>
            </> : <label>Văn bản<textarea value={selection.value} onChange={(event) => update(event.target.value)} rows={7} /></label>}
          </section>
        ) : <div className="live-editor-empty">Chưa chọn nội dung nào.</div>}
        <p className="live-editor-note">Các thay đổi đang được lưu làm bản nháp trên trình duyệt này.</p>
        <button type="button" className="live-editor-publish" onClick={publish} disabled={publishing || !Object.keys(draft).length}><Send size={16} />{publishing ? 'Đang xuất bản...' : 'Xuất bản website'}</button>
        {publishMessage && <p className={`live-editor-publish-message ${publishMessage.startsWith('Đã') ? 'success' : 'error'}`}>{publishMessage}</p>}
      </aside>
      <section className="live-editor-stage" ref={stage}>
        <header><div><Monitor size={18} /><strong>Live preview thật</strong></div><div className="live-editor-devices">{([['desktop', Laptop], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([name, Icon]) => <button key={name} type="button" className={device === name ? 'on' : ''} onClick={() => setDevice(name)} title={name}><Icon size={17} /></button>)}</div><button type="button" className="live-editor-refresh" onClick={() => { setReady(false); setNonce((value) => value + 1); }} title="Tải lại preview"><RefreshCw size={17} /></button></header>
        <div className="live-editor-frame-wrap" style={{ width: viewport.width * scale, height: viewport.height * scale }}><iframe ref={frame} key={nonce} src={`/akacons-website-source/index.html?builder=1&v=${nonce}`} title="AKACONS live preview" style={{ width: viewport.width, height: viewport.height, transform: `scale(${scale})` }} /></div>
      </section>
    </main>
  );
}
