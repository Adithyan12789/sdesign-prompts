import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend } from '@/lib/api';
import { getDb } from '@/lib/firebase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('platforms').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail('Platform not found', 404);
  await ref.update({ name: body?.name, url: body?.url });
  return ok({ id });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('platforms').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail('Platform not found', 404);
  const slug = snap.data()?.slug;
  const uses = await db.collection('resources').where('platforms', 'array-contains', slug).get();
  if (!uses.empty) return fail(`Platform is used by ${uses.size} resource(s); remove it from them first`, 409);
  await ref.delete();
  return ok({ deleted: true });
}
