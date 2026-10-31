import { NextRequest } from 'next/server';
import { permissionsForRole } from '@/lib/auth/permissions';
import { apiError, apiJson } from '@/lib/api/http';
import { authenticateBearer } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const session = await authenticateBearer(req);
  if (!session) {
    return apiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
  }

  return apiJson({
    user: session.user,
    permissions: permissionsForRole(session.user.role),
    accessExpiresAt: session.expiresAt,
  });
}
