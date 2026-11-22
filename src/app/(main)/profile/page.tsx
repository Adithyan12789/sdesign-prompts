'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, Download, Heart } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import type { ResourceItem, SessionUser } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [favorites, setFavorites] = useState<ResourceItem[]>([]);
  const [viewed, setViewed] = useState<{ resource: ResourceItem; viewedAt: string }[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(async (d) => {
      setUser(d.user);
      if (!d.user) return;
      const [f, h] = await Promise.all([
        fetch('/api/favorites').then((r) => r.json()).catch(() => ({})),
        fetch('/api/history').then((r) => r.json()).catch(() => ({})),
      ]);
      setFavorites(f.favorites ?? []); setViewed(h.viewed ?? []); setDownloads(h.downloads ?? []);
    }).catch(() => setUser(null));
  }, []);

  if (user === undefined) return <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">Loading your library…</div>;
  if (!user) return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-32 text-center">
      <h1 className="font-display text-4xl font-semibold">Sign in to see your library</h1>
      <p className="mt-3 text-stone-warm">Favorites, recently viewed resources and download history live here.</p>
      <Link href="/login" className="mt-6 inline-block bg-charcoal px-7 py-3 text-sm font-bold uppercase tracking-wider text-ivory hover:bg-bronze">Sign in</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8">
      <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">My library</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">{user.name}</h1>
      <p className="mt-2 text-sm text-stone-warm">{user.email}</p>

      <h2 className="mt-14 flex items-center gap-2.5 font-display text-3xl font-semibold"><Heart className="text-bronze" size={22} /> Favorites</h2>
      {favorites.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{favorites.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)}</div>
      ) : <p className="mt-4 text-sm text-stone-warm">No favorites yet — tap “Save to favorites” on any resource.</p>}

      <h2 className="mt-14 flex items-center gap-2.5 font-display text-3xl font-semibold"><Clock className="text-bronze" size={22} /> Recently viewed</h2>
      {viewed.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{viewed.map(({ resource }, i) => <ResourceCard key={resource.id} resource={resource} index={i} />)}</div>
      ) : <p className="mt-4 text-sm text-stone-warm">Resources you open will appear here.</p>}

      <h2 className="mt-14 flex items-center gap-2.5 font-display text-3xl font-semibold"><Download className="text-bronze" size={22} /> Download history</h2>
      {downloads.length ? (
        <div className="mt-6 divide-y divide-line border-y border-line">
          {downloads.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <Link href={`/resources/${d.resource}`} className="font-semibold hover:text-bronze">{d.resourceTitle}</Link>
              <span className="text-sm text-stone-warm">{d.fileLabel} · {new Date(d.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          ))}
        </div>
      ) : <p className="mt-4 text-sm text-stone-warm">Nothing downloaded yet.</p>}
    </div>
  );
}
