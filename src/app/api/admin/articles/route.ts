import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { ArticleSchema } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/security/sanitizer';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const articles = await db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'articles:manage')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to manage articles' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = ArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid article data' }, { status: 400 });
    }

    const data = parsed.data;
    const cleanContent = sanitizeHtml(data.content);
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO articles (
        id, slug, title, excerpt, content, author_name, category, featured_image, reading_time_mins, is_published, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.slug,
      data.title,
      data.excerpt,
      cleanContent,
      data.authorName,
      data.category,
      data.featuredImage,
      data.readingTimeMins,
      data.isPublished ? 1 : 0,
      data.isPublished ? now : null,
      now
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'ARTICLE_CREATED',
      targetEntity: 'articles',
      targetId: id,
      details: `Created article "${data.title}" (Published: ${data.isPublished})`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    if (err?.code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json({ error: 'An article with this URL slug already exists.' }, { status: 400 });
    }
    console.error('Error creating article:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'articles:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isPublished } = body;

    if (!id) return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });

    const db = getDatabase();
    const now = new Date().toISOString();

    if (typeof isPublished === 'boolean') {
      await db.prepare('UPDATE articles SET is_published = ?, published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN ? ELSE published_at END WHERE id = ?').run(
        isPublished ? 1 : 0,
        isPublished ? 1 : 0,
        now,
        id
      );

      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'ARTICLE_PUBLISH_TOGGLED',
        targetEntity: 'articles',
        targetId: id,
        details: `Publish state set to ${isPublished}`,
        outcome: 'SUCCESS',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported update' }, { status: 400 });
  } catch (err) {
    console.error('Error updating article:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
