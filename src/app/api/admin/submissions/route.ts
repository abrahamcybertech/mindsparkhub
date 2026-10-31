import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'inquiries:view')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges to view submissions' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  const db = getDatabase();
  let query = 'SELECT * FROM submissions WHERE 1=1';
  const params: any[] = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT 100';
  const submissions = await db.prepare(query).all(...params);

  return NextResponse.json({ submissions });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'inquiries:manage')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges to update submissions' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    const db = getDatabase();
    await db.prepare(`
      UPDATE submissions SET
        status = COALESCE(?, status),
        internal_notes = COALESCE(?, internal_notes)
      WHERE id = ?
    `).run(status || null, internalNotes || null, id);

    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'SUBMISSION_UPDATED',
      targetEntity: 'submissions',
      targetId: id,
      details: `Updated status: ${status || 'unchanged'}, notes updated`,
      outcome: 'SUCCESS',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating submission:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.role, 'inquiries:export')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges to export data' }, { status: 403 });
  }

  try {
    const db = getDatabase();
    const rows = await db.prepare('SELECT reference_code, type, full_name, email, phone_number, interests, status, created_at FROM submissions ORDER BY created_at DESC').all() as any[];

    // Generate CSV
    const headers = ['Reference Code', 'Type', 'Full Name', 'Email', 'Phone', 'Interests', 'Status', 'Date'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const escape = (val: string) => `"${(val || '').toString().replace(/"/g, '""')}"`;
      csvLines.push([
        escape(r.reference_code),
        escape(r.type),
        escape(r.full_name),
        escape(r.email),
        escape(r.phone_number),
        escape(r.interests),
        escape(r.status),
        escape(r.created_at),
      ].join(','));
    }

    const csvContent = csvLines.join('\n');

    // Audit log the export
    await recordAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: 'DATA_EXPORT',
      targetEntity: 'submissions',
      targetId: 'all',
      details: `Exported ${rows.length} submission records`,
      outcome: 'SUCCESS',
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mindspark_submissions_${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Internal operational error' }, { status: 500 });
  }
}
