import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { generateTOTPSetup } from '@/lib/auth/totp';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { MfaSetupSchema } from '@/lib/validation';
import { encryptSecret } from '@/lib/security/secrets';

const SETUP_LIFETIME_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`mfa-setup:${session.userId}`, 10, 900, 'account');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `Too many setup attempts. Please wait ${rateCheck.resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = MfaSetupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Current password is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const user = await db
      .prepare('SELECT id, email, role, password_hash FROM users WHERE id = ?')
      .get(session.userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(parsed.data.currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const setup = generateTOTPSetup(user.email);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SETUP_LIFETIME_MS).toISOString();

    await db.prepare(`
      INSERT INTO mfa_setup_requests (user_id, secret, backup_codes, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (user_id) DO UPDATE SET
        secret = excluded.secret,
        backup_codes = excluded.backup_codes,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at
    `).run(
      user.id,
      encryptSecret(setup.secret),
      JSON.stringify(setup.hashedBackupCodes),
      expiresAt,
      now.toISOString()
    );

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'MFA_SETUP_STARTED',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: 'Started Google Authenticator enrollment',
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      secret: setup.secret,
      uri: setup.uri,
      backupCodes: setup.backupCodes,
    });
  } catch (err) {
    console.error('MFA setup error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
