import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend } from '@/lib/api';
import { getAdminAuth, getDb } from '@/lib/firebase';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (body?.role && !['user', 'admin'].includes(body.role)) return fail('Invalid role');
  if (id === admin.id && body?.role === 'user') return fail('You cannot remove your own admin role');
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const ref = db.collection('users').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return fail('User not found', 404);
  await ref.update({ role: body?.role });
  return ok({ id, role: body?.role });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const { id } = await params;
  if (id === admin.id) return fail('You cannot delete your own account');
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  await db.collection('users').doc(id).delete();
  const auth = getAdminAuth();
  if (auth) await auth.deleteUser(id).catch(() => {});
  return ok({ deleted: true });
}
