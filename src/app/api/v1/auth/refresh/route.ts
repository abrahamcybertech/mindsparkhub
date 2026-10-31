import { NextRequest } from 'next/server';
import { permissionsForRole } from '@/lib/auth/permissions';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, getClientIp, readJsonBody } from '@/lib/api/http';
import { rotateRefreshToken } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileRefreshSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`mobile-refresh:${ip}`, 60, 300, 'ip');
  if (!rate.success) {
    return apiError(429, 'Too many token refresh requests. Please wait.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = MobileRefreshSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
  }

  const result = await rotateRefreshToken(parsed.data.refreshToken, req);
  if (!result) {
    return apiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
  }
  if ('reuseDetected' in result) {
    await recordAuditLog({
      actorId: 'unknown',
      actorRole: 'ANONYMOUS',
      action: 'MOBILE_REFRESH_REUSE_DETECTED',
      targetEntity: 'mobile_refresh_tokens',
      targetId: 'family',
      ipAddress: ip,
      details: 'A used refresh token was presented. The token family was revoked.',
      outcome: 'DENIED',
    });
    return apiError(401, 'Your session has expired. Please sign in again.', 'SESSION_REVOKED');
  }

  return apiJson({
    tokens: {
      accessToken: result.pair.accessToken,
      refreshToken: result.pair.refreshToken,
      accessExpiresAt: result.pair.accessExpiresAt,
      refreshExpiresAt: result.pair.refreshExpiresAt,
    },
    user: result.user,
    permissions: permissionsForRole(result.user.role),
  });
}
