import { isResponse, ok, requireAdmin, requireBackend } from '@/lib/api';
import { getDb } from '@/lib/firebase';

export async function GET() {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return ok({ users: [] });
  const db = getDb(); if (!db) return ok({ users: [] });
  const snap = await db.collection('users').get();
  const users = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 200);
  return ok({ users: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, newsletter: u.newsletter, createdAt: u.createdAt })) });
}
