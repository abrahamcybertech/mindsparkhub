import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import type { Role } from '@/lib/auth/permissions';
import { getClientIp, getUserAgent, hashDevice, randomToken, sha256 } from './http';

export const ACCESS_TOKEN_MINUTES = 15;
export const REFRESH_TOKEN_DAYS = 30;
export const MFA_CHALLENGE_MINUTES = 5;

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
}

export interface MobileSession {
  tokenId: string;
  user: MobileUser;
  expiresAt: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: MobileUser;
}

function addMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function issueAccessToken(user: MobileUser): Promise<{ token: string; expiresAt: string }> {
  const db = getDatabase();
  const token = randomToken(32);
  const id = crypto.randomUUID();
  const expiresAt = addMinutes(ACCESS_TOKEN_MINUTES).toISOString();
  await db.prepare(`
    INSERT INTO mobile_access_tokens (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, user.id, sha256(token), expiresAt, new Date().toISOString());
  return { token, expiresAt };
}

async function issueRefreshToken(
  userId: string,
  familyId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ id: string; token: string; expiresAt: string }> {
  const db = getDatabase();
  const token = randomToken(48);
  const id = crypto.randomUUID();
  const expiresAt = addDays(REFRESH_TOKEN_DAYS).toISOString();
  await db.prepare(`
    INSERT INTO mobile_refresh_tokens (
      id, family_id, user_id, token_hash, expires_at, ip_hash, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    familyId,
    userId,
    sha256(token),
    expiresAt,
    sha256(ipAddress),
    userAgent.slice(0, 300),
    new Date().toISOString()
  );
  return { id, token, expiresAt };
}

export async function issueTokenPair(
  user: MobileUser,
  ipAddress: string,
  userAgent: string,
  familyId?: string
): Promise<TokenPair> {
  const family = familyId || crypto.randomUUID();
  const access = await issueAccessToken(user);
  const refresh = await issueRefreshToken(user.id, family, ipAddress, userAgent);
  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: refresh.expiresAt,
    user,
  };
}

export async function authenticateBearer(req: NextRequest): Promise<MobileSession | null> {
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  if (!token || token.length < 20) return null;

  const db = getDatabase();
  const row = await db.prepare(`
    SELECT t.id AS token_id, t.expires_at, u.id AS user_id, u.name, u.email, u.role, u.mfa_enabled, u.is_active
    FROM mobile_access_tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token_hash = ?
  `).get(sha256(token)) as
    | {
        token_id: string;
        expires_at: string;
        user_id: string;
        name: string;
        email: string;
        role: Role;
        mfa_enabled: number | boolean;
        is_active: number | boolean;
      }
    | undefined;

  if (!row) return null;
  if (!row.is_active) {
    await db.prepare('DELETE FROM mobile_access_tokens WHERE id = ?').run(row.token_id);
    return null;
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await db.prepare('DELETE FROM mobile_access_tokens WHERE id = ?').run(row.token_id);
    return null;
  }

  return {
    tokenId: row.token_id,
    expiresAt: row.expires_at,
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      mfaEnabled: Boolean(row.mfa_enabled),
    },
  };
}

export async function rotateRefreshToken(
  refreshToken: string,
  req: NextRequest
): Promise<{ pair: TokenPair; user: MobileUser } | { reuseDetected: true } | null> {
  if (!refreshToken || refreshToken.length < 40) return null;
  const db = getDatabase();
  const tokenHash = sha256(refreshToken);
  const row = await db.prepare(`
    SELECT id, family_id, user_id, expires_at, used_at, revoked_at
    FROM mobile_refresh_tokens WHERE token_hash = ?
  `).get(tokenHash) as
    | {
        id: string;
        family_id: string;
        user_id: string;
        expires_at: string;
        used_at: string | null;
        revoked_at: string | null;
      }
    | undefined;

  if (!row) return null;

  if (row.used_at || row.revoked_at) {
    await db.prepare(`
      UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE family_id = ? AND revoked_at IS NULL
    `).run(new Date().toISOString(), row.family_id);
    await db.prepare(`
      DELETE FROM mobile_access_tokens WHERE user_id = ?
    `).run(row.user_id);
    return { reuseDetected: true };
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await db.prepare('UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      row.id
    );
    return null;
  }

  const userRow = await db.prepare(`
    SELECT id, name, email, role, mfa_enabled, is_active FROM users WHERE id = ?
  `).get(row.user_id) as
    | {
        id: string;
        name: string;
        email: string;
        role: Role;
        mfa_enabled: number | boolean;
        is_active: number | boolean;
      }
    | undefined;

  if (!userRow || !userRow.is_active || !userRow.mfa_enabled) {
    await db.prepare('UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE family_id = ?').run(
      new Date().toISOString(),
      row.family_id
    );
    return null;
  }

  const nextRefreshId = crypto.randomUUID();
  const now = new Date().toISOString();
  const consumed = await db.prepare(`
    UPDATE mobile_refresh_tokens SET used_at = ?, replaced_by = ?
    WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL
  `).run(now, nextRefreshId, row.id);

  if (consumed.changes !== 1) {
    await db.prepare(`
      UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE family_id = ? AND revoked_at IS NULL
    `).run(now, row.family_id);
    return { reuseDetected: true };
  }

  const user: MobileUser = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    mfaEnabled: Boolean(userRow.mfa_enabled),
  };

  const access = await issueAccessToken(user);
  const refresh = await issueRefreshToken(
    user.id,
    row.family_id,
    getClientIp(req),
    getUserAgent(req)
  );
  await db.prepare('UPDATE mobile_refresh_tokens SET replaced_by = ? WHERE id = ?').run(
    refresh.id,
    row.id
  );

  return {
    pair: {
      accessToken: access.token,
      refreshToken: refresh.token,
      accessExpiresAt: access.expiresAt,
      refreshExpiresAt: refresh.expiresAt,
      user,
    },
    user,
  };
}

