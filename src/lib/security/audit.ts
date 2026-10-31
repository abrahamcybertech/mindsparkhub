import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';

export interface AuditLogInput {
  actorId: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress?: string;
  details?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

/**
 * Anonymize or hash IP address for NDPA privacy compliance
 */
export function hashIpForPrivacy(ip?: string): string {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return '127.0.0.1';
  // Retain subnet or return truncated hash
  return crypto.createHash('sha256').update(ip + 'mindspark-audit-salt').digest('hex').substring(0, 16);
}

/**
 * Record an append-only cryptographically chained audit log entry
 */
export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const safeIp = hashIpForPrivacy(input.ipAddress);
    const details = input.details || '';

    // Fetch the entry hash of the most recent audit log
    const lastRow = await db.prepare('SELECT entry_hash FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 1').get() as { entry_hash?: string } | undefined;
    const previousHash = lastRow?.entry_hash || 'GENESIS_HASH_MINDSPARK_HUB_2026';

    // Compute entry SHA-256 hash chaining previousHash + current payload
    const payload = `${previousHash}|${input.actorId}|${input.actorRole}|${input.action}|${input.targetEntity}|${input.targetId}|${safeIp}|${input.outcome}|${now}`;
    const entryHash = crypto.createHash('sha256').update(payload).digest('hex');

    await db.prepare(`
      INSERT INTO audit_logs (
        id, actor_id, actor_role, action, target_entity, target_id, ip_address, details, outcome, previous_hash, entry_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.actorId,
      input.actorRole,
      input.action,
      input.targetEntity,
      input.targetId,
      safeIp,
      details,
      input.outcome,
      previousHash,
      entryHash,
      now
    );
  } catch (error) {
    // Audit log failure must be recorded to stderr but not break the whole flow
    console.error('Failed to write audit log:', error);
  }
}
