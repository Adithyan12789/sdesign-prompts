import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

/**
 * Firebase Admin (server-side) — Firestore, Auth and Storage.
 *
 * Configure with either:
 *  - FIREBASE_SERVICE_ACCOUNT: the service-account JSON, stringified, or
 *  - GOOGLE_APPLICATION_CREDENTIALS: path to the JSON file (standard GCP).
 * Plus NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (or FIREBASE_STORAGE_BUCKET).
 *
 * When unconfigured, the app runs in review mode: reads fall back to the
 * bundled placeholder library and writes return 503.
 */

let app: App | null = null;
let initError: string | null = null;
let attempted = false;

function init(): App | null {
  if (attempted) return app;
  attempted = true;
  try {
    if (getApps().length) { app = getApps()[0]; return app; }
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const bucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;
    if (raw) {
      const creds = JSON.parse(raw);
      app = initializeApp({ credential: cert(creds), storageBucket: bucket ?? `${creds.project_id}.appspot.com` });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      app = initializeApp({ storageBucket: bucket });
    } else {
      initError = 'Firebase is not configured (set FIREBASE_SERVICE_ACCOUNT).';
      return null;
    }
    return app;
  } catch (e: any) {
    initError = e?.message ?? 'Firebase init failed';
    return null;
  }
}

export function firebaseReady(): boolean { return init() !== null; }
export function firebaseError(): string | null { init(); return initError; }

export function getDb(): Firestore | null {
  const a = init(); if (!a) return null;
  try { return getFirestore(a); } catch { return null; }
}
export function getAdminAuth(): Auth | null {
  const a = init(); if (!a) return null;
  try { return getAuth(a); } catch { return null; }
}
export function getAdminStorage(): Storage | null {
  const a = init(); if (!a) return null;
  try { return getStorage(a); } catch { return null; }
}
