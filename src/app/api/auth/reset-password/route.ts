import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { revokeAllUserSessions } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { ResetPasswordSchema, SupabaseResetPasswordSchema } from '@/lib/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  const rateCheck = checkRateLimit(`reset:${ip}`, 10, 900, 'ip');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `Too many reset attempts. Please wait ${rateCheck.resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const supabaseParsed = SupabaseResetPasswordSchema.safeParse(body);
    const tokenParsed = ResetPasswordSchema.safeParse(body);

    if (!supabaseParsed.success && !tokenParsed.success) {
      const issue = supabaseParsed.error.issues[0] || tokenParsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || 'Invalid password reset data' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    let user: any;
    let newPassword: string;
    let resetTokenId: string | null = null;
    let auditDetails = 'Password reset completed. All sessions were revoked.';

    if (supabaseParsed.success) {
      const supabaseAdmin = getSupabaseAdminClient();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Password reset is not configured. Contact the Super Administrator.' },
          { status: 503 }
        );
      }

      const { data, error } = await supabaseAdmin.auth.getUser(supabaseParsed.data.accessToken);
      if (error || !data.user?.email) {
        return NextResponse.json(
          { error: 'This password reset link is invalid or has expired. Please request a new link.' },
          { status: 400 }
        );
      }

      const email = data.user.email.toLowerCase();
      user = await db
        .prepare('SELECT id, email, role, is_active FROM users WHERE email = ?')
        .get(email) as any;

      if (!user || !user.is_active) {
        return NextResponse.json(
          { error: 'This password reset link is invalid or has expired. Please request a new link.' },
          { status: 400 }
        );
      }

      newPassword = supabaseParsed.data.newPassword;
      auditDetails = 'Password reset completed via Supabase Auth recovery. All sessions were revoked.';
    } else {
      if (!tokenParsed.success) {
        return NextResponse.json(
          { error: 'Invalid password reset data' },
          { status: 400 }
        );
      }

      const { token, newPassword: parsedPassword } = tokenParsed.data;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const resetRow = await db.prepare(`
        SELECT id, user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token_hash = ?
      `).get(tokenHash) as any;

      if (!resetRow || resetRow.used_at) {
        return NextResponse.json({ error: 'This password reset link is invalid or has already been used.' }, { status: 400 });
      }

      if (new Date(resetRow.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This password reset link has expired. Please request a new one.' }, { status: 400 });
      }

      user = await db
        .prepare('SELECT id, email, role, is_active FROM users WHERE id = ?')
        .get(resetRow.user_id) as any;

      if (!user || !user.is_active) {
        return NextResponse.json({ error: 'This password reset link is invalid or has already been used.' }, { status: 400 });
      }

      newPassword = parsedPassword;
      resetTokenId = resetRow.id;
    }

    const newHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    await db.prepare(`
      UPDATE users
      SET password_hash = ?, failed_sign_ins = 0, locked_until = NULL, updated_at = ?
      WHERE id = ?
    `).run(newHash, now, user.id);

    if (resetTokenId) {
      await db.prepare('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?').run(now, resetTokenId);
    }
    await db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);

    await revokeAllUserSessions(user.id);

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: auditDetails,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
