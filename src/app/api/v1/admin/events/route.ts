import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, readJsonBody } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';
import { StaffEventUpdateSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'events:draft');
  if (!staff.ok) return staff.response;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, programme_slug, title, venue, start_time, end_time, description, status, created_at, updated_at
      FROM events ORDER BY start_time DESC LIMIT 100
    `).all()) as any[];

    return apiJson({
      events: rows.map((row) => ({
        id: row.id,
        programmeSlug: row.programme_slug,
        title: row.title,
        venue: row.venue,
        startTime: row.start_time,
        endTime: row.end_time,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch {
    return apiError(503, 'Events are temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}

export async function PUT(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'events:approve');
  if (!staff.ok) return staff.response;

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = StaffEventUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The update could not be validated.');
  }

  const { id, status } = parsed.data;

  try {
    const db = getDatabase();
    const existing = (await db.prepare('SELECT id, status FROM events WHERE id = ?').get(id)) as
      | { id: string; status: string }
      | undefined;
    if (!existing) {
      return apiError(404, 'This event could not be found.', 'NOT_FOUND');
    }

    const now = new Date().toISOString();
    const approvedBy = status === 'APPROVED' ? staff.session.user.id : null;
    await db.prepare(`
      UPDATE events SET status = ?, approved_by = COALESCE(?, approved_by), updated_at = ? WHERE id = ?
    `).run(status, approvedBy, now, id);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: 'MOBILE_EVENT_STATUS_UPDATED',
      targetEntity: 'events',
      targetId: id,
      details: `Mobile status change from ${existing.status} to ${status}`,
      outcome: 'SUCCESS',
    });

    return apiJson({ success: true, status });
  } catch {
    return apiError(503, 'The event could not be updated.', 'SERVICE_UNAVAILABLE');
  }
}
