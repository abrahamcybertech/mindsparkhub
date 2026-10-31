import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

const CATEGORIES = new Set(['ssi', 'cs', 'ce', 'seminar', 'mentorship', 'outreach']);

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const category = req.nextUrl.searchParams.get('category');
  if (category && !CATEGORIES.has(category)) {
    return apiError(400, 'That gallery category is not recognised.', 'INVALID_CATEGORY');
  }

  try {
    const db = getDatabase();
    const rows = (category
      ? await db.prepare(`
          SELECT id, title, caption, alt_text, category, image_url, is_minor_depicted, created_at
          FROM gallery_items
          WHERE category = ? AND is_published = 1
            AND (is_minor_depicted = 0 OR consent_verified = 1)
          ORDER BY created_at DESC LIMIT 100
        `).all(category)
      : await db.prepare(`
          SELECT id, title, caption, alt_text, category, image_url, is_minor_depicted, created_at
          FROM gallery_items
          WHERE is_published = 1
            AND (is_minor_depicted = 0 OR consent_verified = 1)
          ORDER BY created_at DESC LIMIT 100
        `).all()) as any[];

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      caption: row.caption,
      altText: row.alt_text,
      category: row.category,
      imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
      isMinorDepicted: Boolean(row.is_minor_depicted),
      createdAt: row.created_at,
    }));

    return apiJson(
      { items, categories: Array.from(CATEGORIES) },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'The impact gallery is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
