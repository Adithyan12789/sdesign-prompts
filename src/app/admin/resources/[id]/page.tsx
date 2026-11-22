'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import type { CategoryItem, PlatformItem, ResourceFile } from '@/lib/types';

const input = 'w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-bronze';
const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider';
const FILE_KINDS: Record<string, { kind: string; format: string; label: string }> = {
  txt: { kind: 'prompt-txt', format: 'TXT', label: 'Prompt file' },
  pdf: { kind: 'guide-pdf', format: 'PDF', label: 'Guide PDF' },
  zip: { kind: 'bundle-zip', format: 'ZIP', label: 'Resource bundle' },
  image: { kind: 'reference-image', format: 'JPG', label: 'Reference image' },
};

export default function ResourceEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<any>({
    title: '', slug: '', shortDescription: '', description: '', thumbnail: '', previewImages: [], previewVideo: '',
    category: '', type: 'prompt', platforms: [], difficulty: 'Beginner', promptContent: '',
    instructions: [{ title: '', body: '' }], files: [], access: 'free', featured: false, status: 'draft',
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch('/api/platforms').then((r) => r.json()).then((d) => setPlatforms(d.platforms ?? []));
    if (!isNew) {
      fetch('/api/resources?all=1&limit=48').then((r) => r.json()).then((d) => {
        const found = (d.items ?? []).find((r: any) => r.id === id);
        if (found) setForm({ ...found, previewImages: found.previewImages ?? [], instructions: found.instructions?.length ? found.instructions : [{ title: '', body: '' }] });
      });
    }
  }, [id, isNew]);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const upload = async (file: File, kind: string): Promise<any> => {
    const fd = new FormData(); fd.append('file', file); fd.append('kind', kind);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? 'Upload failed');
    return data;
  };

  const onMedia = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'image' | 'video', target: 'thumbnail' | 'gallery' | 'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(target); setError('');
    try {
      const data = await upload(file, kind);
      if (target === 'thumbnail') set('thumbnail', data.url);
      if (target === 'video') set('previewVideo', data.url);
      if (target === 'gallery') set('previewImages', [...form.previewImages, data.url]);
    } catch (err: any) { setError(err.message); }
    setUploading('');
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, kindKey: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(kindKey); setError('');
    try {
      const meta = FILE_KINDS[kindKey];
      const data = await upload(file, kindKey === 'image' ? 'image' : kindKey);
      const entry: ResourceFile = {
        id: '', label: meta.label, kind: meta.kind as any,
        format: (file.name.split('.').pop() ?? meta.format).toUpperCase(),
        size: data.size, storageKey: data.storageKey, originalName: data.originalName,
      };
      set('files', [...form.files, entry]);
    } catch (err: any) { setError(err.message); }
    setUploading('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    const payload = { ...form, instructions: form.instructions.filter((s: any) => s.title.trim() || s.body.trim()) };
    const res = await fetch(isNew ? '/api/resources' : `/api/resources/id/${id}`, {
      method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
    router.push('/admin/resources');
  };

  return (
    <div>
      <button onClick={() => router.push('/admin/resources')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-warm hover:text-bronze"><ArrowLeft size={14} /> All resources</button>
      <h1 className="mt-4 font-display text-4xl font-semibold">{isNew ? 'New resource' : 'Edit resource'}</h1>
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={save} className="mt-8 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className={label}>Title *</span><input required value={form.title} onChange={(e) => set('title', e.target.value)} className={input} /></label>
          <label className="block"><span className={label}>Slug (auto from title if empty)</span><input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={input} placeholder="glass-tower-reveal" /></label>
        </div>
        <label className="block"><span className={label}>Short description</span><input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className={input} /></label>
        <label className="block"><span className={label}>Full description</span><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={input} /></label>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="block"><span className={label}>Category</span>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={input}>
              <option value="">Select…</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select></label>
          <label className="block"><span className={label}>Type</span>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={input}>
              <option value="prompt">Prompt</option><option value="guide">Guide</option><option value="workflow">Workflow</option><option value="bundle">Bundle</option>
            </select></label>
          <label className="block"><span className={label}>Difficulty</span>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className={input}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select></label>
        </div>

        <fieldset>
          <legend className={label}>Compatible AI platforms</legend>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => {
              const active = form.platforms.includes(p.slug);
              return <button type="button" key={p.id} onClick={() => set('platforms', active ? form.platforms.filter((x: string) => x !== p.slug) : [...form.platforms, p.slug])}
                className={`border px-3.5 py-1.5 text-sm font-semibold ${active ? 'border-bronze bg-bronze text-white' : 'border-line bg-white'}`}>{p.name}</button>;
            })}
          </div>
        </fieldset>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <span className={label}>Thumbnail image</span>
            <div className="flex gap-2">
              <input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} className={input} placeholder="Image URL or upload →" />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-line bg-white px-3 text-xs font-bold uppercase tracking-wider hover:border-bronze">
                <Upload size={13} /> {uploading === 'thumbnail' ? '…' : 'Upload'}<input type="file" accept="image/*" className="hidden" onChange={(e) => onMedia(e, 'image', 'thumbnail')} />
              </label>
            </div>
            {form.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.thumbnail} alt="" className="mt-3 aspect-[16/9] w-64 object-cover" />}
          </div>
          <div>
            <span className={label}>Preview video</span>
            <div className="flex gap-2">
              <input value={form.previewVideo ?? ''} onChange={(e) => set('previewVideo', e.target.value)} className={input} placeholder="Video URL or upload →" />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-line bg-white px-3 text-xs font-bold uppercase tracking-wider hover:border-bronze">
                <Upload size={13} /> {uploading === 'video' ? '…' : 'Upload'}<input type="file" accept="video/*" className="hidden" onChange={(e) => onMedia(e, 'video', 'video')} />
              </label>
            </div>
            <span className={`${label} mt-5`}>Preview / reference images</span>
            <label className="flex w-fit cursor-pointer items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-bronze">
              <Upload size={13} /> {uploading === 'gallery' ? 'Uploading…' : 'Add image'}<input type="file" accept="image/*" className="hidden" onChange={(e) => onMedia(e, 'image', 'gallery')} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.previewImages.map((src: string, i: number) => (
                <span key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-16 w-24 object-cover" />
                  <button type="button" onClick={() => set('previewImages', form.previewImages.filter((_: string, j: number) => j !== i))} className="absolute -right-2 -top-2 bg-charcoal p-1 text-white"><Trash2 size={11} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <label className="block"><span className={label}>Prompt content</span>
          <textarea rows={6} value={form.promptContent} onChange={(e) => set('promptContent', e.target.value)} className={`${input} font-mono text-[13px]`} placeholder="The full prompt text visitors can copy…" /></label>

        <fieldset>
          <legend className={label}>Step-by-step instructions</legend>
          <div className="space-y-3">
            {form.instructions.map((s: any, i: number) => (
              <div key={i} className="flex gap-3">
                <span className="pt-2.5 font-display text-xl font-semibold text-bronze">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 space-y-2">
                  <input value={s.title} placeholder="Step title" onChange={(e) => { const next = [...form.instructions]; next[i] = { ...s, title: e.target.value }; set('instructions', next); }} className={input} />
                  <textarea rows={2} value={s.body} placeholder="Step details" onChange={(e) => { const next = [...form.instructions]; next[i] = { ...s, body: e.target.value }; set('instructions', next); }} className={input} />
                </div>
                <button type="button" onClick={() => set('instructions', form.instructions.filter((_: any, j: number) => j !== i))} className="self-start pt-2 text-red-700"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set('instructions', [...form.instructions, { title: '', body: '' }])} className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bronze"><Plus size={14} /> Add step</button>
        </fieldset>

        <fieldset>
          <legend className={label}>Downloadable files</legend>
          <div className="space-y-2">
            {form.files.map((f: ResourceFile, i: number) => (
              <div key={i} className="flex flex-wrap items-center gap-3 border border-line bg-white px-4 py-2.5 text-sm">
                <span className="font-semibold">{f.label}</span><span className="text-stone-warm">{f.format} · {f.originalName}</span>
                <button type="button" onClick={() => set('files', form.files.filter((_: any, j: number) => j !== i))} className="ml-auto text-red-700"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(FILE_KINDS) as string[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-1.5 border border-line bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider hover:border-bronze">
                <Upload size={13} /> {uploading === k ? 'Uploading…' : `Add ${FILE_KINDS[k].format} file`}
                <input type="file" accept={k === 'image' ? 'image/*' : `.${k}`} className="hidden" onChange={(e) => onFileUpload(e, k)} />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-warm">Files are stored privately and served only through signed, expiring download links after access checks.</p>
        </fieldset>

        <div className="flex flex-wrap items-center gap-6 border-t border-line pt-6">
          <label className="block"><span className={label}>Access</span>
            <select value={form.access} onChange={(e) => set('access', e.target.value)} className={input}><option value="free">Free</option><option value="premium">Premium</option></select></label>
          <label className="block"><span className={label}>Status</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={input}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="mt-5 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-[#a5814f]" /> Featured on homepage</label>
          <button disabled={busy} className="ml-auto bg-charcoal px-8 py-3 text-sm font-bold uppercase tracking-wider text-ivory hover:bg-bronze disabled:opacity-60">{busy ? 'Saving…' : isNew ? 'Create resource' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
