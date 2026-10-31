import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { hasPermission } from '@/lib/auth/permissions';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, readJsonBody } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';
import { StaffGalleryUpdateSchema } from '@/lib/validation/mobile';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'gallery:manage');
  if (!staff.ok) return staff.response;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, title, caption, alt_text, category, image_url, is_minor_depicted,
             consent_verified, is_published, created_at
      FROM gallery_items ORDER BY created_at DESC LIMIT 100
    `).all()) as any[];

    return apiJson({
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        caption: row.caption,
        altText: row.alt_text,
        category: row.category,
        imageUrl: publicImageUrl(SITE.siteUrl, row.image_url),
        isMinorDepicted: Boolean(row.is_minor_depicted),
        consentVerified: Boolean(row.consent_verified),
        isPublished: Boolean(row.is_published),
        createdAt: row.created_at,
      })),
    });
  } catch {
    return apiError(503, 'The gallery is temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}

export async function PUT(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'gallery:manage');
  if (!staff.ok) return staff.response;

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = StaffGalleryUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The update could not be validated.');
  }

  const { id, action } = parsed.data;

  if (action === 'takedown' && !hasPermission(staff.session.user.role, 'gallery:takedown')) {
    return apiError(403, 'Only administrators can take down a gallery item.', 'FORBIDDEN');
  }

  try {
    const db = getDatabase();
    const existing = (await db.prepare(`
      SELECT id, title, is_minor_depicted, consent_verified, is_published FROM gallery_items WHERE id = ?
    `).get(id)) as
      | { id: string; title: string; is_minor_depicted: number | boolean; consent_verified: number | boolean; is_published: number | boolean }
      | undefined;
    if (!existing) {
      return apiError(404, 'This gallery item could not be found.', 'NOT_FOUND');
    }

    if (action === 'publish' && Boolean(existing.is_minor_depicted) && !Boolean(existing.consent_verified)) {
      return apiError(
        403,
        'This photograph shows a minor and cannot be published until institutional consent is verified.',
        'SAFEGUARDING_BLOCK'
      );
    }

    const isPublished = action !== 'unpublish' && action !== 'takedown';
    await db.prepare('UPDATE gallery_items SET is_published = ? WHERE id = ?').run(isPublished ? 1 : 0, id);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: action === 'takedown' ? 'MOBILE_GALLERY_EMERGENCY_TAKEDOWN' : 'MOBILE_GALLERY_PUBLISH_TOGGLED',
      targetEntity: 'gallery_items',
      targetId: id,
      details: `Mobile gallery action ${action} for "${existing.title}"`,
      outcome: 'SUCCESS',
    });

    return apiJson({ success: true, isPublished });
  } catch {
    return apiError(503, 'The gallery item could not be updated.', 'SERVICE_UNAVAILABLE');
  }
}
