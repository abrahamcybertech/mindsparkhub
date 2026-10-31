import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, readJsonBody } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';
import { StaffArticleUpdateSchema } from '@/lib/validation/mobile';
import { publicImageUrl } from '@/lib/api/content';
import { SITE } from '@/content/public';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'articles:manage');
  if (!staff.ok) return staff.response;

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, slug, title, excerpt, category, featured_image, reading_time_mins,
             is_published, published_at, created_at
      FROM articles ORDER BY created_at DESC LIMIT 100
    `).all()) as any[];

    return apiJson({
      articles: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        category: row.category,
        featuredImage: publicImageUrl(SITE.siteUrl, row.featured_image),
        readingTimeMins: row.reading_time_mins,
        isPublished: Boolean(row.is_published),
        publishedAt: row.published_at,
        createdAt: row.created_at,
      })),
    });
  } catch {
    return apiError(503, 'Articles are temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}

export async function PUT(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'articles:publish');
  if (!staff.ok) return staff.response;

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = StaffArticleUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The update could not be validated.');
  }

  const { id, isPublished } = parsed.data;

  try {
    const db = getDatabase();
    const existing = (await db.prepare('SELECT id, title, is_published FROM articles WHERE id = ?').get(id)) as
      | { id: string; title: string; is_published: number | boolean }
      | undefined;
    if (!existing) {
      return apiError(404, 'This article could not be found.', 'NOT_FOUND');
    }

    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE articles SET is_published = ?,
        published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN ? ELSE published_at END
      WHERE id = ?
    `).run(isPublished ? 1 : 0, isPublished ? 1 : 0, now, id);

    await recordAuditLog({
      actorId: staff.session.user.id,
      actorRole: staff.session.user.role,
      action: 'MOBILE_ARTICLE_PUBLISH_TOGGLED',
      targetEntity: 'articles',
      targetId: id,
      details: `Mobile publish state for "${existing.title}" set to ${isPublished}`,
      outcome: 'SUCCESS',
    });

    return apiJson({ success: true, isPublished });
  } catch {
    return apiError(503, 'The article could not be updated.', 'SERVICE_UNAVAILABLE');
  }
}
