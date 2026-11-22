'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PlatformItem } from '@/lib/types';

const input = 'w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-bronze';

export default function AdminPlatforms() {
  const [items, setItems] = useState<PlatformItem[]>([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [error, setError] = useState('');

  const load = () => fetch('/api/platforms').then((r) => r.json()).then((d) => setItems(d.platforms ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const res = await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Could not create platform'); return; }
    setForm({ name: '', url: '' }); load();
  };

  const remove = async (p: PlatformItem) => {
    if (!window.confirm(`Delete platform “${p.name}”?`)) return;
    const res = await fetch(`/api/platforms/${p.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Delete failed'); return; }
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">AI Platforms</h1>
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={create} className="mt-8 flex flex-wrap gap-4 border border-line bg-parchment/50 p-5">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Platform name *" className={`${input} max-w-xs`} />
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Website URL" className={`${input} max-w-xs`} />
        <button className="flex items-center gap-2 bg-bronze px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-bronze-dark"><Plus size={14} /> Add platform</button>
      </form>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="truncate text-xs text-stone-warm">{p.url || 'No URL'} · slug: {p.slug}</p>
            </div>
            {!p.id.startsWith('seed-') && <button onClick={() => remove(p)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:border-red-300"><Trash2 size={13} /> Delete</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
