import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const searchParams = req.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim().slice(0, 80);
  const category = (searchParams.get('category') || '').trim().slice(0, 50);
  const page = Math.max(1, Math.min(100, Number.parseInt(searchParams.get('page') || '1', 10) || 1));
  const limit = Math.max(1, Math.min(20, Number.parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;

  try {
    const db = getDatabase();
    const where: string[] = ["is_published = 1", "published_at IS NOT NULL", "published_at <= ?"];
    const params: any[] = [new Date().toISOString()];

    if (q) {
      where.push('(title LIKE ? OR excerpt LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    const clause = where.join(' AND ');
    const totalRow = (await db.prepare(`SELECT COUNT(*) AS total FROM articles WHERE ${clause}`).get(...params)) as
      | { total: number | string }
      | undefined;
    const rows = (await db.prepare(`
      SELECT id, slug, title, excerpt, author_name, category, featured_image, reading_time_mins, published_at
      FROM articles WHERE ${clause}
      ORDER BY published_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset)) as any[];

    const articles = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      authorName: row.author_name,
      category: row.category,
      featuredImage: publicImageUrl(SITE.siteUrl, row.featured_image),
      readingTimeMins: row.reading_time_mins,
      publishedAt: row.published_at,
    }));

    const total = Number(totalRow?.total || 0);
    return apiJson(
      {
        articles,
        pagination: { page, limit, total, hasMore: offset + articles.length < total },
      },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Insights are temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
