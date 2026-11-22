/**
 * Seed the library into Firebase.
 *
 *   cp .env.example .env.local   (fill in the Firebase keys + ADMIN_*)
 *   npm run seed
 *
 * Loads .env.local, upserts the categories, AI platforms, placeholder
 * resources and homepage content into Firestore, and creates the admin
 * account in Firebase Authentication from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Safe to re-run. Downloadable files for the placeholder resources are
 * generated on first download and stored in Firebase Storage.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Firebase is not configured: set FIREBASE_SERVICE_ACCOUNT (or GOOGLE_APPLICATION_CREDENTIALS) in .env.local. Aborting.');
  process.exit(1);
}
const bucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
initializeApp(raw
  ? { credential: cert(JSON.parse(raw)), storageBucket: bucket }
  : { storageBucket: bucket });

const db = getFirestore();
const data = JSON.parse(readFileSync(path.join(root, 'scripts', 'seed-data.json'), 'utf8'));
const now = new Date().toISOString();

for (const c of data.categories) {
  await db.collection('categories').doc(c.slug).set(
    { name: c.name, slug: c.slug, description: c.description ?? '', image: c.image ?? '' }, { merge: true });
}
console.log(`Categories: ${data.categories.length}`);

for (const p of data.platforms) {
  await db.collection('platforms').doc(p.slug).set(
    { name: p.name, slug: p.slug, url: p.url ?? '' }, { merge: true });
}
console.log(`Platforms: ${data.platforms.length}`);

for (const r of data.resources) {
  const { id: _seedId, ...rest } = r;
  await db.collection('resources').doc(r.slug).set(
    { ...rest, createdAt: r.createdAt ?? now, updatedAt: now }, { merge: true });
}
console.log(`Resources: ${data.resources.length} (placeholder examples, labelled in the UI)`);

await db.collection('siteContent').doc('main').set(data.content ?? {}, { merge: true });
console.log('Homepage content seeded.');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Studio Admin';
if (email && password && !/change-me/i.test(password)) {
  const auth = getAuth();
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`Admin already exists in Firebase Auth: ${email}`);
  } catch {
    user = await auth.createUser({ email, password, displayName: name, emailVerified: true });
    console.log(`Admin created in Firebase Auth: ${email}`);
  }
  await db.collection('users').doc(user.uid).set({
    name, email, role: 'admin', newsletter: false, createdAt: now, updatedAt: now,
  }, { merge: true });
  console.log('Admin profile written to Firestore with role "admin".');
} else {
  console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set (or still the example password) — skipping admin creation.');
}

console.log('Seed complete.');
process.exit(0);
