import { NextRequest } from 'next/server';
import { hasPermission, type Permission } from '@/lib/auth/permissions';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { apiError } from './http';
import { authenticateBearer, type MobileSession } from './mobile-auth';

export type GuardResult =
  | { ok: true; session: MobileSession }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function requireStaff(req: NextRequest, permission?: Permission): Promise<GuardResult> {
  const session = await authenticateBearer(req);
  if (!session) {
    return {
      ok: false,
      response: apiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED'),
    };
  }

  if (permission && !hasPermission(session.user.role, permission)) {
    return {
      ok: false,
      response: apiError(403, 'Your role does not permit this action.', 'FORBIDDEN'),
    };
  }

  const rate = checkRateLimit(`staff:${session.user.id}`, 120, 60, 'account');
  if (!rate.success) {
    return {
      ok: false,
      response: apiError(429, 'Too many requests. Please slow down.', 'RATE_LIMITED'),
    };
  }

  return { ok: true, session };
}
