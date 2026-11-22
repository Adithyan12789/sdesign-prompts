import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { fail, ok } from '@/lib/api';
import { ADMIN_COOKIE, sessionCookieOptions, signAdminToken } from '@/lib/auth';

/**
 * Admin passcode authentication route:
 * Validates a numeric code (e.g. 192167) against ADMIN_PASSCODE
 * and mints an authenticated admin session cookie.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const passcode = String(body?.passcode ?? '').trim();
  const configuredPasscode = String(process.env.ADMIN_PASSCODE || '192167').trim();

  if (!passcode) {
    return fail('Please enter the admin passcode', 400);
  }

  if (passcode !== configuredPasscode) {
    return fail('Incorrect admin passcode. Please try again.', 401);
  }

  const token = signAdminToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, sessionCookieOptions());

  return ok({
    user: {
      id: 'admin',
      name: process.env.ADMIN_NAME || 'Studio Admin',
      email: process.env.ADMIN_EMAIL || 'admin@sdesign.local',
      role: 'admin',
    },
  });
}
