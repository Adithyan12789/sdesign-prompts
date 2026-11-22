import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireBackend, requireUser } from '@/lib/api';
import { getResourceBySlug, publicResource } from '@/lib/data';
import { getDb } from '@/lib/firebase';

const docId = (userId: string, slug: string) => `${userId}__${slug}`;

export async function GET() {
  const user = await requireUser(); if (isResponse(user)) return user;
  const dbErr = await requireBackend(); if (dbErr) return ok({ favorites: [], slugs: [] });
  const db = getDb(); if (!db) return ok({ favorites: [], slugs: [] });
  const snap = await db.collection('favorites').where('user', '==', user.id).get();
  const favs = snap.docs.map((d) => d.data() as any).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const resources = (await Promise.all(favs.map((f: any) => getResourceBySlug(f.resource, true)))).filter(Boolean).map((r: any) => publicResource(r));
  return ok({ favorites: resources, slugs: favs.map((f: any) => f.resource) });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(); if (isResponse(user)) return user;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? '');
  if (!slug) return fail('Resource slug is required');
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('favorites').doc(docId(user.id, slug));
  const snap = await ref.get();
  if (snap.exists) { await ref.delete(); return ok({ favorite: false }); }
  await ref.set({ user: user.id, resource: slug, createdAt: new Date().toISOString() });
  return ok({ favorite: true });
}
