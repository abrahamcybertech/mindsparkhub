import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Shield, Key, FileCheck, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security and Responsible Disclosure | MindSpark Hub',
  description:
    'Security architecture, responsible vulnerability disclosure guidelines, and security.txt standards for MindSpark Hub.',
};

export default function SecurityPage() {
  return (
    <PublicLayout>
      <section className="bg-navy-950 text-white py-16 border-b border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Cybersecurity and Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Security and Responsible Disclosure
          </h1>
          <p className="text-sm text-navy-300">
            Security by design, privacy first data governance, and open vulnerability reporting.
          </p>
        </div>
      </section>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-navy-800 leading-relaxed text-sm">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              1. Our Security Philosophy
            </h2>
            <p>
              Security at MindSpark Hub is not an afterthought; it is built into the foundation of every database query, authentication handshake, and media pipeline. We adhere to OWASP ASVS Level 2 as our system baseline and enforce Level 3 practices for administrative authentication and access boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-2">
              <Key className="w-6 h-6 text-gold-600" />
              <h3 className="font-bold text-navy-900 font-serif">Two Step Verification</h3>
              <p className="text-xs text-navy-700">Mandatory time based one time password (TOTP RFC 6238) multi factor authentication on all staff accounts.</p>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-2">
              <Shield className="w-6 h-6 text-gold-600" />
              <h3 className="font-bold text-navy-900 font-serif">Immutable Audit Logs</h3>
              <p className="text-xs text-navy-700">Append only audit records with SHA 256 hash chaining guaranteeing that operational history cannot be altered.</p>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-2">
              <FileCheck className="w-6 h-6 text-gold-600" />
              <h3 className="font-bold text-navy-900 font-serif">Safe Image Pipeline</h3>
              <p className="text-xs text-navy-700">Magic byte verification and complete EXIF geolocation stripping to defend visitor privacy and student safety.</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              2. Responsible Vulnerability Disclosure Program
            </h2>
            <p>
              We welcome responsible security researchers who identify potential vulnerabilities in our web platform. We pledge to work with researchers who discover security issues in good faith.
            </p>
            <div className="p-6 bg-sand-50 rounded-xl border border-sand-300 space-y-3">
              <h3 className="font-bold text-navy-900">Research Guidelines:</h3>
              <ul className="list-disc pl-6 space-y-1 text-xs text-navy-700">
                <li>Promptly report any suspected vulnerability to our security team.</li>
                <li>Avoid accessing, copying, or altering personal data belonging to citizens or minors.</li>
                <li>Give us reasonable time (at least 30 days) to remediate before public disclosure.</li>
                <li>Do not execute denial of service attacks or degrade public service availability.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              3. RFC 9116 Security.txt
            </h2>
            <p>
              MindSpark Hub maintains an active security.txt record per RFC 9116 standards. You can inspect our machine readable security directives at:
            </p>
            <p className="p-3 bg-navy-950 text-gold-400 font-mono text-xs rounded-lg inline-block">
              <Link href="/.well-known/security.txt" target="_blank" className="hover:underline">
                https://mindsparkhub.org/.well-known/security.txt
              </Link>
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-sand-200">
            <h2 className="text-xl font-bold font-serif text-navy-900">
              Reporting a Vulnerability
            </h2>
            <p>
              Send full technical details, steps to reproduce, and proof of concept to:
            </p>
            <p className="font-semibold text-navy-900">
              Email: security@mindsparkhub.org
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
