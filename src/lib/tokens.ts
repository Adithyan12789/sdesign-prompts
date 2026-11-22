import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET ?? 'dev-only-download-secret-change-me';

/** Short-lived signed download tokens. The token — never a storage URL —
 *  is what authorizes a file download, and only after access checks pass. */
export function signDownloadToken(fileId: string, userId: string | null, ttlSeconds = 600): string {
  const payload = Buffer.from(JSON.stringify({ f: fileId, u: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyDownloadToken(token: string): { fileId: string; userId: string | null } | null {
  const [payload, sig] = (token ?? '').split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.f || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { fileId: data.f, userId: data.u ?? null };
  } catch { return null; }
}
