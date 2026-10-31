import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { getDatabase } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/security/audit';
import { apiError, apiJson, getClientIp, hashDevice, readJsonBody } from '@/lib/api/http';
import { verifyPublicChallenge } from '@/lib/api/mobile-auth';
import { guardMobileRequest } from '@/lib/api/version';
import { MobileImageReportSchema } from '@/lib/validation/mobile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const ipRate = checkRateLimit(`mobile-report:${ip}`, 5, 3600, 'ip');
  if (!ipRate.success) {
    return apiError(429, 'Too many reports. Please wait before trying again.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;
  const parsed = MobileImageReportSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The report could not be validated.');
  }

  const data = parsed.data;
  const deviceRate = checkRateLimit(`mobile-report-device:${hashDevice(data.deviceId)}`, 3, 3600, 'account');
  if (!deviceRate.success) {
    return apiError(429, 'Too many reports from this device. Please wait before trying again.', 'RATE_LIMITED');
  }

  const challenge = await verifyPublicChallenge(data.challenge, data.deviceId);
  if (!challenge.ok) {
    return apiError(400, 'Please refresh the report form and submit again.', 'CHALLENGE_INVALID');
  }

  try {
    const db = getDatabase();
    const item = (await db.prepare('SELECT id FROM gallery_items WHERE id = ?').get(data.galleryItemId)) as
      | { id: string }
      | undefined;
    if (!item) {
      return apiError(404, 'This image could not be found.', 'NOT_FOUND');
    }

    const id = crypto.randomUUID();
    const referenceCode = `MSR-2026-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO image_reports (id, gallery_item_id, reason, details, contact_email, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'NEW', ?)
    `).run(id, data.galleryItemId, data.reason, data.details, data.contactEmail || null, now);

    await recordAuditLog({
      actorId: 'public_citizen',
      actorRole: 'ANONYMOUS',
      action: 'GALLERY_IMAGE_REPORTED',
      targetEntity: 'image_reports',
      targetId: id,
      ipAddress: ip,
      details: `Image report for ${data.galleryItemId}. Reason: ${data.reason}. Ref: ${referenceCode}`,
      outcome: 'SUCCESS',
    });

    return apiJson(
      {
        success: true,
        referenceCode,
        message: 'Your report has been received. The safeguarding team will review it promptly.',
      },
      { status: 201 }
    );
  } catch {
    return apiError(503, 'The report could not be saved. Please try again shortly.', 'SERVICE_UNAVAILABLE');
  }
}
