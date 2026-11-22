'use client';
import { useEffect, useState } from 'react';
import type { SiteContentData } from '@/lib/types';

const input = 'w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-bronze';
const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider';

export default function AdminContent() {
  const [form, setForm] = useState<SiteContentData | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/content').then((r) => r.json()).then((d) => setForm(d.content)); }, []);
  if (!form) return <p>Loading content…</p>;
  const set = (k: keyof SiteContentData, v: string) => setForm({ ...form, [k]: v });

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setNotice(''); setError('');
    const res = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: form }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
    setNotice('Homepage content saved.');
  };

  const field = (key: keyof SiteContentData, text: string, rows = 0) => (
    <label className="block"><span className={label}>{text}</span>
      {rows > 0
        ? <textarea rows={rows} value={form[key]} onChange={(e) => set(key, e.target.value)} className={input} />
        : <input value={form[key]} onChange={(e) => set(key, e.target.value)} className={input} />}
    </label>
  );

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Homepage content</h1>
      {notice && <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={save} className="mt-8 space-y-5">
        {field('heroEyebrow', 'Hero eyebrow')}
        {field('heroTitle', 'Hero headline')}
        {field('heroSubtitle', 'Hero supporting text', 3)}
        {field('heroImage', 'Hero image URL')}
        {field('studioTitle', 'Studio section title')}
        {field('studioText', 'Studio section text', 4)}
        {field('studioImage', 'Studio image URL')}
        {field('footerText', 'Footer text', 2)}
        <div className="grid gap-5 md:grid-cols-2">
          {field('instagram', 'Instagram URL')}{field('youtube', 'YouTube URL')}
          {field('x', 'X (Twitter) URL')}{field('linkedin', 'LinkedIn URL')}
        </div>
        <button className="bg-charcoal px-8 py-3 text-sm font-bold uppercase tracking-wider text-ivory hover:bg-bronze">Save content</button>
      </form>
    </div>
  );
}
