import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, readJsonBody } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';
import { StaffAwardCreateSchema, StaffAwardDeleteSchema } from '@/lib/validation/mobile';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'content:read');
  if (!staff.ok) return staff.response;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, recipient_name, award_title, category, year, citation, image_url, order_index, created_at, updated_at
      FROM awards ORDER BY year DESC, order_index ASC, created_at DESC
    `).all()) as any[];

    return apiJson({
      awards: rows.map((row) => ({
        id: row.id,
        recipientName: row.recipient_name,
        awardTitle: row.award_title,
        category: row.category,
        year: row.year,
        citation: row.citation,
        imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
        orderIndex: row.order_index,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch {
    return apiError(503, 'Awards are temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'awards:manage');
  if (!staff.ok) return staff.response;

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;

  const parsed = StaffAwardCreateSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The award data could not be validated.');
  }

  const { recipientName, awardTitle, category, year, citation, imageUrl, orderIndex = 0 } = parsed.data;
  const id = `awd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  try {
    const db = getDatabase();
    await db.prepare(`
      INSERT INTO awards (id, recipient_name, award_title, category, year, citation, image_url, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, recipientName, awardTitle, category, year, citation, imageUrl || '', orderIndex, now, now);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: 'AWARDS_CREATE',
      targetEntity: 'award',
      targetId: id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      details: JSON.stringify({ recipientName, awardTitle, category, year }),
      outcome: 'SUCCESS',
    });

    return apiJson(
      {
        award: {
          id,
          recipientName,
          awardTitle,
          category,
          year,
          citation,
          imageUrl: publicImageUrl(SITE.siteUrl, imageUrl || ''),
          orderIndex,
          createdAt: now,
          updatedAt: now,
        },
      },
      { status: 201 }
    );
  } catch {
    return apiError(500, 'Failed to save award honor to database.', 'INTERNAL_ERROR');
  }
}

export async function DELETE(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'awards:manage');
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('id');

  let targetId = queryId;
  if (!targetId) {
    const body = await readJsonBody(req);
    if (body.ok) {
      const parsed = StaffAwardDeleteSchema.safeParse(body.data);
      if (parsed.success) {
        targetId = parsed.data.id;
      }
    }
  }

  if (!targetId) {
    return apiError(400, 'Award ID must be specified to delete.', 'INVALID_PARAMETERS');
  }

  try {
    const db = getDatabase();
    const existing = await db.prepare('SELECT id, recipient_name, award_title FROM awards WHERE id = ?').get(targetId);
    if (!existing) {
      return apiError(404, 'The specified award was not found.', 'NOT_FOUND');
    }

    await db.prepare('DELETE FROM awards WHERE id = ?').run(targetId);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: 'AWARDS_DELETE',
      targetEntity: 'award',
      targetId,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      details: JSON.stringify({ recipientName: existing.recipient_name, awardTitle: existing.award_title }),
      outcome: 'SUCCESS',
    });

    return apiJson({ success: true, id: targetId });
  } catch {
    return apiError(500, 'Failed to delete award from database.', 'INTERNAL_ERROR');
  }
}
