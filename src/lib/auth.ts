import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getAdminAuth, getDb } from './firebase';
import type { SessionUser } from './types';

/**
 * Authentication & Sessions:
 * 1. Admin Access: Authenticated via numeric passcode (e.g. 192167) stored in
 *    ADMIN_PASSCODE. Signs an HMAC-SHA256 admin session token in ADMIN_COOKIE.
 * 2. Member Access: Authenticated via Firebase Authentication client SDK and
 *    session cookies verified by the Admin SDK.
 */

export const SESSION_COOKIE = 'atelier_session';
export const ADMIN_COOKIE = 'sdesign_admin_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MS / 1000,
    secure: process.env.NODE_ENV === 'production',
  };
}

/** Mint an HMAC-signed admin session token. */
export function signAdminToken(): string {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET || 'sdesign-admin-passcode-secret-key-32chars';
  const exp = Math.floor(Date.now() / 1000) + Math.floor(SESSION_MS / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp,
      id: 'admin',
      name: process.env.ADMIN_NAME || 'Studio Admin',
    })
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** Verify an HMAC-signed admin session token. */
export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const secret = process.env.DOWNLOAD_TOKEN_SECRET || 'sdesign-admin-passcode-secret-key-32chars';
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.role !== 'admin' || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Mint a Firebase session cookie from a verified ID token. */
export async function createSessionCookie(idToken: string): Promise<string | null> {
  const auth = getAdminAuth();
  if (!auth) return null;
  try {
    return await auth.createSessionCookie(idToken, { expiresIn: SESSION_MS });
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  // 1. Check for Admin Passcode Session
  const adminCookie = cookieStore.get(ADMIN_COOKIE)?.value;
  if (adminCookie && verifyAdminToken(adminCookie)) {
    return {
      id: 'admin',
      name: process.env.ADMIN_NAME || 'Studio Admin',
      email: process.env.ADMIN_EMAIL || 'admin@sdesign.local',
      role: 'admin',
    };
  }

  // 2. Check for Firebase User Session
  const auth = getAdminAuth();
  if (!auth) return null;
  try {
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const decoded = await auth.verifySessionCookie(token, true);
    const email = decoded.email ?? '';
    let name = email.split('@')[0] || 'Member';
    let role: SessionUser['role'] = 'user';
    const db = getDb();
    if (db) {
      const snap = await db.collection('users').doc(decoded.uid).get();
      if (snap.exists) {
        const d: any = snap.data();
        if (d.name) name = String(d.name);
        if (d.role === 'admin') role = 'admin';
      }
    }
    return { id: decoded.uid, name, email, role };
  } catch {
    return null;
  }
}

/** Create or update the Firestore profile for a Firebase user. */
export async function upsertUserProfile(
  uid: string,
  data: { name?: string; email: string; newsletter?: boolean }
) {
  const db = getDb();
  if (!db) return;
  const now = new Date().toISOString();
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({
      email: data.email,
      updatedAt: now,
      ...(data.name ? { name: data.name } : {}),
    });
  } else {
    await ref.set({
      name: data.name ?? (data.email.split('@')[0] || 'Member'),
      email: data.email,
      role: 'user',
      newsletter: Boolean(data.newsletter),
      createdAt: now,
      updatedAt: now,
    });
  }
  if (data.newsletter) {
    await db
      .collection('subscribers')
      .doc(data.email.toLowerCase())
      .set({ email: data.email.toLowerCase(), createdAt: now }, { merge: true });
  }
}
