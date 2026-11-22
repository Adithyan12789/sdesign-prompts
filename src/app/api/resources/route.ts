import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend, slugify } from '@/lib/api';
import { listResources, publicList } from '@/lib/data';
import { getDb } from '@/lib/firebase';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await listResources({
    q: sp.get('q') ?? undefined, category: sp.get('category') ?? undefined,
    type: sp.get('type') ?? undefined, platform: sp.get('platform') ?? undefined,
    access: sp.get('access') ?? undefined, featured: sp.get('featured') === '1',
    sort: sp.get('sort') === 'popular' ? 'popular' : 'newest',
    page: Number(sp.get('page') ?? 1), limit: Number(sp.get('limit') ?? 12),
    includeDrafts: false,
  });
  const { getSessionUser } = await import('@/lib/auth');
  const user = await getSessionUser();
  const isAdmin = user?.role === 'admin';
  if (sp.get('all') === '1' && isAdmin) {
    const all = await listResources({ page: Number(sp.get('page') ?? 1), limit: Number(sp.get('limit') ?? 12), includeDrafts: true });
    return ok(all);
  }
  return ok(isAdmin ? result : publicList(result));
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const body = await req.json().catch(() => null);
  if (!body?.title) return fail('Title is required');
  const slug = slugify(body.slug || body.title);
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const dupe = await db.collection('resources').where('slug', '==', slug).limit(1).get();
  if (!dupe.empty) return fail('A resource with this slug already exists', 409);
  const files = (body.files ?? []).map((f: any) => ({ ...f, id: f.id || randomUUID() }));
  const { id: _ignored, ...rest } = body;
  const now = new Date().toISOString();
  const ref = await db.collection('resources').add({
    ...rest, slug, files, downloads: 0, views: 0, createdAt: now, updatedAt: now,
  });
  return ok({ id: ref.id, slug }, 201);
}
