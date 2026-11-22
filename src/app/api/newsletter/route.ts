import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api';
import { getDb } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address');
  const db = getDb();
  if (db) await db.collection('subscribers').doc(email).set({ email, createdAt: new Date().toISOString() }, { merge: true });
  return ok({ subscribed: true, stored: Boolean(db) });
}
