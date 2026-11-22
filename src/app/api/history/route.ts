import { NextRequest } from 'next/server';
import { isResponse, ok, requireBackend, requireUser } from '@/lib/api';
import { getResourceBySlug } from '@/lib/data';
import { getDb } from '@/lib/firebase';

export async function GET() {
  const user = await requireUser(); if (isResponse(user)) return user;
  const dbErr = await requireBackend(); if (dbErr) return ok({ viewed: [], downloads: [] });
  const db = getDb(); if (!db) return ok({ viewed: [], downloads: [] });
  const viewSnap = await db.collection('viewHistory').where('user', '==', user.id).get();
  const views = viewSnap.docs.map((d) => d.data() as any)
    .sort((a, b) => String(b.viewedAt).localeCompare(String(a.viewedAt))).slice(0, 48);
  const seen = new Set<string>(); const viewed: any[] = [];
  for (const v of views) {
    if (seen.has(v.resource)) continue; seen.add(v.resource);
    const r = await getResourceBySlug(v.resource, true);
    if (r) viewed.push({ resource: r, viewedAt: v.viewedAt });
    if (viewed.length >= 24) break;
  }
  const dlSnap = await db.collection('downloadLogs').where('user', '==', user.id).get();
  const downloads = dlSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30);
  return ok({ viewed, downloads: downloads.map((d: any) => ({ id: d.id, resource: d.resource, resourceTitle: d.resourceTitle, fileLabel: d.fileLabel, at: d.createdAt })) });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(); if (isResponse(user)) return user;
  const dbErr = await requireBackend(); if (dbErr) return ok({ recorded: false });
  const body = await req.json().catch(() => null);
  const db = getDb();
  if (body?.slug && db) {
    await db.collection('viewHistory').add({ user: user.id, resource: String(body.slug), viewedAt: new Date().toISOString() });
  }
  return ok({ recorded: true });
}
