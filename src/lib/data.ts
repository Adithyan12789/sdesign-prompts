import { getDb } from './firebase';
import { SEED_CATEGORIES, SEED_CONTENT, SEED_PLATFORMS, SEED_RESOURCES } from './seed-data';
import type { CategoryItem, PlatformItem, ResourceItem, SiteContentData } from './types';

/**
 * Read layer — Firestore when Firebase is configured, otherwise the
 * bundled placeholder library (review mode). The library is small, so
 * reads fetch the collection and share one in-memory filter/sort/page
 * implementation for both backends.
 */

export interface ResourceQuery {
  q?: string; category?: string; type?: string; platform?: string; access?: string;
  featured?: boolean; sort?: 'newest' | 'popular'; page?: number; limit?: number;
  includeDrafts?: boolean;
}

function toResource(id: string, o: any): ResourceItem {
  return {
    id, title: o.title, slug: o.slug,
    shortDescription: o.shortDescription ?? '', description: o.description ?? '',
    thumbnail: o.thumbnail ?? '', previewImages: o.previewImages ?? [], previewVideo: o.previewVideo,
    category: o.category, type: o.type, platforms: o.platforms ?? [], difficulty: o.difficulty,
    promptContent: o.promptContent ?? '', instructions: o.instructions ?? [], files: o.files ?? [],
    access: o.access ?? 'free', featured: Boolean(o.featured), status: o.status ?? 'published',
    downloads: o.downloads ?? 0, views: o.views ?? 0,
    createdAt: o.createdAt ?? new Date().toISOString(), updatedAt: o.updatedAt ?? new Date().toISOString(),
    placeholder: Boolean(o.placeholder),
  };
}

async function allResources(): Promise<ResourceItem[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await db.collection('resources').get();
    if (snap.empty) return null;
    return snap.docs.map((d) => toResource(d.id, d.data()));
  } catch {
    return null;
  }
}

export function filterResources(list: ResourceItem[], query: ResourceQuery): { items: ResourceItem[]; total: number; pages: number } {
  let out = list.filter((r) => (query.includeDrafts ? true : r.status === 'published'));
  if (query.featured) out = out.filter((r) => r.featured);
  if (query.category) out = out.filter((r) => r.category === query.category);
  if (query.type) out = out.filter((r) => r.type === query.type);
  if (query.platform) out = out.filter((r) => r.platforms.includes(query.platform!));
  if (query.access) out = out.filter((r) => r.access === query.access);
  if (query.q) {
    const q = query.q.toLowerCase();
    out = out.filter((r) => [r.title, r.shortDescription, r.description, r.promptContent].join(' ').toLowerCase().includes(q));
  }
  out.sort((a, b) => query.sort === 'popular'
    ? b.downloads - a.downloads
    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(48, Math.max(1, query.limit ?? 12));
  const total = out.length;
  return { items: out.slice((page - 1) * limit, page * limit), total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function listResources(query: ResourceQuery) {
  const live = await allResources();
  if (live) return filterResources(live, query);
  return filterResources(SEED_RESOURCES, query);
}

export async function getResourceBySlug(slug: string, includeDrafts = false): Promise<ResourceItem | null> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.collection('resources').where('slug', '==', slug).limit(1).get();
      if (!snap.empty) {
        const r = toResource(snap.docs[0].id, snap.docs[0].data());
        return includeDrafts || r.status === 'published' ? r : null;
      }
      return null;
    } catch { /* fall through to seed */ }
  }
  const r = SEED_RESOURCES.find((x) => x.slug === slug);
  return r && (includeDrafts || r.status === 'published') ? r : null;
}

export async function getResourceById(id: string): Promise<ResourceItem | null> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.collection('resources').doc(id).get();
      if (snap.exists) return toResource(snap.id, snap.data());
      return null;
    } catch { /* fall through to seed */ }
  }
  return SEED_RESOURCES.find((x) => x.id === id) ?? null;
}

export async function listCategories(): Promise<CategoryItem[]> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.collection('categories').get();
      if (!snap.empty) return snap.docs.map((d) => { const o: any = d.data(); return { id: d.id, name: o.name, slug: o.slug, description: o.description ?? '', image: o.image ?? '' }; });
    } catch { /* seed fallback */ }
  }
  return SEED_CATEGORIES;
}

export async function listPlatforms(): Promise<PlatformItem[]> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.collection('platforms').get();
      if (!snap.empty) return snap.docs.map((d) => { const o: any = d.data(); return { id: d.id, name: o.name, slug: o.slug, url: o.url ?? '' }; });
    } catch { /* seed fallback */ }
  }
  return SEED_PLATFORMS;
}

export async function getSiteContent(): Promise<SiteContentData> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.collection('siteContent').doc('main').get();
      if (snap.exists) {
        const data: any = snap.data();
        if (data && Object.keys(data).length) return { ...SEED_CONTENT, ...data };
      }
    } catch { /* seed fallback */ }
  }
  return SEED_CONTENT;
}

export async function findFile(fileId: string): Promise<{ resource: ResourceItem; file: ResourceItem['files'][number] } | null> {
  const live = await allResources();
  const list = live ?? SEED_RESOURCES;
  for (const r of list) {
    const file = r.files.find((f) => f.id === fileId);
    if (file) return { resource: r, file };
  }
  return null;
}

/** Public view of a resource: private storage keys are never sent to
 *  clients. Downloads are authorized per-file via signed tokens. */
export function publicResource(r: ResourceItem): ResourceItem {
  return { ...r, files: r.files.map((f) => ({ ...f, storageKey: '' })) };
}
export function publicList(result: { items: ResourceItem[]; total: number; pages: number }) {
  return { ...result, items: result.items.map(publicResource) };
}
