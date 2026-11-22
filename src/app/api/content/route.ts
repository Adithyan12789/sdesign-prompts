import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend } from '@/lib/api';
import { getSiteContent } from '@/lib/data';
import { getDb } from '@/lib/firebase';

export async function GET() { return ok({ content: await getSiteContent() }); }

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const body = await req.json().catch(() => null);
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  await db.collection('siteContent').doc('main').set(body?.content ?? {}, { merge: true });
  return ok({ saved: true });
}
