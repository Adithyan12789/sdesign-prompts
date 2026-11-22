import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api';
import { getResourceBySlug, publicResource } from '@/lib/data';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return fail('Resource not found', 404);
  // Count the view (Firestore resources only; seed views are static).
  const db = getDb();
  if (db) {
    const snap = await db.collection('resources').where('slug', '==', slug).limit(1).get().catch(() => null);
    if (snap && !snap.empty) await snap.docs[0].ref.update({ views: FieldValue.increment(1) }).catch(() => {});
  }
  const { getSessionUser } = await import('@/lib/auth');
  const user = await getSessionUser();
  return ok({ resource: user?.role === 'admin' ? resource : publicResource(resource) });
}
