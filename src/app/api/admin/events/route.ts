import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { EventSchema } from '@/lib/validation';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const events = await db.prepare('SELECT * FROM events ORDER BY start_time DESC').all();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'events:draft')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions to create events' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = EventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid event data' }, { status: 400 });
    }

    const data = parsed.data;
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Four-eyes check: Programme Managers can only submit DRAFT or PENDING_APPROVAL
    let finalStatus = data.status;
    let approvedBy: string | null = null;

    if (finalStatus === 'APPROVED') {
      if (!hasPermission(session.role, 'events:approve')) {
        return NextResponse.json(
          { error: 'Programme Managers cannot self approve events. Please submit as Pending Approval for administrator sign off.' },
          { status: 403 }
        );
      }
      approvedBy = session.userId;
    }

    await db.prepare(`
      INSERT INTO events (
        id, programme_slug, title, venue, start_time, end_time, description, status, created_by, approved_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.programmeSlug,
      data.title,
      data.venue,
      data.startTime,
      data.endTime,
      data.description,
      finalStatus,
      session.userId,
      approvedBy,
      now,
      now
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'EVENT_CREATED',
      targetEntity: 'events',
      targetId: id,
      details: `Created event: ${data.title} with status ${finalStatus}`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, id, status: finalStatus });
  } catch (err) {
    console.error('Error creating event:', err);
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Event ID and status are required' }, { status: 400 });
    }

    if (status === 'APPROVED' && !hasPermission(session.role, 'events:approve')) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can approve events' }, { status: 403 });
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const approvedBy = status === 'APPROVED' ? session.userId : null;

    await db.prepare(`
      UPDATE events SET status = ?, approved_by = COALESCE(?, approved_by), updated_at = ? WHERE id = ?
    `).run(status, approvedBy, now, id);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'EVENT_STATUS_UPDATED',
      targetEntity: 'events',
      targetId: id,
      details: `Status changed to ${status}`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating event:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
