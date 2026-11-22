'use client';
import { useEffect, useState } from 'react';
import { Check, Copy, Download, Heart, Lock, Share2 } from 'lucide-react';
import type { ResourceFile } from '@/lib/types';
import { formatBytes } from '@/lib/client-utils';

export function PromptViewer({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); } catch {
      const ta = document.createElement('textarea'); ta.value = prompt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="overflow-hidden bg-charcoal text-ivory shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze">The Prompt</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ivory/80 transition hover:text-bronze">
          {copied ? <><Check size={14} className="text-green-400" /> Copied</> : <><Copy size={14} /> Copy prompt</>}
        </button>
      </div>
      <pre className="prompt-scroll max-h-80 overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[13px] leading-relaxed text-ivory/90">{prompt}</pre>
    </div>
  );
}

export function DownloadButton({ file, locked }: { file: ResourceFile; locked: boolean }) {
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const download = async () => {
    if (locked) { window.location.href = '/login'; return; }
    setState('working'); setMessage('');
    try {
      const res = await fetch('/api/downloads/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: file.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not prepare the download');
      window.location.href = data.url;
      setState('idle');
    } catch (e: any) { setState('error'); setMessage(e.message); }
  };
  return (
    <div>
      <button onClick={download} disabled={state === 'working'}
        className="flex w-full items-center gap-3 border border-line bg-white px-4 py-3 text-left transition hover:border-bronze hover:bg-parchment/60 disabled:opacity-60">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-charcoal text-ivory">{locked ? <Lock size={16} /> : <Download size={16} />}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{file.label}</span>
          <span className="block text-xs text-stone-warm">{file.format}{file.size ? ` · ${formatBytes(file.size)}` : ''} · {file.originalName}</span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-bronze">{state === 'working' ? 'Preparing…' : locked ? 'Sign in' : 'Download'}</span>
      </button>
      {state === 'error' && <p className="mt-1.5 text-xs text-red-700">{message}</p>}
    </div>
  );
}

export function FavoriteButton({ slug, initial }: { slug: string; initial?: boolean }) {
  const [fav, setFav] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/favorites').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.slugs) setFav(d.slugs.includes(slug)); }).catch(() => {});
  }, [slug]);
  const toggle = async () => {
    setBusy(true);
    const res = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json().catch(() => ({}));
    if (res.ok) setFav(Boolean(data.favorite));
    setBusy(false);
  };
  return (
    <button onClick={toggle} disabled={busy} className={`flex items-center gap-2 border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${fav ? 'border-bronze bg-bronze text-white' : 'border-line bg-white hover:border-bronze'}`}>
      <Heart size={15} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Saved' : 'Save to favorites'}
    </button>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* fall through */ } }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };
  return (
    <button onClick={share} className="flex items-center gap-2 border border-line bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:border-bronze">
      {copied ? <><Check size={15} className="text-green-600" /> Link copied</> : <><Share2 size={15} /> Share</>}
    </button>
  );
}

export function RecordView({ slug }: { slug: string }) {
  useEffect(() => { fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }).catch(() => {}); }, [slug]);
  return null;
}

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setDone(true); else setError(data.error ?? 'Something went wrong');
  };
  if (done) return <p className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-ivory' : 'text-charcoal'}`}><Check size={16} className="text-bronze" /> You are on the list. New prompts and guides, first.</p>;
  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address"
          className={`min-w-0 flex-1 border px-4 py-3 text-sm outline-none ${dark ? 'border-white/25 bg-white/10 text-ivory placeholder:text-ivory/50' : 'border-line bg-white'}`} />
        <button className="shrink-0 bg-bronze px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-bronze-dark">Subscribe</button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </form>
  );
}
