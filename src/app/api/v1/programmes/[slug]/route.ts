import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { publicImageUrl, textToBlocks } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

const SLUGS = new Set(['ssi', 'cs', 'ce']);

function parseList(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const slug = context.params.slug;
  if (!SLUGS.has(slug)) {
    return apiError(404, 'This programme could not be found.', 'NOT_FOUND');
  }

  try {
    const db = getDatabase();
    const row = (await db.prepare(`
      SELECT id, slug, title, tagline, audience, objectives_json, content, updated_at
      FROM programmes WHERE slug = ? AND is_active = 1
    `).get(slug)) as any;

    if (!row) {
      return apiError(404, 'This programme could not be found.', 'NOT_FOUND');
    }

    const events = (await db.prepare(`
      SELECT id, programme_slug, title, venue, start_time, end_time, description, status
      FROM events WHERE programme_slug = ? AND status = 'APPROVED'
      ORDER BY start_time ASC LIMIT 10
    `).all(slug)) as any[];

    const gallery = (await db.prepare(`
      SELECT id, title, caption, alt_text, category, image_url, is_minor_depicted
      FROM gallery_items
      WHERE category = ? AND is_published = 1
        AND (is_minor_depicted = 0 OR consent_verified = 1)
      ORDER BY created_at DESC LIMIT 12
    `).all(slug)) as any[];

    return apiJson(
      {
        programme: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          tagline: row.tagline,
          audience: row.audience,
          objectives: parseList(row.objectives_json),
          content: row.content,
          blocks: textToBlocks(row.content),
          updatedAt: row.updated_at,
        },
        events: events.map((event) => ({
          id: event.id,
          programmeSlug: event.programme_slug,
          title: event.title,
          venue: event.venue,
          startTime: event.start_time,
          endTime: event.end_time,
          description: event.description,
          status: event.status,
        })),
        gallery: gallery.map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption,
          altText: item.alt_text,
          category: item.category,
          imageUrl: publicImageUrl(SITE.siteUrl, item.image_url),
          isMinorDepicted: Boolean(item.is_minor_depicted),
        })),
      },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'Programme information is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
