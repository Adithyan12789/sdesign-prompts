import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { fail, ok, requireBackend } from '@/lib/api';
import { createSessionCookie, sessionCookieOptions, upsertUserProfile } from '@/lib/auth';
import { getAdminAuth } from '@/lib/firebase';

/**
 * The browser signs in / registers with the Firebase client SDK, then
 * posts the ID token here. The server verifies it, stores the profile
 * in Firestore, and mints the httpOnly Firebase session cookie.
 */
export async function POST(req: NextRequest) {
  const dbErr = await requireBackend(); if (dbErr) return dbErr;
  const body = await req.json().catch(() => null);
  const idToken = String(body?.idToken ?? '');
  if (!idToken) return fail('Missing sign-in token');
  const auth = getAdminAuth(); if (!auth) return fail('Firebase is not connected', 503);
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return fail('Sign-in could not be verified', 401);
  }
  await upsertUserProfile(decoded.uid, {
    email: decoded.email ?? '',
    name: body?.name ? String(body.name) : undefined,
    newsletter: Boolean(body?.newsletter),
  });
  const session = await createSessionCookie(idToken);
  if (!session) return fail('Could not create a session', 500);
  (await cookies()).set('atelier_session', session, sessionCookieOptions());
  return ok({});
}
