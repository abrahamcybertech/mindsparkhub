import { NextRequest } from 'next/server';
import { apiError, apiJson } from '@/lib/api/http';
import { guardMobileRequest } from '@/lib/api/version';
import { LEGAL_DOCUMENTS, type LegalDocument } from '@/content/legal';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: { doc: string } }) {
  const guard = guardMobileRequest(req);
  if (guard) return guard;

  const doc = context.params.doc as LegalDocument['slug'];
  if (!Object.prototype.hasOwnProperty.call(LEGAL_DOCUMENTS, doc)) {
    return apiError(404, 'This document could not be found.', 'NOT_FOUND');
  }

  return apiJson(
    { document: LEGAL_DOCUMENTS[doc] },
    { cache: 'public, s-maxage=300, stale-while-revalidate=600' }
  );
}
