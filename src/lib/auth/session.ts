import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/db';
import { Role } from './permissions';

export interface UserSession {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
  mfaEnabled: boolean;
  expiresAt: string;
}

const COOKIE_NAME = 'msh_admin_session';
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours absolute limit
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle limit

export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const db = getDatabase();
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = new Date(now + Math.min(SESSION_LIFETIME_MS, IDLE_TIMEOUT_MS));
  const sessionId = crypto.randomUUID();

  await db.prepare(`
    INSERT INTO sessions (id, user_id, session_token, ip_address, user_agent, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    userId,
    sessionToken,
    ipAddress || '127.0.0.1',
    userAgent || 'Unknown',
    expiresAt.toISOString(),
    new Date(now).toISOString()
  );

  return { sessionToken, expiresAt };
}

export async function setSessionCookie(sessionToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const db = getDatabase();
      await db.prepare('DELETE FROM sessions WHERE session_token = ?').run(token);
    } catch {
      // ignore
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const db = getDatabase();
    const row = await db.prepare(`
      SELECT s.id as session_id, s.expires_at, u.id as user_id, u.name, u.email, u.role, u.mfa_enabled, u.is_active
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ?
    `).get(token) as any;

    if (!row) return null;

    // Check account active
    if (!row.is_active) {
      await db.prepare('DELETE FROM sessions WHERE id = ?').run(row.session_id);
      return null;
    }

    // Check expiration
    const expiresAt = new Date(row.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      await db.prepare('DELETE FROM sessions WHERE id = ?').run(row.session_id);
      return null;
    }

    // Slide idle expiration forward (max 30 mins from now)
    const newExpiresAt = new Date(Date.now() + IDLE_TIMEOUT_MS);
    await db.prepare('UPDATE sessions SET expires_at = ? WHERE id = ?').run(newExpiresAt.toISOString(), row.session_id);

    return {
      sessionId: row.session_id,
      userId: row.user_id,
      email: row.email,
      name: row.name,
      role: row.role as Role,
      mfaEnabled: Boolean(row.mfa_enabled),
      expiresAt: newExpiresAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && (error as Error & { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Session validation error:', error);
    return null;
  }
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const db = getDatabase();
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}
