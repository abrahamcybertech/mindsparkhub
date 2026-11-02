import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank you for your gift',
  description: 'Donation confirmation page.',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <PublicLayout>
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">Thank you</h1>
          <p className="text-base text-navy-800 leading-relaxed">
            Thank you for your gift. We appreciate your support for MindSpark Hub. A receipt will be sent by email once your payment is confirmed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="px-6 py-2.5 bg-navy-900 text-white rounded text-sm font-semibold">Return to homepage</Link>
            <Link href="/donate" className="px-6 py-2.5 bg-sand-100 border border-sand-300 text-navy-900 rounded text-sm font-semibold">Give again</Link>
          </div>
          <p className="text-xs text-navy-600">If you have questions, contact Mindsparkhub25@gmail.com.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
