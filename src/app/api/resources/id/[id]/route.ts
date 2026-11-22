import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend } from '@/lib/api';
import { getDb } from '@/lib/firebase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return fail('Invalid body');
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('resources').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail('Resource not found', 404);
  const { _id, id: _ignored, createdAt: _c, ...update } = body;
  await ref.update({ ...update, updatedAt: new Date().toISOString() });
  return ok({ id, slug: update.slug ?? snap.data()?.slug });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('resources').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail('Resource not found', 404);
  await ref.delete();
  return ok({ deleted: true });
}
