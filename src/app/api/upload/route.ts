import { NextRequest } from 'next/server';
import { fail, isResponse, ok, requireAdmin } from '@/lib/api';
import { saveToStorage, validateUpload } from '@/lib/storage';

/** Admin media/file upload. Files land in private storage; the response
 *  returns a storage key (for resource files) or a served path (images
 *  and videos are also copied to /public/uploads for display). */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(); if (isResponse(admin)) return admin;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file') as File | null;
  const kind = String(form?.get('kind') ?? 'image');
  if (!file) return fail('No file provided');
  const error = validateUpload(kind, file.name, file.size);
  if (error) return fail(error);
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = await saveToStorage(buffer, file.name);
  let url: string | undefined;
  if (kind === 'image' || kind === 'video') {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, key), buffer);
    url = `/uploads/${key}`;
  }
  return ok({ storageKey: key, url, size: file.size, originalName: file.name }, 201);
}
