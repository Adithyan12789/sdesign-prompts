'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download, Eye, Library, Mail, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/stats').then((r) => r.json()).then(setStats).catch(() => {}); }, []);
  if (!stats) return <p>Loading analytics…</p>;
  const cards = [
    { label: 'Resources', value: stats.totals.resources, icon: Library },
    { label: 'Total downloads', value: stats.totals.downloads, icon: Download },
    { label: 'Total views', value: stats.totals.views, icon: Eye },
    { label: 'Registered users', value: stats.totals.users, icon: Users },
    { label: 'Newsletter subscribers', value: stats.totals.subscribers, icon: Mail },
  ];
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
      {!stats.dbConnected && (
        <p className="mt-4 border border-bronze/40 bg-bronze/10 px-4 py-3 text-sm">
          Showing placeholder library content — Firebase is not connected yet. Add the Firebase keys to <code className="font-mono">.env.local</code> and run <code className="font-mono">npm run seed</code> to enable accounts, editing and live analytics.
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-line bg-white p-5">
            <Icon size={18} className="text-bronze" />
            <p className="mt-3 font-display text-4xl font-semibold">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-stone-warm">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Most downloaded</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {stats.topResources.map((r: any) => (
              <Link key={r.slug} href={`/resources/${r.slug}`} className="flex items-center justify-between gap-4 py-3 hover:text-bronze">
                <span className="min-w-0 truncate font-semibold">{r.title.replace(/ — Placeholder.*$/, '')}</span>
                <span className="flex shrink-0 items-center gap-4 text-sm text-stone-warm"><span className="flex items-center gap-1"><Download size={13} /> {r.downloads}</span><span className="flex items-center gap-1"><Eye size={13} /> {r.views}</span></span>
              </Link>
            ))}
            {stats.topResources.length === 0 && <p className="py-4 text-sm text-stone-warm">No resources yet.</p>}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">Recent downloads</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {stats.recentDownloads.map((d: any) => (
              <div key={d.id} className="py-3">
                <p className="truncate font-semibold">{d.resourceTitle}</p>
                <p className="text-sm text-stone-warm">{d.fileLabel} · {d.userEmail} · {new Date(d.at).toLocaleString('en-GB')}</p>
              </div>
            ))}
            {stats.recentDownloads.length === 0 && <p className="py-4 text-sm text-stone-warm">No downloads recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
