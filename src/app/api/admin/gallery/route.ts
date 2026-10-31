import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { GalleryItemSchema } from '@/lib/validation';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const items = await db.prepare('SELECT * FROM gallery_items ORDER BY created_at DESC').all();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'gallery:manage')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to manage gallery' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = GalleryItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid gallery data' }, { status: 400 });
    }

    const data = parsed.data;

    // Additional Safeguarding Gate for Minors
    if (data.isMinorDepicted && !hasPermission(session.role, 'gallery:safeguard_approve')) {
      return NextResponse.json(
        { error: 'Forbidden: Only full Administrators can authorize and publish photographs depicting minors.' },
        { status: 403 }
      );
    }

    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO gallery_items (
        id, title, caption, alt_text, category, image_url, is_minor_depicted, consent_verified, consent_reference, is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title,
      data.caption,
      data.altText,
      data.category,
      data.imageUrl,
      data.isMinorDepicted ? 1 : 0,
      data.consentVerified ? 1 : 0,
      data.consentReference || null,
      data.isPublished ? 1 : 0,
      now
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'GALLERY_ITEM_CREATED',
      targetEntity: 'gallery_items',
      targetId: id,
      details: `Added ${data.title} (Minor: ${data.isMinorDepicted}, Consent: ${data.consentReference || 'N/A'})`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('Error creating gallery item:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    const db = getDatabase();

    // Check for Emergency Takedown Action
    if (action === 'takedown') {
      if (!hasPermission(session.role, 'gallery:takedown')) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions for emergency takedown' }, { status: 403 });
      }

      await db.prepare('UPDATE gallery_items SET is_published = 0 WHERE id = ?').run(id);

      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'GALLERY_EMERGENCY_TAKEDOWN',
        targetEntity: 'gallery_items',
        targetId: id,
        details: 'Emergency takedown executed. Item unpublished from public gallery.',
        outcome: 'SUCCESS',
      });

      return NextResponse.json({ success: true, message: 'Item immediately unpublished from public gallery.' });
    }

    // Toggle publish
    const { isPublished } = body;
    if (typeof isPublished === 'boolean') {
      await db.prepare('UPDATE gallery_items SET is_published = ? WHERE id = ?').run(isPublished ? 1 : 0, id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported update action' }, { status: 400 });
  } catch (err) {
    console.error('Error updating gallery item:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'gallery:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const db = getDatabase();
    await db.prepare('DELETE FROM gallery_items WHERE id = ?').run(id);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'GALLERY_ITEM_DELETED',
      targetEntity: 'gallery_items',
      targetId: id,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
