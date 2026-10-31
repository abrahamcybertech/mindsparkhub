import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { verifyTOTPToken } from '@/lib/auth/totp';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { MfaVerifySchema } from '@/lib/validation';
import { decryptSecret, encryptSecret } from '@/lib/security/secrets';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`mfa-verify:${session.userId}`, 10, 900, 'account');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `Too many verification attempts. Please wait ${rateCheck.resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = MfaVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Enter a valid code' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const setup = await db
      .prepare('SELECT user_id, secret, backup_codes, expires_at FROM mfa_setup_requests WHERE user_id = ?')
      .get(session.userId) as any;

    if (!setup) {
      return NextResponse.json(
        { error: 'No pending Google Authenticator setup was found. Please start again.' },
        { status: 400 }
      );
    }

    if (new Date(setup.expires_at) < new Date()) {
      await db.prepare('DELETE FROM mfa_setup_requests WHERE user_id = ?').run(session.userId);
      return NextResponse.json(
        { error: 'The setup session expired. Please start again.' },
        { status: 400 }
      );
    }

    let setupSecret: string;
    try {
      setupSecret = decryptSecret(setup.secret);
    } catch (error) {
      console.error('MFA setup secret could not be decrypted:', error);
      return NextResponse.json({ error: 'This setup session is no longer valid. Please start again.' }, { status: 400 });
    }

    const isCodeValid = verifyTOTPToken(parsed.data.code, setupSecret);
    if (!isCodeValid) {
      await recordAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: 'MFA_SETUP_FAILED',
        targetEntity: 'users',
        targetId: session.userId,
        ipAddress: ip,
        details: 'Invalid Google Authenticator code during enrollment',
        outcome: 'DENIED',
      });

      return NextResponse.json(
        { error: 'The code is invalid. Check that your phone time is set to automatic and try again.' },
        { status: 400 }
      );
    }

    await db.prepare(`
      UPDATE users
      SET mfa_enabled = 1, mfa_secret = ?, mfa_backup_codes = ?, updated_at = ?
      WHERE id = ?
    `).run(encryptSecret(setupSecret), setup.backup_codes, new Date().toISOString(), session.userId);

    await db.prepare('DELETE FROM mfa_setup_requests WHERE user_id = ?').run(session.userId);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'MFA_ENABLED',
      targetEntity: 'users',
      targetId: session.userId,
      ipAddress: ip,
      details: 'Google Authenticator enrollment completed',
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Google Authenticator is now active for your account.',
    });
  } catch (err) {
    console.error('MFA verify error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
