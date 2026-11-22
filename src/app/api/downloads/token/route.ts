import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';
import { findFile } from '@/lib/data';
import { signDownloadToken } from '@/lib/tokens';

/** Issues a short-lived signed download URL after access validation.
 *  Premium resources require a signed-in account. Storage keys and raw
 *  file paths are never exposed to the client. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const fileId = String(body?.fileId ?? '');
  if (!fileId) return fail('fileId is required');
  const found = await findFile(fileId);
  if (!found) return fail('File not found', 404);
  if (found.resource.status !== 'published') return fail('Resource is not published', 404);
  const user = await getSessionUser();
  if (found.resource.access === 'premium' && !user) {
    return fail('This is a premium resource. Sign in to download it.', 401);
  }
  const token = signDownloadToken(fileId, user?.id ?? null);
  return ok({ url: `/api/downloads/${encodeURIComponent(fileId)}?token=${token}`, expiresInSeconds: 600 });
}
