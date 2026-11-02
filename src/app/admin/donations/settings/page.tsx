import React from 'react';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DonationSettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.role, 'donations:manage')) redirect('/admin');

  const db = getDatabase();
  const rows = await db.prepare('SELECT key, value FROM donation_settings').all() as any[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  if (!settings.suggestedAmounts) settings.suggestedAmounts = '1000,2000,5000,10000';
  if (!settings.minAmount) settings.minAmount = '100';
  if (!settings.maxAmount) settings.maxAmount = '1000000';
  if (!settings.enabledPaymentMethods) settings.enabledPaymentMethods = 'card,bank_transfer,ussd';
  if (!settings.bankTransferDetails) settings.bankTransferDetails = 'Account Name: MindSpark Hub\nBank: [Add bank name]\nAccount Number: [Add account number]';
  if (!settings.transparencyText) settings.transparencyText = 'Funds are managed with care. Contact the Secretariat for questions.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-navy-900">Donation Settings</h1>
        <p className="text-sm text-navy-700">Configure amounts, methods and transparency text</p>
      </div>

      <form action="/api/admin/donations/settings" method="PUT" className="bg-white rounded-xl border border-sand-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Suggested amounts (comma separated)</label>
          <input name="suggestedAmounts" defaultValue={settings.suggestedAmounts} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-navy-900 block mb-1">Minimum amount</label>
            <input name="minAmount" defaultValue={settings.minAmount} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-navy-900 block mb-1">Maximum amount</label>
            <input name="maxAmount" defaultValue={settings.maxAmount} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Enabled payment methods</label>
          <input name="enabledPaymentMethods" defaultValue={settings.enabledPaymentMethods} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Bank transfer details</label>
          <textarea name="bankTransferDetails" defaultValue={settings.bankTransferDetails} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" rows={4} />
        </div>
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Transparency text</label>
          <textarea name="transparencyText" defaultValue={settings.transparencyText} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" rows={4} />
        </div>
        <button type="submit" className="px-4 py-2 bg-navy-900 text-white rounded text-sm font-semibold">Save Settings</button>
      </form>
    </div>
  );
}
