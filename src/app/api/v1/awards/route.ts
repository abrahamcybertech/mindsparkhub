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

  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const year = searchParams.get('year');

    let query = `
      SELECT id, recipient_name, award_title, category, year, citation, image_url, order_index, created_at
      FROM awards
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category && category !== 'ALL') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (year) {
      query += ` AND year = ?`;
      params.push(Number(year));
    }

    query += ` ORDER BY year DESC, order_index ASC, created_at DESC`;

    const rows = (await db.prepare(query).all(...params)) as any[];

    // Extract unique categories
    const catRows = (await db.prepare(`SELECT DISTINCT category FROM awards ORDER BY category ASC`).all()) as any[];
    const categories = catRows.map((r) => r.category).filter(Boolean);

    const awards = rows.map((row) => ({
      id: row.id,
      recipientName: row.recipient_name,
      awardTitle: row.award_title,
      category: row.category,
      year: row.year,
      citation: row.citation,
      imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
      orderIndex: row.order_index,
      createdAt: row.created_at,
    }));

    return apiJson(
      { awards, categories },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Awards and honors are temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}
