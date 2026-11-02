import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import crypto from 'node:crypto';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:view')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = getDatabase();
  const donation = await db.prepare('SELECT * FROM donations WHERE id = ?').get(params.id);
  if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const history = await db.prepare('SELECT * FROM donation_status_history WHERE donation_id = ? ORDER BY created_at ASC').all(params.id);
  return NextResponse.json({ donation, history });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:manage')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { action, note } = body;
    const db = getDatabase();
    const donation = await db.prepare('SELECT * FROM donations WHERE id = ?').get(params.id) as any;
    if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString();
    if (action === 'confirm_transfer') {
      if (!hasPermission(session.role, 'donations:manage')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      await db.prepare("UPDATE donations SET status = 'successful', updated_at = ? WHERE id = ?").run(now, params.id);
      await db.prepare('INSERT INTO donation_status_history (id, donation_id, status, actor_id, actor_role, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        crypto.randomUUID(), params.id, 'successful', session.userId, session.role, note || 'Manual confirmation of bank transfer', now
      );
      await recordAuditLog({
        actorId: session.userId, actorRole: session.role, action: 'DONATION_MANUAL_CONFIRM', targetEntity: 'donations', targetId: params.id,
        details: 'Manual confirmation recorded', outcome: 'SUCCESS'
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'refund') {
      if (!hasPermission(session.role, 'donations:refund')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      await db.prepare("UPDATE donations SET status = 'refunded', updated_at = ? WHERE id = ?").run(now, params.id);
      await db.prepare('INSERT INTO donation_status_history (id, donation_id, status, actor_id, actor_role, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        crypto.randomUUID(), params.id, 'refunded', session.userId, session.role, note || 'Refund status recorded', now
      );
      await recordAuditLog({
        actorId: session.userId, actorRole: session.role, action: 'DONATION_REFUND_UPDATE', targetEntity: 'donations', targetId: params.id,
        details: 'Refund status updated', outcome: 'SUCCESS'
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
