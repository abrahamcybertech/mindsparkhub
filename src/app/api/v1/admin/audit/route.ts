import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { requireStaff } from '@/lib/api/guard';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const staff = await requireStaff(req, 'audit:view');
  if (!staff.ok) return staff.response;

  const limit = Math.max(1, Math.min(100, Number.parseInt(req.nextUrl.searchParams.get('limit') || '50', 10) || 50));

  try {
    const db = getDatabase();
    const rows = (await db.prepare(`
      SELECT id, actor_id, actor_role, action, target_entity, target_id, ip_address,
             details, outcome, previous_hash, entry_hash, created_at
      FROM audit_logs ORDER BY created_at DESC LIMIT ?
    `).all(limit)) as any[];

    return apiJson({
      logs: rows.map((row) => ({
        id: row.id,
        actorId: row.actor_id,
        actorRole: row.actor_role,
        action: row.action,
        targetEntity: row.target_entity,
        targetId: row.target_id,
        ipAddress: row.ip_address,
        details: row.details,
        outcome: row.outcome,
        previousHash: row.previous_hash,
        entryHash: row.entry_hash,
        createdAt: row.created_at,
      })),
    });
  } catch {
    return apiError(503, 'The audit view is temporarily unavailable.', 'SERVICE_UNAVAILABLE');
  }
}
