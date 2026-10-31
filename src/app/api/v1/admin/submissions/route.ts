import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, readJsonBody } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';
import { StaffSubmissionUpdateSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'inquiries:view');
  if (!staff.ok) return staff.response;

  const status = req.nextUrl.searchParams.get('status');
  const type = req.nextUrl.searchParams.get('type');
  const where: string[] = [];
  const params: any[] = [];
  if (status && ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'ARCHIVED'].includes(status)) {
    where.push('status = ?');
    params.push(status);
  }
  if (type && ['general', 'programme', 'partnership', 'join', 'volunteer', 'mentor', 'support'].includes(type)) {
    where.push('type = ?');
    params.push(type);
  }

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, reference_code, type, full_name, email, phone_number, interests, message,
             status, internal_notes, created_at
      FROM submissions
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC LIMIT 100
    `).all(...params)) as any[];

    return apiJson({
      submissions: rows.map((row) => ({
        id: row.id,
        referenceCode: row.reference_code,
        type: row.type,
        fullName: row.full_name,
        email: row.email,
        phoneNumber: row.phone_number,
        interests: row.interests,
        message: row.message,
        status: row.status,
        internalNotes: row.internal_notes,
        createdAt: row.created_at,
      })),
    });
  } catch {
    return apiError(503, 'Enquiries are temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}

export async function PUT(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'inquiries:manage');
  if (!staff.ok) return staff.response;

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = StaffSubmissionUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The update could not be validated.');
  }

  const { id, status, internalNotes } = parsed.data;
  if (!status && internalNotes === undefined) {
    return apiError(400, 'No update was provided.');
  }

  try {
    const db = getDatabase();
    const existing = (await db.prepare('SELECT id FROM submissions WHERE id = ?').get(id)) as
      | { id: string }
      | undefined;
    if (!existing) {
      return apiError(404, 'This enquiry could not be found.', 'NOT_FOUND');
    }

    await db.prepare(`
      UPDATE submissions SET
        status = COALESCE(?, status),
        internal_notes = COALESCE(?, internal_notes)
      WHERE id = ?
    `).run(status || null, internalNotes === undefined ? null : internalNotes, id);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: 'MOBILE_SUBMISSION_UPDATED',
      targetEntity: 'submissions',
      targetId: id,
      details: `Mobile update. Status: ${status || 'unchanged'}. Notes updated: ${internalNotes !== undefined}`,
      outcome: 'SUCCESS',
    });

    return apiJson({ success: true });
  } catch {
    return apiError(503, 'The enquiry could not be updated.', 'SERVICE_UNAVAILABLE');
  }
}
