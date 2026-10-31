import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { ForgotPasswordSchema } from '@/lib/validation';
import {
  getSupabaseAdminClient,
  getSupabaseAuthClient,
  getSupabaseRecoveryRedirectUrl,
} from '@/lib/supabase/server';

function isExistingAuthUserError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('already') && (lower.includes('registered') || lower.includes('exists'));
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  const rateCheck = checkRateLimit(`forgot:${ip}`, 5, 900, 'ip');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `Too many reset requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const genericMessage =
      'If an account exists for that email, a password reset email has been sent. Check your inbox or spam folder. If it does not arrive, wait a minute and try again.';

    const db = getDatabase();
    const user = await db
      .prepare('SELECT id, name, email, role, is_active FROM users WHERE email = ?')
      .get(email) as any;

    if (!user || !user.is_active) {
      return NextResponse.json({ success: true, message: genericMessage });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const supabaseAuth = getSupabaseAuthClient();

    if (!supabaseAdmin || !supabaseAuth) {
      console.error('Supabase Auth is not configured for password recovery');
      return NextResponse.json({ success: true, message: genericMessage });
    }

    const shadowPassword = crypto.randomBytes(32).toString('base64url');
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: shadowPassword,
      user_metadata: {
        app: 'mindspark',
        mindspark_user_id: user.id,
        role: user.role,
      },
    });

    if (createError && !isExistingAuthUserError(createError.message)) {
      console.error('Supabase Auth shadow user creation failed:', createError.message);
    }

    const redirectTo = getSupabaseRecoveryRedirectUrl();
    const { error: sendError } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (sendError) {
      console.error('Supabase Auth recovery email failed:', sendError.message);
    }

    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      targetEntity: 'users',
      targetId: user.id,
      ipAddress: ip,
      details: 'Supabase Auth recovery email requested',
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true, message: genericMessage });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
