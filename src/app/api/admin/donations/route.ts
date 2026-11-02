import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:view')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const designation = searchParams.get('designation');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const db = getDatabase();
  let query = 'SELECT id, reference_code, amount, currency, donation_type, designation, donor_name, donor_email, donor_phone, is_anonymous, status, provider_reference, subscription_code, created_at FROM donations WHERE 1=1';
  const params: any[] = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (designation) { query += ' AND designation = ?'; params.push(designation); }
  if (from) { query += ' AND created_at >= ?'; params.push(from); }
  if (to) { query += ' AND created_at <= ?'; params.push(to); }

  query += ' ORDER BY created_at DESC LIMIT 200';
  const donations = await db.prepare(query).all(...params);
  return NextResponse.json({ donations });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:export')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const db = getDatabase();
    const rows = await db.prepare('SELECT reference_code, amount, currency, donation_type, designation, donor_name, donor_email, donor_phone, is_anonymous, status, provider_reference, created_at FROM donations ORDER BY created_at DESC').all() as any[];
    const headers = ['Reference', 'Amount', 'Currency', 'Type', 'Designation', 'Donor Name', 'Email', 'Phone', 'Anonymous', 'Status', 'Provider Ref', 'Created At'];
    const csvLines = [headers.join(',')];
    const escape = (val: any) => `"${(val === null || val === undefined ? '' : String(val)).replace(/"/g, '""')}"`;
    for (const r of rows) {
      csvLines.push([
        escape(r.reference_code), escape(r.amount), escape(r.currency), escape(r.donation_type), escape(r.designation),
        escape(r.is_anonymous ? '' : r.donor_name), escape(r.donor_email), escape(r.donor_phone), escape(r.is_anonymous ? 1 : 0),
        escape(r.status), escape(r.provider_reference), escape(r.created_at)
      ].join(','));
    }
    const csvContent = csvLines.join('\n');
    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'DONATIONS_EXPORT',
      targetEntity: 'donations',
      targetId: 'all',
      details: `Exported ${rows.length} donation records`,
      outcome: 'SUCCESS',
    });
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mindspark_donations_${Date.now()}.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
