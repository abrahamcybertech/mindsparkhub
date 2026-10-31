'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [inquiryType, setInquiryType] = useState<'general' | 'programme' | 'partnership'>('general');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState<number>(0);
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Configurable contact values: hidden if empty
  const officialEmail = 'info@mindsparkhub.org';
  const officialPhone = ''; // Not verified yet: kept empty to cleanly hide element per Section 2.3 & 5.8!
  const officeAddress = 'Wukari, Taraba State, Nigeria';

  useEffect(() => {
    setSubmissionTimestamp(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('You must review and agree to the privacy policy notice.');
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
          type: inquiryType,
          fullName,
          email,
          phoneNumber,
          message,
          consentGiven,
          isAdultConfirmed,
          website_url_check: honeypot,
          submissionTimestamp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deliver message');
      }

      setSuccessCode(data.referenceCode);
    } catch (err: any) {
      setError(err.message || 'An error occurred while delivering your message.');
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
              Official Communication
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Contact MindSpark Hub
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              We look forward to connecting with you.
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              For general inquiries, educational partnerships, or programme invitations, communicate directly with our Secretariat through the official channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form and Verified Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-serif text-navy-900">
                  Secretariat Channels
                </h2>
                <p className="text-sm text-navy-700 leading-relaxed">
                  Our Communications and Secretariat units respond to formal inquiries within 48 operational hours.
                </p>
              </div>

              <div className="space-y-4">
                {officialEmail && (
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <Mail className="w-6 h-6 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-navy-900">Official Email</p>
                      <a href={`mailto:${officialEmail}`} className="text-sm text-navy-800 hover:text-gold-600">
                        {officialEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* Telephone is hidden cleanly when not verified */}
                {officialPhone && (
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy-900">Telephone</p>
                    <p className="text-sm text-navy-800">{officialPhone}</p>
                  </div>
                )}

                {officeAddress && (
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <MapPin className="w-6 h-6 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-navy-900">Location</p>
                      <p className="text-sm text-navy-800">{officeAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-navy-900 text-white rounded-xl space-y-2">
                <h3 className="text-base font-bold font-serif text-white">
                  Data Protection Commitment
                </h3>
                <p className="text-xs text-navy-300 leading-relaxed">
                  MindSpark Hub never sells or shares your personal details with third party advertisers. All communications are managed strictly under the Nigeria Data Protection Act 2023.
                </p>
              </div>
            </div>

            {/* Inquiries Form Column */}
            <div className="lg:col-span-7">
              {successCode ? (
                <div className="bg-sand-50 rounded-2xl p-8 sm:p-10 border border-emerald-300 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-navy-900">
                    Message Delivered
                  </h3>
                  <p className="text-sm text-navy-800">
                    Your inquiry has been logged in our secure system.
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-sand-300 inline-block">
                    <span className="text-xs text-navy-600 block">Reference Code</span>
                    <span className="text-xl font-mono font-bold text-navy-900">{successCode}</span>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessCode(null);
                        setMessage('');
                      }}
                      className="text-xs font-semibold text-navy-900 underline"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-sand-50 rounded-2xl p-8 sm:p-10 border border-sand-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-navy-900">
                      Send a Message to the Secretariat
                    </h3>
                    <p className="text-xs text-navy-700 mt-1">
                      Choose an inquiry type and provide your details below.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {[
                      { id: 'general', label: 'General' },
                      { id: 'programme', label: 'Programme Outreach' },
                      { id: 'partnership', label: 'Partnership' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setInquiryType(tab.id as any)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          inquiryType === tab.id
                            ? 'bg-navy-900 text-white'
                            : 'bg-white text-navy-700 border border-sand-300 hover:bg-sand-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      name="website_url_check"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-md bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-md bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">
                        Telephone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-md bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">
                        Message Content *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-md bg-white border border-sand-300 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-sand-200 space-y-2 text-xs text-navy-800">
                      <div className="flex items-start space-x-2">
                        <input
                          id="contact-age"
                          type="checkbox"
                          checked={isAdultConfirmed}
                          onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-sand-300 text-gold-500 cursor-pointer"
                        />
                        <label htmlFor="contact-age" className="cursor-pointer">
                          I confirm that I am 18 years of age or older.
                        </label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <input
                          id="contact-consent"
                          type="checkbox"
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-sand-300 text-gold-500 cursor-pointer"
                        />
                        <label htmlFor="contact-consent" className="cursor-pointer">
                          I consent to MindSpark Hub processing my details to reply to this inquiry.
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-6 rounded-md text-sm font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
