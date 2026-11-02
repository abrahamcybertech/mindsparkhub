import React from 'react';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DonationDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.role, 'donations:view')) redirect('/admin');

  const db = getDatabase();
  const donation = await db.prepare('SELECT * FROM donations WHERE id = ?').get(params.id) as any;
  if (!donation) redirect('/admin/donations');
  const history = await db.prepare('SELECT * FROM donation_status_history WHERE donation_id = ? ORDER BY created_at ASC').all(params.id) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">Donation Detail</h1>
          <p className="text-sm text-navy-700 font-mono">{donation.reference_code}</p>
        </div>
        <Link href="/admin/donations" className="px-3 py-2 bg-sand-100 border border-sand-300 text-navy-900 rounded text-sm font-semibold">Back</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-2 text-sm">
          <p><strong>Amount:</strong> {donation.currency} {donation.amount}</p>
          <p><strong>Type:</strong> {donation.donation_type}</p>
          <p><strong>Designation:</strong> {donation.designation}</p>
          <p><strong>Status:</strong> {donation.status}</p>
          <p><strong>Provider:</strong> {donation.provider}</p>
          <p><strong>Provider Reference:</strong> {donation.provider_reference || '-'}</p>
          <p><strong>Created:</strong> {new Date(donation.created_at).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-sand-200 p-6 space-y-2 text-sm">
          <p><strong>Donor Name:</strong> {donation.is_anonymous ? 'Anonymous' : (donation.donor_name || '-')}</p>
          <p><strong>Email:</strong> {donation.donor_email}</p>
          <p><strong>Phone:</strong> {donation.donor_phone || '-'}</p>
          <p><strong>Note:</strong> {donation.note || '-'}</p>
          <p><strong>Anonymous:</strong> {donation.is_anonymous ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="text-lg font-bold font-serif text-navy-900 mb-4">Status History</h2>
        <div className="space-y-2 text-sm">
          {history.map((h) => (
            <div key={h.id} className="p-3 bg-sand-50 rounded border border-sand-200">
              <p><strong>{h.status}</strong> by {h.actor_role} at {new Date(h.created_at).toLocaleString()}</p>
              {h.note && <p className="text-navy-700">{h.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
