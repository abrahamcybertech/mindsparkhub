import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentSession, revokeAllUserSessions } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateTOTPSetup } from '@/lib/auth/totp';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'users:manage')) {
    return NextResponse.json({ error: 'Forbidden: Super Administrator access required' }, { status: 403 });
  }

  const db = getDatabase();
  const users = await db.prepare(`
    SELECT id, name, email, role, mfa_enabled, is_active, failed_sign_ins, last_sign_in_at, created_at
    FROM users ORDER BY created_at ASC
  `).all();

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'users:manage')) {
    return NextResponse.json({ error: 'Forbidden: Super Administrator access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role, initialPassword } = body;

    if (!name || !email || !role || !initialPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (initialPassword.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters long' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(initialPassword);
    const mfaSetup = generateTOTPSetup(email);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, mfa_enabled, mfa_secret, mfa_backup_codes, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 1, ?, ?)
    `).run(
      id,
      name,
      email.toLowerCase(),
      passwordHash,
      role,
      mfaSetup.secret,
      JSON.stringify(mfaSetup.hashedBackupCodes),
      now,
      now
    );

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'USER_CREATED',
      targetEntity: 'users',
      targetId: id,
      details: `Created user ${email} with role ${role}`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      id,
      mfaSecret: mfaSetup.secret,
      mfaUri: mfaSetup.uri,
      backupCodes: mfaSetup.backupCodes,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'users:manage')) {
    return NextResponse.json({ error: 'Forbidden: Super Administrator access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isActive, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent modifying own role or deactivating oneself
    if (id === session.userId) {
      return NextResponse.json({ error: 'Privilege escalation defense: You cannot modify your own role or active status.' }, { status: 400 });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    if (typeof isActive === 'boolean') {
      await db.prepare('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?').run(isActive ? 1 : 0, now, id);

      if (!isActive) {
        await revokeAllUserSessions(id);
      }

      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'USER_STATUS_TOGGLED',
        targetEntity: 'users',
        targetId: id,
        details: `Set active to ${isActive}`,
        outcome: 'SUCCESS',
      });
    }

    if (role) {
      await db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, now, id);
      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'USER_ROLE_CHANGED',
        targetEntity: 'users',
        targetId: id,
        details: `Assigned new role ${role}`,
        outcome: 'SUCCESS',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
