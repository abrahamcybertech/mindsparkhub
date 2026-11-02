import React from 'react';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DonationsAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.role, 'donations:view')) redirect('/admin');

  const db = getDatabase();
  const donations = await db.prepare("SELECT id, reference_code, amount, currency, donation_type, designation, donor_name, donor_email, is_anonymous, status, created_at FROM donations ORDER BY created_at DESC LIMIT 100").all() as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">Donations</h1>
          <p className="text-sm text-navy-700">Review and manage donation records</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/donations" download className="px-3 py-2 bg-navy-900 text-white rounded text-sm font-semibold">Export CSV</a>
          <Link href="/admin/donations/settings" className="px-3 py-2 bg-sand-100 border border-sand-300 text-navy-900 rounded text-sm font-semibold">Settings</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sand-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand-50">
            <tr>
              <th className="text-left p-3">Reference</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Designation</th>
              <th className="text-left p-3">Donor</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-t border-sand-200">
                <td className="p-3 font-mono text-xs">{d.reference_code}</td>
                <td className="p-3">{d.currency} {d.amount}</td>
                <td className="p-3">{d.donation_type}</td>
                <td className="p-3">{d.designation}</td>
                <td className="p-3">{d.is_anonymous ? 'Anonymous' : (d.donor_name || d.donor_email)}</td>
                <td className="p-3">{d.status}</td>
                <td className="p-3">{new Date(d.created_at).toLocaleString()}</td>
                <td className="p-3"><Link href={`/admin/donations/${d.id}`} className="text-navy-900 underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
