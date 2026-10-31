import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/auth/password';
import { verifyTOTPToken, verifyAndConsumeBackupCode } from '@/lib/auth/totp';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { decryptSecret } from '@/lib/security/secrets';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  try {
    // 1. Check IP rate limit (max 5 login attempts per 5 minutes)
    const rateCheck = checkRateLimit(ip, 5, 300, 'ip');
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many sign in attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = AdminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid credentials' }, { status: 400 });
    }

    const { email, password, mfaCode } = parsed.data;
    const db = getDatabase();

    const user = await db.prepare(`
      SELECT id, name, email, password_hash, role, mfa_enabled, mfa_secret, mfa_backup_codes, is_active, failed_sign_ins, locked_until
      FROM users WHERE email = ?
    `).get(email.toLowerCase()) as any;

    if (!user || !user.is_active) {
      // Constant time response defense to prevent account enumeration
      await new Promise((r) => setTimeout(r, 200));
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to repeated failed attempts. Please contact a Super Administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      const failedCount = (user.failed_sign_ins || 0) + 1;
      let lockUntilSql = null;
      if (failedCount >= 5) {
        lockUntilSql = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lockout
      }
      await db.prepare('UPDATE users SET failed_sign_ins = ?, locked_until = ? WHERE id = ?').run(
        failedCount,
        lockUntilSql,
        user.id
      );

      await recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'ADMIN_SIGN_IN_FAILED',
        targetEntity: 'users',
        targetId: user.id,
        ipAddress: ip,
        details: `Failed password attempt (${failedCount}/5)`,
        outcome: 'FAILURE',
      });

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check Multi Factor Authentication (MFA)
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return NextResponse.json({ requiresMfa: true, message: 'Please enter your two step verification code.' });
      }

      const cleanCode = mfaCode.trim().toUpperCase();
      let mfaSuccess = false;

      // Check standard 6 digit TOTP code
      if (cleanCode.length === 6 && user.mfa_secret) {
        try {
          mfaSuccess = verifyTOTPToken(cleanCode, decryptSecret(user.mfa_secret));
        } catch (error) {
          console.error('MFA secret could not be decrypted:', error);
        }
      }

      // Check single use 8 character recovery backup code
      if (!mfaSuccess && user.mfa_backup_codes) {
        try {
          const storedHashes = JSON.parse(user.mfa_backup_codes);
          const result = verifyAndConsumeBackupCode(cleanCode, storedHashes);
          if (result.valid) {
            mfaSuccess = true;
            // Update remaining backup codes
            await db.prepare('UPDATE users SET mfa_backup_codes = ? WHERE id = ?').run(
              JSON.stringify(result.remainingHashedCodes),
              user.id
            );
          }
        } catch {
          // ignore parsing error
        }
      }

      if (!mfaSuccess) {
        await recordAuditLog({
          actorId: user.id,
          actorRole: user.role,
          action: 'ADMIN_MFA_FAILED',
          targetEntity: 'users',
          targetId: user.id,
          ipAddress: ip,
          details: 'Invalid two step verification code or backup code',
          outcome: 'DENIED',
        });
        return NextResponse.json({ error: 'Invalid verification code. Please check your authenticator app.' }, { status: 401 });
      }
    }

    // Success: Reset failed attempts & clear lockout
    const nowIso = new Date().toISOString();
    await db.prepare('UPDATE users SET failed_sign_ins = 0, locked_until = NULL, last_sign_in_at = ? WHERE id = ?').run(
      nowIso,
      user.id
    );

    // Create session
    const { sessionToken, expiresAt } = await createSession(user.id, ip, userAgent);
    await setSessionCookie(sessionToken, expiresAt);

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'ADMIN_SIGN_IN_SUCCESS',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: 'Successful authenticated session initiated with multi factor verification',
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal operational error during authentication' }, { status: 500 });
  }
}
