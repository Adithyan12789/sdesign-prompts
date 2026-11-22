'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import ResourceCard, { ResourceCardSkeleton } from '@/components/ResourceCard';
import type { CategoryItem, PlatformItem, ResourceItem } from '@/lib/types';

const TYPES = ['', 'prompt', 'guide', 'workflow', 'bundle'];

function Listing() {
  const sp = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);

  const q = sp.get('q') ?? '';
  const category = sp.get('category') ?? '';
  const type = sp.get('type') ?? '';
  const platform = sp.get('platform') ?? '';
  const access = sp.get('access') ?? '';
  const sort = sp.get('sort') ?? 'newest';
  const page = Number(sp.get('page') ?? 1);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => { setSearchInput(q); }, [q]);
  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories ?? [])).catch(() => {});
    fetch('/api/platforms').then((r) => r.json()).then((d) => setPlatforms(d.platforms ?? [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (type) params.set('type', type);
    if (platform) params.set('platform', platform);
    if (access) params.set('access', access);
    params.set('sort', sort); params.set('page', String(page)); params.set('limit', '12');
    const res = await fetch(`/api/resources?${params}`);
    const data = await res.json();
    setItems(data.items ?? []); setTotal(data.total ?? 0); setPages(data.pages ?? 1);
    setLoading(false);
  }, [q, category, type, platform, access, sort, page]);
  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.push(`/resources?${params.toString()}`);
  };

  const selectCls = 'w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bronze';

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8">
      <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">The library</p>
      <h1 className="mt-3 font-display text-5xl font-semibold md:text-6xl">Prompts, guides & bundles</h1>

      <form className="mt-8 flex max-w-xl" onSubmit={(e) => { e.preventDefault(); set('q', searchInput); }}>
        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search prompts, guides, categories…"
          className="min-w-0 flex-1 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-bronze" />
        <button className="bg-charcoal px-5 text-xs font-bold uppercase tracking-wider text-ivory transition hover:bg-bronze">Search</button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-warm"><SlidersHorizontal size={14} /> Filters</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Category</span>
            <select value={category} onChange={(e) => set('category', e.target.value)} className={selectCls}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Resource type</span>
            <select value={type} onChange={(e) => set('type', e.target.value)} className={selectCls}>
              {TYPES.map((t) => <option key={t} value={t}>{t ? t[0].toUpperCase() + t.slice(1) + 's' : 'All types'}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">AI platform</span>
            <select value={platform} onChange={(e) => set('platform', e.target.value)} className={selectCls}>
              <option value="">All platforms</option>
              {platforms.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Access</span>
            <select value={access} onChange={(e) => set('access', e.target.value)} className={selectCls}>
              <option value="">Free & premium</option>
              <option value="free">Free only</option>
              <option value="premium">Premium only</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">Sort by</span>
            <select value={sort} onChange={(e) => set('sort', e.target.value)} className={selectCls}>
              <option value="newest">Newest first</option>
              <option value="popular">Most downloaded</option>
            </select>
          </label>
          {(q || category || type || platform || access) && (
            <button onClick={() => router.push('/resources')} className="text-xs font-bold uppercase tracking-wider text-bronze hover:underline">Clear all filters</button>
          )}
        </aside>

        <div>
          <p className="text-sm text-stone-warm">{loading ? 'Loading…' : `${total} resource${total === 1 ? '' : 's'} found`}</p>
          {loading ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-5 flex flex-col items-center border border-dashed border-line bg-white/60 px-6 py-20 text-center">
              <SearchX size={36} className="text-bronze" />
              <h2 className="mt-4 font-display text-3xl font-semibold">Nothing matches that search</h2>
              <p className="mt-2 max-w-sm text-sm text-stone-warm">Try a different keyword, or clear the filters to browse the whole library.</p>
              <button onClick={() => router.push('/resources')} className="mt-6 bg-charcoal px-6 py-3 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-bronze">Browse everything</button>
            </div>
          ) : (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} categoryName={categories.find((c) => c.slug === r.category)?.name} />)}
            </div>
          )}
          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => set('page', String(page - 1))} className="border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
              <span className="text-sm text-stone-warm">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => set('page', String(page + 1))} className="border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-5 pt-32">Loading the library…</div>}><Listing /></Suspense>;
}
