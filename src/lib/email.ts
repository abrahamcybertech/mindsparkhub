import nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  sent: boolean;
  provider?: 'smtp' | 'supabase';
  reason?: string;
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function supabaseEmailConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_EMAIL_FUNCTION
  );
}

export function isEmailConfigured(): boolean {
  return smtpConfigured() || supabaseEmailConfigured();
}

async function sendViaSmtp(message: EmailMessage): Promise<EmailResult> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASSWORD as string,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  return { sent: true, provider: 'smtp' };
}

async function sendViaSupabase(message: EmailMessage): Promise<EmailResult> {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string).replace(/\/$/, '');
  const functionName = process.env.SUPABASE_EMAIL_FUNCTION as string;

  const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase email function failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return { sent: true, provider: 'supabase' };
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  if (smtpConfigured()) {
    return sendViaSmtp(message);
  }

  if (supabaseEmailConfigured()) {
    return sendViaSupabase(message);
  }

  console.warn(
    '[email] No email provider configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD or SUPABASE_EMAIL_FUNCTION.'
  );
  return { sent: false, reason: 'not-configured' };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[character];
  });
}

export function buildPasswordResetEmail(to: string, name: string, resetUrl: string): EmailMessage {
  const safeName = escapeHtml(name || 'there');

  return {
    to,
    subject: 'Reset your MindSpark Hub admin password',
    text: `Hello ${safeName},\n\nA password reset was requested for your MindSpark Hub admin account. Use the link below within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\nMindSpark Hub`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Reset your MindSpark Hub password</h2>
        <p>Hello ${safeName},</p>
        <p>A password reset was requested for your MindSpark Hub admin account. This link is valid for 30 minutes.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #475569;">${resetUrl}</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="margin-top: 28px; color: #64748b; font-size: 13px;">MindSpark Hub</p>
      </div>
    `,
  };
}
