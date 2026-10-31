import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, getClientIp, hashDevice, readJsonBody } from '@/lib/api/http';
import { verifyPublicChallenge } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileSubmissionSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipRate = checkRateLimit(`mobile-submission:${ip}`, 5, 600, 'ip');
  if (!ipRate.success) {
    return apiError(429, 'Too many submissions. Please wait before trying again.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = MobileSubmissionSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The form could not be validated.');
  }

  const data = parsed.data;
  if (data.website_url_check) {
    return apiError(400, 'The form could not be validated.');
  }

  const deviceRate = checkRateLimit(`mobile-submission-device:${hashDevice(data.deviceId)}`, 3, 3600, 'account');
  if (!deviceRate.success) {
    return apiError(429, 'Too many submissions from this device. Please wait before trying again.', 'RATE_LIMITED');
  }

  const challenge = await verifyPublicChallenge(data.challenge, data.deviceId);
  if (!challenge.ok) {
    return apiError(400, 'Please refresh the form and submit again.', 'CHALLENGE_INVALID');
  }

  try {
    const db = getDatabase();
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const referenceCode = `MSH-2026-${randomHex}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO submissions (
        id, reference_code, type, full_name, email, phone_number, interests, message,
        consent_given, is_adult_confirmed, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'NEW', ?)
    `).run(
      id,
      referenceCode,
      data.type,
      data.fullName,
      data.email,
      data.phoneNumber || null,
      data.interests || null,
      data.message,
      now
    );

    await recordAuditLog({
      actorId: 'public_citizen',
      actorRole: 'ANONYMOUS',
      action: 'MOBILE_FORM_SUBMISSION',
      targetEntity: 'submissions',
      targetId: id,
      ipAddress: ip,
      details: `Mobile inquiry type: ${data.type}, Ref: ${referenceCode}`,
      outcome: 'SUCCESS',
    });

    return apiJson(
      {
        success: true,
        referenceCode,
        message: 'Your message has been received with thanks. A confirmation record has been created.',
      },
      { status: 201 }
    );
  } catch {
    return apiError(503, 'The form could not be saved. Please try again shortly.', 'SERVICE_UNAVAILABLE');
  }
}
