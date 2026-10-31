import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

function parseList(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, slug, title, tagline, audience, objectives_json, content, updated_at
      FROM programmes WHERE is_active = 1 ORDER BY id ASC
    `).all()) as any[];

    const programmes = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      tagline: row.tagline,
      audience: row.audience,
      objectives: parseList(row.objectives_json),
      content: row.content,
      updatedAt: row.updated_at,
    }));

    return apiJson(
      { programmes },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Programme information is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
