import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { AccountSettings } from '@/components/admin/AccountSettings';

export default async function AdminAccountPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AccountSettings
      user={{
        name: session.name,
        email: session.email,
        role: session.role,
        mfaEnabled: session.mfaEnabled,
      }}
    />
  );
}
