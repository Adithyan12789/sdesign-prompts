import { NextRequest, NextResponse } from 'next/server';
import { fail } from '@/lib/api';
import { findFile } from '@/lib/data';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { ensureSampleFile } from '@/lib/sample-files';
import { readFromStorage } from '@/lib/storage';
import { verifyDownloadToken } from '@/lib/tokens';
import { getSessionUser } from '@/lib/auth';

const MIME: Record<string, string> = {
  TXT: 'text/plain', PDF: 'application/pdf', ZIP: 'application/zip',
  JPG: 'image/jpeg', JPEG: 'image/jpeg', PNG: 'image/png', WEBP: 'image/webp', MP4: 'video/mp4',
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const token = req.nextUrl.searchParams.get('token') ?? '';
  const verified = verifyDownloadToken(token);
  if (!verified || verified.fileId !== fileId) return fail('Download link is invalid or has expired. Request a new one from the resource page.', 403);

  const found = await findFile(fileId);
  if (!found) return fail('File not found', 404);
  const { resource, file } = found;

  const buffer = file.storageKey.startsWith('sample-')
    ? await ensureSampleFile(resource, file.storageKey)
    : await readFromStorage(file.storageKey);
  if (!buffer) return fail('File is not available yet', 404);

  // Track the download.
  const db = getDb();
  const user = await getSessionUser();
  if (db) {
    const snap = await db.collection('resources').where('slug', '==', resource.slug).limit(1).get().catch(() => null);
    if (snap && !snap.empty) await snap.docs[0].ref.update({ downloads: FieldValue.increment(1) }).catch(() => {});
    await db.collection('downloadLogs').add({
      user: user?.id ?? null, userEmail: user?.email ?? null, resource: resource.slug,
      resourceTitle: resource.title, fileId, fileLabel: file.label, createdAt: new Date().toISOString(),
    }).catch(() => {});
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': MIME[file.format.toUpperCase()] ?? 'application/octet-stream',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="${file.originalName || fileId}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
