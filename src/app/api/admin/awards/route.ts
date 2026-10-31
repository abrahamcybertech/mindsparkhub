import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { z } from 'zod';

const AwardInputSchema = z.object({
  recipientName: z.string().trim().min(2, 'Recipient name is required').max(150),
  awardTitle: z.string().trim().min(3, 'Award title is required').max(200),
  category: z.string().trim().min(2, 'Category is required').max(100),
  year: z.coerce.number().int().min(2020).max(2050),
  citation: z.string().trim().min(10, 'Citation must be at least 10 characters').max(2000),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  orderIndex: z.coerce.number().int().min(0).max(1000).optional(),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const awards = await db.prepare('SELECT * FROM awards ORDER BY year DESC, order_index ASC, created_at DESC').all();
  return NextResponse.json({ awards });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'awards:manage')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to manage awards' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = AwardInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid award data' }, { status: 400 });
    }

    const { recipientName, awardTitle, category, year, citation, imageUrl, orderIndex = 0 } = parsed.data;
    const id = `awd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const db = getDatabase();
    await db.prepare(`
      INSERT INTO awards (id, recipient_name, award_title, category, year, citation, image_url, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, recipientName, awardTitle, category, year, citation, imageUrl || '', orderIndex, now, now);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'AWARDS_CREATE',
      targetEntity: 'award',
      targetId: id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      details: JSON.stringify({ recipientName, awardTitle, category, year }),
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save award' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'awards:manage')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to delete awards' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Award ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = await db.prepare('SELECT id, recipient_name, award_title FROM awards WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Award not found' }, { status: 404 });
    }

    await db.prepare('DELETE FROM awards WHERE id = ?').run(id);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'AWARDS_DELETE',
      targetEntity: 'award',
      targetId: id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      details: JSON.stringify({ recipientName: existing.recipient_name, awardTitle: existing.award_title }),
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete award' }, { status: 500 });
  }
}
