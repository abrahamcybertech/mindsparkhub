import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, programme_slug, title, venue, start_time, end_time, description, status
      FROM events WHERE status = 'APPROVED'
      ORDER BY start_time ASC LIMIT 100
    `).all()) as any[];

    const events = rows.map((row) => ({
      id: row.id,
      programmeSlug: row.programme_slug,
      title: row.title,
      venue: row.venue,
      startTime: row.start_time,
      endTime: row.end_time,
      description: row.description,
      status: row.status,
    }));

    return apiJson(
      { events, serverTime: new Date().toISOString() },
      { cache: 'public, s-maxage=60, stale-while-revalidate=300' }
    );
  } catch {
    return apiError(503, 'The event schedule is temporarily unavailable.', 'CONTENT_UNAVAILABLE');
  }
}
