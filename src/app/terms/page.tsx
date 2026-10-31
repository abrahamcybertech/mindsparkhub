import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | MindSpark Hub',
  description: 'Terms and institutional conditions governing use of the MindSpark Hub official website.',
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="bg-navy-950 text-white py-16 border-b border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Terms of Use
          </h1>
          <p className="text-sm text-navy-300">
            Last Updated: October 2026.
          </p>
        </div>
      </section>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-navy-800 leading-relaxed text-sm">
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-serif text-navy-900">
              1. Institutional Identity
            </h2>
            <p>
              This website is the official digital portal of MindSpark Hub, an educational youth development organisation. All materials, curricula, presentation slides, articles, and photographic media published on this site are protected by copyright and institutional ownership.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold font-serif text-navy-900">
              2. Acceptable Conduct
            </h2>
            <p>
              Visitors may explore public information, share educational articles with proper attribution, and submit inquiries for legitimate engagement. Any attempt to probe system boundaries, inject malicious code, harvest data without authorization, or spam contact channels is strictly prohibited.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold font-serif text-navy-900">
              3. Protection of Minors
            </h2>
            <p>
              Photographs depicting students are published under formal educational consent. Copying, scraping, reproducing, or redistributing images of minors for commercial or unauthorized purposes will result in legal prosecution under the Child Rights Act and applicable cybercrime laws.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold font-serif text-navy-900">
              4. Contact for Inquiries
            </h2>
            <p>
              For legal inquiries regarding intellectual property or partnerships, contact our Secretariat at: <a href="mailto:secretariat@mindsparkhub.org" className="text-navy-900 font-semibold underline">secretariat@mindsparkhub.org</a>.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
