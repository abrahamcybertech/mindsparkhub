import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { getDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/security/audit';

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:manage')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = getDatabase();
  const settings: Record<string, string> = {};
  const rows = await db.prepare('SELECT key, value FROM donation_settings').all() as any[];
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  if (!settings.suggestedAmounts) settings.suggestedAmounts = '1000,2000,5000,10000';
  if (!settings.minAmount) settings.minAmount = '100';
  if (!settings.maxAmount) settings.maxAmount = '1000000';
  if (!settings.enabledPaymentMethods) settings.enabledPaymentMethods = 'card,bank_transfer,ussd';
  if (!settings.bankTransferDetails) settings.bankTransferDetails = 'Account Name: MindSpark Hub\nBank: [Add bank name]\nAccount Number: [Add account number]';
  if (!settings.transparencyText) settings.transparencyText = 'Funds are managed with care. Contact the Secretariat for questions.';

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.role, 'donations:manage')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const db = getDatabase();
    const now = new Date().toISOString();
    const keys = ['suggestedAmounts', 'minAmount', 'maxAmount', 'enabledPaymentMethods', 'bankTransferDetails', 'transparencyText'];
    for (const k of keys) {
      if (body[k] !== undefined) {
        await db.prepare('INSERT INTO donation_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').run(k, String(body[k]), now);
        await recordAuditLog({
          actorId: session.userId,
          actorRole: session.role,
          action: 'DONATION_SETTINGS_UPDATE',
          targetEntity: 'donation_settings',
          targetId: k,
          details: `Updated setting ${k}`,
          outcome: 'SUCCESS',
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
