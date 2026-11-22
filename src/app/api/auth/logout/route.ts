import { cookies } from 'next/headers';
import { ok } from '@/lib/api';
import { ADMIN_COOKIE, SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  cookieStore.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return ok({});
}
