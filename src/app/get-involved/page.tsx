'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CheckCircle2, ShieldCheck, Send, ArrowRight } from 'lucide-react';

export default function GetInvolvedPage() {
  const [involvementType, setInvolvementType] = useState<'join' | 'volunteer' | 'mentor' | 'partner' | 'support'>('join');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [interests, setInterests] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState<number>(0);
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ referenceCode: string; message: string } | null>(null);

  useEffect(() => {
    setSubmissionTimestamp(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('Please review and check the privacy agreement.');
      return;
    }

    if (!isAdultConfirmed) {
      setError('You must confirm that you are 18 years of age or older.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: involvementType,
          fullName,
          email,
          phoneNumber,
          interests,
          message,
          consentGiven,
          isAdultConfirmed,
          website_url_check: honeypot,
          submissionTimestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccessData({
        referenceCode: data.referenceCode,
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Take Part in the Mission
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Get Involved With MindSpark Hub
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Join a Great House. Build the Future.
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Whether you wish to register as a dedicated member, volunteer as a mentor, support an outreach, or establish an institutional partnership, your contribution sparks positive change.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {successData ? (
            <div className="bg-sand-50 rounded-2xl p-8 sm:p-12 border border-emerald-300 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold font-serif text-navy-900">
                Application Received Successfully
              </h2>
              <p className="text-base text-navy-800 max-w-lg mx-auto">
                {successData.message}
              </p>
              <div className="p-4 bg-white rounded-xl border border-sand-300 inline-block">
                <p className="text-xs text-navy-600 uppercase tracking-wider font-semibold">
                  Your Official Tracking Reference Number
                </p>
                <p className="text-2xl font-mono font-bold text-navy-900 mt-1">
                  {successData.referenceCode}
                </p>
              </div>
              <p className="text-xs text-navy-600 max-w-md mx-auto">
                Please keep this reference code safe. Our Secretariat team will review your application and communicate via your provided email address.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-bold text-navy-900 hover:text-gold-600"
                >
                  <span>Return to Homepage</span>
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-sand-50 rounded-2xl p-8 sm:p-10 border border-sand-200 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-serif text-navy-900">
                  Select Your Involvement Pathway
                </h2>
                <p className="text-sm text-navy-700 mt-1">
                  Choose how you would like to engage with MindSpark Hub.
                </p>

                {/* Pathway Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                  {[
                    { id: 'join', label: 'Join Hub' },
                    { id: 'volunteer', label: 'Volunteer' },
                    { id: 'mentor', label: 'Be a Mentor' },
                    { id: 'partner', label: 'Partner' },
                    { id: 'support', label: 'Support' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInvolvementType(tab.id as any)}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                        involvementType === tab.id
                          ? 'bg-navy-900 text-white shadow-sm'
                          : 'bg-white text-navy-700 hover:bg-sand-200 border border-sand-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field (hidden for bot protection) */}
                <input
                  type="text"
                  name="website_url_check"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                      Full Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Samuel Ayomide"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. samuel@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                      Telephone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                      Area of Interest or Primary Skill
                    </label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g. Academic Mentorship, Logistics, Editorial"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                    Statement of Intent or Inquiry Details <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your background, motivations, and how you wish to collaborate with MindSpark Hub."
                    className="w-full px-4 py-3 rounded-lg bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Statutory Privacy & Age Affirmation */}
                <div className="p-4 bg-white rounded-xl border border-sand-200 space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      id="age-confirmation"
                      type="checkbox"
                      checked={isAdultConfirmed}
                      onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-sand-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                    />
                    <label htmlFor="age-confirmation" className="text-xs text-navy-800 cursor-pointer">
                      <strong>Age Confirmation:</strong> I confirm that I am 18 years of age or older. (Per our safeguarding policy, minors cannot submit data directly).
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      id="privacy-consent"
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-sand-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                    />
                    <label htmlFor="privacy-consent" className="text-xs text-navy-800 cursor-pointer">
                      <strong>Privacy Consent:</strong> I agree that MindSpark Hub may process my submitted details solely for evaluating my application and communicating with me in accordance with the <Link href="/privacy" className="text-navy-900 underline font-semibold">Privacy Policy</Link> and NDPA 2023 regulations.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-lg text-sm font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
