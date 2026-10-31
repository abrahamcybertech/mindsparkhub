import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = guardMobileRequest(req, { allowDuringKillSwitch: true });
  if (guard) return guard;

  try {
    const db = getDatabase();
    await db.prepare('SELECT 1 AS ok').get();
    return apiJson({ status: 'ok', apiVersion: 'v1', time: new Date().toISOString() });
  } catch {
    return apiError(503, 'The service is not ready.', 'SERVICE_UNAVAILABLE');
  }
}
