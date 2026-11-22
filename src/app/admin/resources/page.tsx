'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ResourceItem } from '@/lib/types';

export default function AdminResources() {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/resources?all=1&limit=48&page=1');
    const data = await res.json();
    setItems(data.items ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (r: ResourceItem) => {
    if (!window.confirm(`Delete “${r.title}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/resources/id/${r.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Delete failed'); return; }
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">Resources</h1>
        <Link href="/admin/resources/new" className="flex items-center gap-2 bg-bronze px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-bronze-dark"><Plus size={15} /> New resource</Link>
      </div>
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="mt-8">Loading…</p> : (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 py-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.thumbnail} alt="" className="h-12 w-[76px] shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.title}</p>
                <p className="text-xs text-stone-warm">{r.category} · {r.type} · {r.access} · {r.downloads} downloads{r.placeholder ? ' · placeholder seed content' : ''}</p>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${r.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
              {r.featured && <span className="bg-bronze/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-bronze-dark">Featured</span>}
              {!r.placeholder && (
                <span className="flex gap-2">
                  <Link href={`/admin/resources/${r.id}`} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-bronze"><Pencil size={13} /> Edit</Link>
                  <button onClick={() => remove(r)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:border-red-300"><Trash2 size={13} /> Delete</button>
                </span>
              )}
              {r.placeholder && <span className="text-xs text-stone-warm">Connect Firebase + seed to manage content</span>}
            </div>
          ))}
          {items.length === 0 && <p className="py-6 text-sm text-stone-warm">No resources found.</p>}
        </div>
      )}
    </div>
  );
}
