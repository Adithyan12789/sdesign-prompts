'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CategoryItem } from '@/lib/types';

const input = 'w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-bronze';

export default function AdminCategories() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => fetch('/api/categories').then((r) => r.json()).then((d) => setItems(d.categories ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setNotice('');
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Could not create category'); return; }
    setForm({ name: '', description: '', image: '' }); setNotice('Category created.'); load();
  };

  const remove = async (c: CategoryItem) => {
    if (!window.confirm(`Delete category “${c.name}”?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Delete failed'); return; }
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Categories</h1>
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      <form onSubmit={create} className="mt-8 grid gap-4 border border-line bg-parchment/50 p-5 md:grid-cols-3">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name *" className={input} />
        <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Cover image URL" className={input} />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className={input} />
        <button className="flex w-fit items-center gap-2 bg-bronze px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-bronze-dark"><Plus size={14} /> Add category</button>
      </form>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-4 py-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.image && <img src={c.image} alt="" className="h-11 w-[72px] object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="truncate text-xs text-stone-warm">/{c.slug} · {c.description}</p>
            </div>
            {!c.id.startsWith('seed-') && <button onClick={() => remove(c)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:border-red-300"><Trash2 size={13} /> Delete</button>}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-stone-warm">Categories with resources attached cannot be deleted — reassign their resources first. Seeded categories become editable once the database is connected and seeded.</p>
    </div>
  );
}
