import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { hasPermission } from '@/lib/auth/permissions';
import { apiError, apiJson } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req);
  if (!staff.ok) return staff.response;
  const { user } = staff.session;

  try {
    const db = getDatabase();
    const summary: Record<string, number> = {};

    if (hasPermission(user.role, 'inquiries:view')) {
      const row = (await db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE status = 'NEW'").get()) as
        | { count: number | string }
        | undefined;
      summary.newInquiries = Number(row?.count || 0);
    }
    if (hasPermission(user.role, 'events:approve')) {
      const row = (await db.prepare("SELECT COUNT(*) AS count FROM events WHERE status = 'PENDING_APPROVAL'").get()) as
        | { count: number | string }
        | undefined;
      summary.pendingEvents = Number(row?.count || 0);
    }
    if (hasPermission(user.role, 'articles:manage')) {
      const published = (await db.prepare('SELECT COUNT(*) AS count FROM articles WHERE is_published = 1').get()) as
        | { count: number | string }
        | undefined;
      const drafts = (await db.prepare('SELECT COUNT(*) AS count FROM articles WHERE is_published = 0').get()) as
        | { count: number | string }
        | undefined;
      summary.publishedArticles = Number(published?.count || 0);
      summary.draftArticles = Number(drafts?.count || 0);
    }
    if (hasPermission(user.role, 'gallery:manage')) {
      const row = (await db.prepare('SELECT COUNT(*) AS count FROM gallery_items WHERE is_published = 1').get()) as
        | { count: number | string }
        | undefined;
      summary.publishedGalleryItems = Number(row?.count || 0);
    }
    if (hasPermission(user.role, 'audit:view')) {
      const row = (await db.prepare('SELECT COUNT(*) AS count FROM audit_logs').get()) as
        | { count: number | string }
        | undefined;
      summary.auditEntries = Number(row?.count || 0);
      const reports = (await db.prepare("SELECT COUNT(*) AS count FROM image_reports WHERE status = 'NEW'").get()) as
        | { count: number | string }
        | undefined;
      summary.openImageReports = Number(reports?.count || 0);
    }

    return apiJson({ user, summary });
  } catch {
    return apiError(503, 'The staff summary is temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}
