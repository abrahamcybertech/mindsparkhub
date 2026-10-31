import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';
import { apiJson, getClientIp, readJsonBody, sha256 } from '@/lib/api/http';
import { authenticateBearer, revokeSession } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileLogoutSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const session = await authenticateBearer(req);

  if (session) {
    await revokeSession(session);
    await recordAuditLog({
      actorId: session.user.id,
      actorRole: session.user.role,
      action: 'MOBILE_SIGN_OUT',
      targetEntity: 'users',
      targetId: session.user.id,
      ipAddress: ip,
      details: 'Mobile session revoked on request',
      outcome: 'SUCCESS',
    });
  }

  const body = await readJsonBody(req);
  if (body.ok) {
    const parsed = MobileLogoutSchema.safeParse(body.data);
    if (parsed.success && parsed.data.refreshToken) {
      const db = getDatabase();
      await db.prepare(`
        UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL
      `).run(new Date().toISOString(), sha256(parsed.data.refreshToken));
    }
  }

  return apiJson({ success: true });
}
