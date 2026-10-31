import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { publicImageUrl } from '@/lib/api/content';
import { ABOUT, HOME, SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  try {
    const db = getDatabase();
    const programmeRows = (await db.prepare(`
      SELECT slug, title, tagline, audience FROM programmes WHERE is_active = 1 ORDER BY id ASC
    `).all()) as any[];
    const galleryRows = (await db.prepare(`
      SELECT id, title, caption, alt_text, category, image_url
      FROM gallery_items
      WHERE is_published = 1 AND (is_minor_depicted = 0 OR consent_verified = 1)
      ORDER BY created_at DESC LIMIT 3
    `).all()) as any[];

    return apiJson(
      {
        site: SITE,
        home: HOME,
        about: ABOUT,
        programmes: programmeRows.map((row) => ({
          slug: row.slug,
          title: row.title,
          tagline: row.tagline,
          audience: row.audience,
        })),
        gallery: galleryRows.map((row) => ({
          id: row.id,
          title: row.title,
          caption: row.caption,
          altText: row.alt_text,
          category: row.category,
          imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
        })),
      },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Home content is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
