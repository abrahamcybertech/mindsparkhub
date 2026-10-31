import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'audit:view')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges to view audit logs' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  const db = getDatabase();
  const logs = await db.prepare(`
    SELECT id, actor_id, actor_role, action, target_entity, target_id, ip_address, details, outcome, previous_hash, entry_hash, created_at
    FROM audit_logs ORDER BY created_at DESC LIMIT ?
  `).all(limit);

  return NextResponse.json({ logs });
}
