import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NDPA 2023 Compliance',
  description:
    'MindSpark Hub official privacy policy and personal data protection practices under the Nigeria Data Protection Act 2023.',
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="bg-navy-950 text-white py-16 border-b border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Trust and Data Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Official Privacy Policy
          </h1>
          <p className="text-sm text-navy-300">
            Compliant with the Nigeria Data Protection Act 2023 (NDPA). Effective Date: October 2026.
          </p>
        </div>
      </section>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-navy-800 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              1. Our Data Protection Commitment
            </h2>
            <p>
              MindSpark Hub is committed to safeguarding the privacy and digital dignity of all citizens who interact with our platform. We collect the minimum information necessary to execute our youth development, mentorship, and enlightenment mission.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              2. Lawful Basis for Processing
            </h2>
            <p>
              In accordance with Section 25 of the Nigeria Data Protection Act 2023, we process personal information under the following lawful bases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Consent:</strong> Freely given when you submit an inquiry, volunteer application, or mentorship registration through our website.
              </li>
              <li>
                <strong>Legitimate Institutional Purpose:</strong> Evaluating volunteer suitability, coordinating secondary school invasion logistics, and preventing system abuse.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              3. Protection of Minors and Child Safeguarding
            </h2>
            <p>
              Secondary school students are minors under Nigerian law. MindSpark Hub enforces strict safeguarding rules:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>We never collect personal contact information from children through our public forms.</li>
              <li>Photographs depicting secondary school students are published only with verified institutional consent from participating schools and guardians.</li>
              <li>All metadata, including device information and geographic location data, is permanently stripped from images before publication.</li>
              <li>We operate an immediate one click takedown mechanism for any guardian or school requesting removal of an outreach photograph.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              4. Zero Non Essential Cookies Policy
            </h2>
            <p>
              MindSpark Hub respects visitor privacy by design. We do not use third party advertising trackers, commercial telemetry pixels, or intrusive behavioural profiling cookies. The only cookies utilized are strictly necessary security tokens required for authenticated administrative staff to access the portal.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              5. Citizen Data Rights Under NDPA 2023
            </h2>
            <p>
              Every Nigerian citizen whose personal records are held by MindSpark Hub possesses statutory rights, including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
                <h3 className="font-bold text-sm text-navy-900">Right of Access and Correction</h3>
                <p className="text-xs text-navy-700 mt-1">You may request a copy of your submitted inquiry data or request correction of any inaccurate records.</p>
              </div>
              <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
                <h3 className="font-bold text-sm text-navy-900">Right to Erasure</h3>
                <p className="text-xs text-navy-700 mt-1">You may request the permanent deletion of your contact or volunteer records from our database.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              6. Data Protection Contact
            </h2>
            <p className="text-sm">
              To exercise any of your data protection rights or report a safeguarding concern, contact our designated privacy officer at:
            </p>
            <p className="text-sm font-semibold text-navy-900">
              Email: privacy@mindsparkhub.org
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
