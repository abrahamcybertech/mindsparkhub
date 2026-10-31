import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const API_VERSION = 'v1';
export const MAX_JSON_BYTES = 64 * 1024;

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}

export function getUserAgent(req: NextRequest): string {
  return (req.headers.get('user-agent') || 'Unknown').slice(0, 300);
}

export function hashDevice(deviceId: string): string {
  const salt = process.env.DEVICE_HASH_SALT || process.env.SESSION_SECRET || 'mindspark-device-salt';
  return crypto.createHash('sha256').update(`${deviceId}:${salt}`).digest('hex');
}

export function apiJson(
  body: unknown,
  init?: { status?: number; cache?: string; headers?: Record<string, string> }
): NextResponse {
  const response = NextResponse.json(body, { status: init?.status ?? 200 });
  response.headers.set('Cache-Control', init?.cache ?? 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-MindSpark-Api-Version', API_VERSION);
  if (init?.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export function apiError(status: number, message: string, code?: string): NextResponse {
  return apiJson({ error: message, ...(code ? { code } : {}) }, { status });
}

export async function readJsonBody(req: NextRequest): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_JSON_BYTES) {
    return { ok: false, response: apiError(413, 'The request is larger than this service accepts.') };
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { ok: false, response: apiError(415, 'This endpoint accepts JSON requests only.') };
  }

  try {
    const data = await req.json();
    return { ok: true, data };
  } catch {
    return { ok: false, response: apiError(400, 'The request body could not be read.') };
  }
}

export function noStoreHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
  };
}
