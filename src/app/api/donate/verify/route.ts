import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  const db = getDatabase();
  const donation = (await db.prepare('SELECT reference_code, amount, currency, status, designation, donation_type, created_at FROM donations WHERE reference_code = ?').get(reference)) as any;
  if (!donation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ donation });
}
