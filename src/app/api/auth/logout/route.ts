import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, clearSessionCookie } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const session = await getCurrentSession();

  if (session) {
    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'ADMIN_SIGN_OUT',
      targetEntity: 'sessions',
      targetId: session.sessionId,
      ipAddress: ip,
      details: 'User initiated secure sign out',
      outcome: 'SUCCESS',
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
