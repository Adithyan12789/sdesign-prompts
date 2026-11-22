import { isResponse, ok, requireAdmin } from '@/lib/api';
import { firebaseReady, getDb } from '@/lib/firebase';
import { listResources } from '@/lib/data';

export async function GET() {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const db = getDb();
  if (!firebaseReady() || !db) {
    const { items, total } = await listResources({ limit: 48, includeDrafts: true });
    return ok({
      dbConnected: false,
      totals: { resources: total, downloads: items.reduce((s, r) => s + r.downloads, 0), views: items.reduce((s, r) => s + r.views, 0), users: 0, subscribers: 0 },
      topResources: [...items].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((r) => ({ title: r.title, slug: r.slug, downloads: r.downloads, views: r.views })),
      recentDownloads: [],
    });
  }
  const { items, total } = await listResources({ limit: 48, includeDrafts: true });
  const [usersSnap, subsSnap, logsSnap] = await Promise.all([
    db.collection('users').get(), db.collection('subscribers').get(),
    db.collection('downloadLogs').get(),
  ]);
  const recentDownloads = logsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 10);
  return ok({
    dbConnected: true,
    totals: {
      resources: total, users: usersSnap.size, subscribers: subsSnap.size,
      downloads: items.reduce((s, r) => s + r.downloads, 0), views: items.reduce((s, r) => s + r.views, 0),
    },
    topResources: [...items].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((r) => ({ title: r.title, slug: r.slug, downloads: r.downloads, views: r.views })),
    recentDownloads: recentDownloads.map((d: any) => ({ id: d.id, resourceTitle: d.resourceTitle, fileLabel: d.fileLabel, userEmail: d.userEmail ?? 'Guest', at: d.createdAt })),
  });
}
