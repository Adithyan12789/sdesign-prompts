import type { MetadataRoute } from 'next';
import { listResources, listCategories } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const [resourcesRes, categoriesRes] = await Promise.all([
      listResources({ limit: 100 }),
      listCategories(),
    ]);

    for (const item of resourcesRes.items) {
      routes.push({
        url: `${baseUrl}/resources/${item.slug}`,
        lastModified: new Date(item.updatedAt || item.createdAt),
        changeFrequency: 'weekly',
        priority: item.featured ? 0.8 : 0.6,
      });
    }

    for (const cat of categoriesRes) {
      routes.push({
        url: `${baseUrl}/resources?category=${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // If database unavailable during build, proceed with default static routes
  }

  return routes;
}
