import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { mosque } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const BASE_URL = 'https://firstrow.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mosques = await db
    .select({ slug: mosque.slug })
    .from(mosque)
    .where(eq(mosque.status, 'active'))

  const mosqueUrls: MetadataRoute.Sitemap = mosques.map(({ slug }) => ({
    url: `${BASE_URL}/mosque/${slug}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/areas/tower-hamlets`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...mosqueUrls,
  ]
}
