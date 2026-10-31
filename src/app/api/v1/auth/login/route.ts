import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, getClientIp, getUserAgent, readJsonBody, sha256 } from '@/lib/api/http';
import { createMfaChallenge } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileLoginSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipRate = checkRateLimit(`mobile-login:${ip}`, 10, 300, 'ip');
  if (!ipRate.success) {
    return apiError(429, 'Too many sign in attempts. Please wait before trying again.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = MobileLoginSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const { email, password } = parsed.data;
  const accountKey = sha256(email.toLowerCase());
  const accountRate = checkRateLimit(`mobile-login-account:${accountKey}`, 5, 900, 'account');
  if (!accountRate.success) {
    return apiError(429, 'Too many sign in attempts for this account. Please wait before trying again.', 'RATE_LIMITED');
  }

  try {
    const db = getDatabase();
    const user = (await db.prepare(`
      SELECT id, name, email, password_hash, role, mfa_enabled, is_active, failed_sign_ins, locked_until
      FROM users WHERE email = ?
    `).get(email.toLowerCase())) as any;

    if (!user || !user.is_active) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await recordAuditLog({
        actorId: 'unknown',
        actorRole: 'ANONYMOUS',
        action: 'MOBILE_SIGN_IN_FAILED',
        targetEntity: 'users',
        targetId: accountKey.slice(0, 16),
        ipAddress: ip,
        details: 'Unknown or inactive account attempted mobile sign in',
        outcome: 'FAILURE',
      });
      return apiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return apiError(
        403,
        'This account is temporarily locked after repeated failed attempts. Contact a Super Administrator.',
        'ACCOUNT_LOCKED'
      );
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      const failedCount = Number(user.failed_sign_ins || 0) + 1;
      const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await db.prepare('UPDATE users SET failed_sign_ins = ?, locked_until = ? WHERE id = ?').run(
        failedCount,
        lockedUntil,
        user.id
      );
      await recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'MOBILE_SIGN_IN_FAILED',
        targetEntity: 'users',
        targetId: user.id,
        ipAddress: ip,
        details: `Failed mobile password attempt (${failedCount}/5)`,
        outcome: 'FAILURE',
      });
      return apiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    if (!user.mfa_enabled) {
      await recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'MOBILE_SIGN_IN_DENIED',
        targetEntity: 'users',
        targetId: user.id,
        ipAddress: ip,
        details: 'Mobile sign in refused because multi factor authentication is not enrolled',
        outcome: 'DENIED',
      });
      return apiError(
        403,
        'Multi factor authentication must be enrolled on the web dashboard before the mobile app can be used.',
        'MFA_SETUP_REQUIRED'
      );
    }

    const challenge = await createMfaChallenge(user.id);
    return apiJson({
      requiresMfa: true,
      challenge,
      expiresInSeconds: 300,
      message: 'Enter the current 6 digit code from your authenticator app.',
    });
  } catch {
    return apiError(503, 'Sign in is temporarily unavailable. Please try again shortly.', 'SERVICE_UNAVAILABLE');
  }
}
