import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, revokeAllUserSessions } from '@/lib/auth/session';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { ChangePasswordSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`password:${session.userId}`, 5, 900, 'account');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `Too many password attempts. Please wait ${rateCheck.resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid password data' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const db = getDatabase();
    const user = await db
      .prepare('SELECT id, email, role, password_hash FROM users WHERE id = ?')
      .get(session.userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const isCurrentValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      await recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'PASSWORD_CHANGE_FAILED',
        targetEntity: 'users',
        targetId: user.id,
        ipAddress: ip,
        details: 'Incorrect current password supplied',
        outcome: 'DENIED',
      });

      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const isSamePassword = await verifyPassword(newPassword, user.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.prepare(`
      UPDATE users
      SET password_hash = ?, failed_sign_ins = 0, locked_until = NULL, updated_at = ?
      WHERE id = ?
    `).run(newHash, new Date().toISOString(), user.id);

    await revokeAllUserSessions(user.id);

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: 'User changed their password. All sessions were revoked.',
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Please sign in again.',
    });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
