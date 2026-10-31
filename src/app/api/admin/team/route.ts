import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'node:crypto';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { TeamMemberSchema } from '@/lib/validation';
import { recordAuditLog } from '@/lib/security/audit';

function canManageTeam(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const members = await db
    .prepare('SELECT * FROM exco_members ORDER BY order_index ASC, name ASC')
    .all();

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canManageTeam(session.role) || !hasPermission(session.role, 'content:read')) {
    return NextResponse.json({ error: 'Forbidden: Team management access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = TeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid team member data' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = getDatabase();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO exco_members (
        id, name, role_title, unit_slug, bio, image_url, order_index, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.roleTitle,
      data.unitSlug || null,
      data.bio,
      data.imageUrl,
      data.orderIndex,
      data.isPublished ? 1 : 0
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'TEAM_MEMBER_CREATED',
      targetEntity: 'exco_members',
      targetId: id,
      details: `Added team member ${data.name} (${data.roleTitle})`,
      outcome: 'SUCCESS',
    });

    revalidatePath('/structure');
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('Error creating team member:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Team management access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Team member ID is required' }, { status: 400 });
    }

    const db = getDatabase();

    if (typeof body.isPublished === 'boolean' && Object.keys(body).length <= 2) {
      await db.prepare('UPDATE exco_members SET is_published = ? WHERE id = ?').run(
        body.isPublished ? 1 : 0,
        id
      );

      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'TEAM_MEMBER_PUBLISH_TOGGLED',
        targetEntity: 'exco_members',
        targetId: id,
        details: `Set published state to ${body.isPublished}`,
        outcome: 'SUCCESS',
      });

      revalidatePath('/structure');
      return NextResponse.json({ success: true });
    }

    const parsed = TeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid team member data' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await db.prepare(`
      UPDATE exco_members
      SET name = ?, role_title = ?, unit_slug = ?, bio = ?, image_url = ?, order_index = ?, is_published = ?
      WHERE id = ?
    `).run(
      data.name,
      data.roleTitle,
      data.unitSlug || null,
      data.bio,
      data.imageUrl,
      data.orderIndex,
      data.isPublished ? 1 : 0,
      id
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'TEAM_MEMBER_UPDATED',
      targetEntity: 'exco_members',
      targetId: id,
      details: `Updated team member ${data.name}`,
      outcome: 'SUCCESS',
    });

    revalidatePath('/structure');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating team member:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Team management access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Team member ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    await db.prepare('DELETE FROM exco_members WHERE id = ?').run(id);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'TEAM_MEMBER_DELETED',
      targetEntity: 'exco_members',
      targetId: id,
      details: 'Removed team member from public structure page',
      outcome: 'SUCCESS',
    });

    revalidatePath('/structure');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting team member:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
