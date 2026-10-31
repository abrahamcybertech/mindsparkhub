import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyTOTPToken, verifyAndConsumeBackupCode } from '@/lib/auth/totp';
import { decryptSecret } from '@/lib/security/secrets';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { permissionsForRole, type Role } from '@/lib/auth/permissions';
import {
  apiError,
  apiJson,
  getClientIp,
  getUserAgent,
  readJsonBody,
} from '@/lib/api/http';
import {
  consumeMfaChallenge,
  getMfaChallenge,
  issueTokenPair,
  recordMfaAttempt,
} from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileMfaSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipRate = checkRateLimit(`mobile-mfa:${ip}`, 20, 300, 'ip');
  if (!ipRate.success) {
    return apiError(429, 'Too many verification attempts. Please wait before trying again.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = MobileMfaSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The verification request could not be validated.');
  }

  const { challenge, code } = parsed.data;
  const challengeRow = await getMfaChallenge(challenge);
  if (!challengeRow) {
    return apiError(401, 'This sign in session has expired. Please sign in again.', 'CHALLENGE_EXPIRED');
  }

  const challengeRate = checkRateLimit(`mobile-mfa-challenge:${challengeRow.id}`, 5, 300, 'account');
  if (!challengeRate.success) {
    return apiError(429, 'Too many verification attempts. Please sign in again.', 'RATE_LIMITED');
  }

  try {
    const db = getDatabase();
    const user = (await db.prepare(`
      SELECT id, name, email, role, mfa_enabled, mfa_secret, mfa_backup_codes, is_active
      FROM users WHERE id = ?
    `).get(challengeRow.userId)) as any;

    if (!user || !user.is_active || !user.mfa_enabled) {
      return apiError(401, 'This sign in session is no longer valid. Please sign in again.', 'CHALLENGE_EXPIRED');
    }

    const cleanCode = code.trim().toUpperCase();
    let verified = false;

    if (cleanCode.length === 6 && user.mfa_secret) {
      try {
        verified = verifyTOTPToken(cleanCode, decryptSecret(user.mfa_secret));
      } catch {
        verified = false;
      }
    }

    if (!verified && user.mfa_backup_codes) {
      try {
        const storedHashes = JSON.parse(user.mfa_backup_codes);
        const result = verifyAndConsumeBackupCode(cleanCode, storedHashes);
        if (result.valid) {
          verified = true;
          await db.prepare('UPDATE users SET mfa_backup_codes = ? WHERE id = ?').run(
            JSON.stringify(result.remainingHashedCodes),
            user.id
          );
        }
      } catch {
        verified = false;
      }
    }

    if (!verified) {
      await recordMfaAttempt(challengeRow.id);
      await recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'MOBILE_MFA_FAILED',
        targetEntity: 'users',
        targetId: user.id,
        ipAddress: ip,
        details: 'Invalid mobile two step verification code or backup code',
        outcome: 'DENIED',
      });
      return apiError(401, 'Invalid verification code. Please check your authenticator app.', 'INVALID_MFA_CODE');
    }

    await consumeMfaChallenge(challengeRow.id);
    const now = new Date().toISOString();
    await db.prepare('UPDATE users SET failed_sign_ins = 0, locked_until = NULL, last_sign_in_at = ? WHERE id = ?').run(
      now,
      user.id
    );

    const mobileUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      mfaEnabled: true,
    };
    const pair = await issueTokenPair(mobileUser, ip, getUserAgent(req));

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'MOBILE_SIGN_IN_SUCCESS',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: 'Mobile session issued after password and multi factor verification',
      outcome: 'SUCCESS',
    });

    return apiJson({
      tokens: {
        accessToken: pair.accessToken,
        refreshToken: pair.refreshToken,
        accessExpiresAt: pair.accessExpiresAt,
        refreshExpiresAt: pair.refreshExpiresAt,
      },
      user: mobileUser,
      permissions: permissionsForRole(mobileUser.role),
    });
  } catch {
    return apiError(503, 'Verification is temporarily unavailable. Please try again shortly.', 'SERVICE_UNAVAILABLE');
  }
}
