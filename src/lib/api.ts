import { NextResponse } from 'next/server';
import { getSessionUser } from './auth';
import { firebaseReady } from './firebase';
import type { SessionUser } from './types';

export const ok = (data: any, status = 200) => NextResponse.json({ success: true, ...data }, { status });
export const fail = (message: string, status = 400) => NextResponse.json({ success: false, error: message }, { status });

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return fail('Sign in required', 401);
  return user;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return fail('Sign in required', 401);
  if (user.role !== 'admin') return fail('Admin access required', 403);
  return user;
}

/** For write endpoints: returns an error response when Firebase is not
 *  configured, since writes have no seed fallback. */
export async function requireBackend(): Promise<NextResponse | null> {
  if (!firebaseReady()) return fail('Firebase is not connected. Set the Firebase keys in .env.local and run the seed script to enable this.', 503);
  return null;
}

export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const isResponse = (v: any): v is NextResponse => v instanceof NextResponse;
