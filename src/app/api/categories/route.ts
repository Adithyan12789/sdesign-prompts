import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin, requireBackend, slugify } from '@/lib/api';
import { listCategories } from '@/lib/data';
import { getDb } from '@/lib/firebase';

export async function GET() { return ok({ categories: await listCategories() }); }

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const body = await req.json().catch(() => null);
  if (!body?.name) return fail('Name is required');
  const slug = slugify(body.slug || body.name);
  const db = getDb(); if (!db) return fail('Firebase is not connected', 503);
  const dupe = await db.collection('categories').where('slug', '==', slug).limit(1).get();
  if (!dupe.empty) return fail('Category slug already exists', 409);
  const ref = await db.collection('categories').add({ name: body.name, slug, description: body.description ?? '', image: body.image ?? '' });
  return ok({ id: ref.id, slug }, 201);
}
