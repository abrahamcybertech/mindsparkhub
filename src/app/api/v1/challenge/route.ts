import { NextRequest } from 'next/server';
import { createPublicChallenge } from '@/lib/api/mobile-auth';
import { apiError, apiJson, getClientIp, readJsonBody } from '@/lib/api/http';

import { checkRateLimit } from '@/lib/security/rate-limit';
import { MobileChallengeSchema } from '@/lib/validation/mobile';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`challenge:${ip}`, 30, 300, 'ip');
  if (!rate.success) {
    return apiError(429, 'Please wait a moment before requesting another form challenge.', 'RATE_LIMITED');
  }

  const body = await readJsonBody(req);
  if (!body.ok) return body.response;

  const parsed = MobileChallengeSchema.safeParse(body.data);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message || 'The request could not be validated.');
  }

  const challenge = await createPublicChallenge(parsed.data.deviceId);
  return apiJson(challenge, { status: 201 });
}
