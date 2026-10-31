import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { htmlToBlocks, publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9-]{3,100}$/;

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const slug = context.params.slug;
  if (!SLUG_PATTERN.test(slug)) {
    return apiError(404, 'This article could not be found.', 'NOT_FOUND');
  }

  try {
    const db = getDatabase();
    const row = (await db.prepare(`
      SELECT id, slug, title, excerpt, content, author_name, category, featured_image, reading_time_mins, published_at
      FROM articles
      WHERE slug = ? AND is_published = 1 AND published_at IS NOT NULL AND published_at <= ?
    `).get(slug, new Date().toISOString())) as any;

    if (!row) {
      return apiError(404, 'This article could not be found.', 'NOT_FOUND');
    }

    const related = (await db.prepare(`
      SELECT id, slug, title, excerpt, category, featured_image, reading_time_mins, published_at
      FROM articles
      WHERE is_published = 1 AND published_at IS NOT NULL AND published_at <= ?
        AND slug <> ? AND category = ?
      ORDER BY published_at DESC LIMIT 3
    `).all(new Date().toISOString(), slug, row.category)) as any[];

    return apiJson(
      {
        article: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt,
          authorName: row.author_name,
          category: row.category,
          featuredImage: publicImageUrl(SITE.siteUrl, row.featured_image),
          readingTimeMins: row.reading_time_mins,
          publishedAt: row.published_at,
          canonicalUrl: `${SITE.siteUrl}/insights/${row.slug}`,
          blocks: htmlToBlocks(row.content),
        },
        related: related.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          category: item.category,
          featuredImage: publicImageUrl(SITE.siteUrl, item.featured_image),
          readingTimeMins: item.reading_time_mins,
          publishedAt: item.published_at,
        })),
      },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Insights are temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
