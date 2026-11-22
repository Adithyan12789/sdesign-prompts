import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { getAdminStorage } from './firebase';

/**
 * File storage — Firebase Storage (cloud bucket) when Firebase is
 * configured; otherwise a private local folder so review mode keeps
 * working offline. Files are never public: the bucket stays private and
 * every download is streamed by the API after access checks and a
 * signed-token verification.
 */

const ROOT = path.join(process.cwd(), 'storage', 'files');

export const UPLOAD_RULES: Record<string, { exts: string[]; maxBytes: number }> = {
  image: { exts: ['.jpg', '.jpeg', '.png', '.webp'], maxBytes: 10 * 1024 * 1024 },
  video: { exts: ['.mp4', '.webm', '.mov'], maxBytes: 200 * 1024 * 1024 },
  pdf: { exts: ['.pdf'], maxBytes: 50 * 1024 * 1024 },
  txt: { exts: ['.txt'], maxBytes: 5 * 1024 * 1024 },
  zip: { exts: ['.zip'], maxBytes: 200 * 1024 * 1024 },
};

export function validateUpload(kind: string, filename: string, size: number): string | null {
  const rule = UPLOAD_RULES[kind];
  if (!rule) return 'Unknown upload kind';
  const ext = path.extname(filename).toLowerCase();
  if (!rule.exts.includes(ext)) return `File type ${ext || '(none)'} is not allowed for ${kind} uploads`;
  if (size > rule.maxBytes) return `File exceeds the ${Math.round(rule.maxBytes / 1024 / 1024)} MB limit for ${kind} uploads`;
  return null;
}

function bucketFile(key: string) {
  const storage = getAdminStorage();
  if (!storage) return null;
  try {
    return storage.bucket().file(`files/${path.basename(key)}`);
  } catch {
    return null;
  }
}

export async function saveToStorage(buffer: Buffer, filename: string): Promise<string> {
  const key = `${randomUUID()}${path.extname(filename).toLowerCase()}`;
  const file = bucketFile(key);
  if (file) {
    await file.save(buffer, { resumable: false });
    return key;
  }
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, key), buffer);
  return key;
}

export async function saveNamedToStorage(buffer: Buffer, key: string): Promise<string> {
  const safe = path.basename(key);
  const file = bucketFile(safe);
  if (file) {
    await file.save(buffer, { resumable: false });
    return safe;
  }
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, safe), buffer);
  return safe;
}

export async function readFromStorage(key: string): Promise<Buffer | null> {
  const safe = path.basename(key ?? '');
  if (!safe) return null;
  const file = bucketFile(safe);
  if (file) {
    try {
      const [buf] = await file.download();
      return buf;
    } catch {
      return null;
    }
  }
  try { return await fs.readFile(path.join(ROOT, safe)); } catch { return null; }
}

export async function storageExists(key: string): Promise<boolean> {
  const file = bucketFile(key);
  if (file) {
    try {
      const [exists] = await file.exists();
      return exists;
    } catch {
      return false;
    }
  }
  try { await fs.access(path.join(ROOT, path.basename(key))); return true; } catch { return false; }
}

/** 'firebase' when the cloud bucket is active, else 'local'. */
export function storageBackend(): 'firebase' | 'local' {
  return getAdminStorage() ? 'firebase' : 'local';
}
