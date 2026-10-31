import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

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
    const unitRows = (await db.prepare(`
      SELECT id, slug, name, unit_head_name, description, core_functions_json, guiding_rules_json, order_index
      FROM units ORDER BY order_index ASC
    `).all()) as any[];
    const peopleRows = (await db.prepare(`
      SELECT id, name, role_title, unit_slug, bio, image_url, order_index
      FROM exco_members WHERE is_published = 1 ORDER BY order_index ASC
    `).all()) as any[];

    const units = unitRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      unitHeadName: row.unit_head_name,
      description: row.description,
      coreFunctions: parseList(row.core_functions_json),
      guidingRules: parseList(row.guiding_rules_json),
      orderIndex: row.order_index,
    }));

    const people = peopleRows.map((row) => ({
      id: row.id,
      name: row.name,
      roleTitle: row.role_title,
      unitSlug: row.unit_slug,
      bio: row.bio,
      imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
      orderIndex: row.order_index,
    }));

    return apiJson(
      { units, people },
      { cache: 'public, s-maxage=120, stale-while-revalidate=600' }
    );
  } catch {
    return apiError(503, 'Organisational structure information is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
