import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { PublicInquirySchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog, hashIpForPrivacy } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Enforce rate limiting: 5 submissions per 10 minutes per IP
    const rateCheck = checkRateLimit(ip, 5, 600, 'ip');
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many submissions. For security, please wait ${rateCheck.resetInSeconds} seconds before submitting again.`,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate payload
    const body = await req.json();
    const parsed = PublicInquirySchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid form submission.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = parsed.data;

    // 3. Generate human friendly tracking reference code (e.g. MSH-2026-8742)
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const referenceCode = `MSH-2026-${randomHex}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const db = getDatabase();
    await db.prepare(`
      INSERT INTO submissions (
        id, reference_code, type, full_name, email, phone_number, interests, message, consent_given, is_adult_confirmed, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)
    `).run(
      id,
      referenceCode,
      data.type,
      data.fullName,
      data.email,
      data.phoneNumber || null,
      data.interests || null,
      data.message,
      1,
      1,
      now
    );

    // 4. Log submission event in append-only audit trail
    await recordAuditLog({
      actorId: 'public_citizen',
      actorRole: 'ANONYMOUS',
      action: 'PUBLIC_FORM_SUBMISSION',
      targetEntity: 'submissions',
      targetId: id,
      ipAddress: ip,
      details: `Inquiry type: ${data.type}, Ref: ${referenceCode}`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      referenceCode,
      message: 'Your inquiry has been received with thanks. A confirmation record has been created.',
    });
  } catch (error) {
    console.error('Error handling public form submission:', error);
    return NextResponse.json(
      { error: 'An unexpected operational error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