export async function revokeSession(session: MobileSession): Promise<void> {
  const db = getDatabase();
  await db.prepare('DELETE FROM mobile_access_tokens WHERE id = ?').run(session.tokenId);
  await db.prepare(`
    UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL
  `).run(new Date().toISOString(), session.user.id);
}

export async function revokeAllMobileTokens(userId: string): Promise<void> {
  const db = getDatabase();
  await db.prepare('DELETE FROM mobile_access_tokens WHERE user_id = ?').run(userId);
  await db.prepare(`
    UPDATE mobile_refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL
  `).run(new Date().toISOString(), userId);
}

export async function createMfaChallenge(userId: string): Promise<string> {
  const db = getDatabase();
  const token = randomToken(32);
  await db.prepare(`
    INSERT INTO mobile_mfa_challenges (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    userId,
    sha256(token),
    addMinutes(MFA_CHALLENGE_MINUTES).toISOString(),
    new Date().toISOString()
  );
  return token;
}

export async function getMfaChallenge(
  challenge: string
): Promise<{ id: string; userId: string; attempts: number } | null> {
  if (!challenge || challenge.length < 20) return null;
  const db = getDatabase();
  const row = await db.prepare(`
    SELECT id, user_id, expires_at, consumed_at, attempts
    FROM mobile_mfa_challenges WHERE token_hash = ?
  `).get(sha256(challenge)) as
    | { id: string; user_id: string; expires_at: string; consumed_at: string | null; attempts: number }
    | undefined;

  if (!row || row.consumed_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  if (row.attempts >= 5) return null;
  return { id: row.id, userId: row.user_id, attempts: row.attempts };
}

export async function recordMfaAttempt(challengeId: string): Promise<void> {
  const db = getDatabase();
  await db.prepare('UPDATE mobile_mfa_challenges SET attempts = attempts + 1 WHERE id = ?').run(
    challengeId
  );
}

export async function consumeMfaChallenge(challengeId: string): Promise<void> {
  const db = getDatabase();
  await db.prepare('UPDATE mobile_mfa_challenges SET consumed_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    challengeId
  );
}

export async function createPublicChallenge(deviceId: string): Promise<{ challenge: string; expiresAt: string; minDelayMs: number }> {
  const db = getDatabase();
  const token = randomToken(32);
  const now = Date.now();
  const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();
  const deviceHash = deviceId ? hashDevice(deviceId) : hashDevice('unknown-device');
  await db.prepare(`
    INSERT INTO public_challenges (id, token_hash, device_hash, issued_at, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    sha256(token),
    deviceHash,
    new Date(now).toISOString(),
    expiresAt,
    new Date(now).toISOString()
  );
  return { challenge: token, expiresAt, minDelayMs: 2500 };
}

export async function verifyPublicChallenge(
  challenge: string,
  deviceId: string
): Promise<{ ok: true } | { ok: false; reason: 'invalid' | 'expired' | 'too-fast' | 'device-mismatch' }> {
  if (!challenge || challenge.length < 20) return { ok: false, reason: 'invalid' };
  const db = getDatabase();
  const row = await db.prepare(`
    SELECT id, device_hash, issued_at, expires_at, consumed_at
    FROM public_challenges WHERE token_hash = ?
  `).get(sha256(challenge)) as
    | { id: string; device_hash: string; issued_at: string; expires_at: string; consumed_at: string | null }
    | undefined;

  if (!row || row.consumed_at) return { ok: false, reason: 'invalid' };
  if (new Date(row.expires_at).getTime() <= Date.now()) return { ok: false, reason: 'expired' };
  if (Date.now() - new Date(row.issued_at).getTime() < 2500) {
    return { ok: false, reason: 'too-fast' };
  }
  const expected = deviceId ? hashDevice(deviceId) : hashDevice('unknown-device');
  if (row.device_hash !== expected) return { ok: false, reason: 'device-mismatch' };

  const consumed = await db.prepare(`
    UPDATE public_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL
  `).run(new Date().toISOString(), row.id);
  if (consumed.changes !== 1) return { ok: false, reason: 'invalid' };
  return { ok: true };
}
