'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BookOpen, Users, HeartHandshake, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Metadata is defined in a separate export pattern not used; keep client component simple

export default function DonatePage() {
  return (
    <PublicLayout>
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Support the Mission
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Give to equip a generation for purpose
            </h1>
            <p className="text-lg text-navy-200 leading-relaxed">
              Your gift helps MindSpark Hub equip Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
            </p>
            <div className="pt-2">
              <a
                href="#donation-form"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
              >
                <span>Give now</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold font-serif text-navy-900">What your gift supports</h2>
            <p className="text-base text-navy-700">Support one of our programmes or the General Fund.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-sand-50 p-6 rounded-xl border border-sand-200 space-y-3">
              <BookOpen className="w-8 h-8 text-gold-600" />
              <h3 className="text-xl font-bold font-serif text-navy-900">Secondary Schools Invasion</h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Designed to influence teenagers early, rebuild mindsets, instil vision before confusion sets in, and plant seeds of greatness before doubt takes root.
              </p>
            </div>
            <div className="bg-sand-50 p-6 rounded-xl border border-sand-200 space-y-3">
              <Users className="w-8 h-8 text-gold-600" />
              <h3 className="text-xl font-bold font-serif text-navy-900">Campus Sparking</h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Transforms undergraduates into competent, skilled, and purpose aligned students prepared for real impact, shifting minds from certificates to value creation.
              </p>
            </div>
            <div className="bg-sand-50 p-6 rounded-xl border border-sand-200 space-y-3">
              <HeartHandshake className="w-8 h-8 text-gold-600" />
              <h3 className="text-xl font-bold font-serif text-navy-900">Community Enlightenment</h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Reaches working class adults and middle aged citizens, awakening economic productivity, renewing purpose, and promoting civic participation.
              </p>
            </div>
            <div className="bg-sand-50 p-6 rounded-xl border border-sand-200 space-y-3">
              <Gift className="w-8 h-8 text-gold-600" />
              <h3 className="text-xl font-bold font-serif text-navy-900">General Fund</h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Allows the team to direct resources where they are needed most to sustain the mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="donation-form" className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold font-serif text-navy-900">Make your gift</h2>
            <p className="text-base text-navy-700">Secure giving through Paystack. Name and email are required. Phone number is optional. You may give anonymously.</p>
          </div>
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-sand-200 shadow-sm">
            <DonationForm />
          </div>
          <div className="mt-6 text-xs text-navy-700 text-center">
            <p>By giving, you agree to our <Link href="/privacy" className="text-navy-900 underline">privacy notice</Link>.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-navy-900">How your gift is used</h2>
          <p className="text-base text-navy-800 leading-relaxed">
            Funds are managed with care. Until the finance team approves public figures, we show a plain statement of how funds are managed and who to contact with questions.
          </p>
          <div className="p-4 bg-sand-50 rounded-lg border border-sand-200 text-sm text-navy-800">
            <p><strong>Questions:</strong> Reach the Secretariat at Mindsparkhub25@gmail.com.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand-50 border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-navy-900">Other ways to give</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/get-involved" className="inline-flex items-center px-4 py-2 bg-white border border-sand-300 rounded text-sm font-semibold text-navy-900 hover:bg-sand-100">
              Volunteer
            </Link>
            <Link href="/get-involved" className="inline-flex items-center px-4 py-2 bg-white border border-sand-300 rounded text-sm font-semibold text-navy-900 hover:bg-sand-100">
              Partner
            </Link>
            <Link href="/get-involved" className="inline-flex items-center px-4 py-2 bg-white border border-sand-300 rounded text-sm font-semibold text-navy-900 hover:bg-sand-100">
              Contribute Resources
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-navy-900">Frequently asked questions</h2>
          <div className="space-y-4 text-sm text-navy-800">
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Receipts</p>
              <p className="mt-1">You will receive an email receipt after a confirmed payment.</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Recurring gifts</p>
              <p className="mt-1">Monthly giving uses the provider subscription feature. You will receive a secure link to cancel if needed.</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Cancelling</p>
              <p className="mt-1">Use the cancellation link provided or contact the team.</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Refunds</p>
              <p className="mt-1">Refund requests are reviewed by the finance team.</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Giving from abroad</p>
              <p className="mt-1">Paystack supports eligible international cards.</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-lg border border-sand-200">
              <p className="font-semibold text-navy-900">Privacy</p>
              <p className="mt-1">We collect only what is needed to process your gift and issue a receipt.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function DonationForm() {
  const [donationType, setDonationType] = React.useState<'once' | 'monthly'>('once');
  const [designation, setDesignation] = React.useState<'general' | 'ssi' | 'cs' | 'ce'>('general');
  const [amount, setAmount] = React.useState<number>(2000);
  const [customAmount, setCustomAmount] = React.useState('');
  const [useCustom, setUseCustom] = React.useState(false);
  const [donorName, setDonorName] = React.useState('');
  const [donorEmail, setDonorEmail] = React.useState('');
  const [donorPhone, setDonorPhone] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const suggested = [1000, 2000, 5000, 10000];

  const finalAmount = useCustom ? Number(customAmount || 0) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consentGiven) {
      setError('Please consent to the privacy notice.');
      return;
    }
    if (!donorEmail) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!finalAmount || finalAmount < 100 || finalAmount > 1000000) {
      setError('Amount must be between 100 and 1000000 Naira.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationType,
          amount: finalAmount,
          designation,
          donorName: isAnonymous ? '' : donorName,
          donorEmail,
          donorPhone,
          isAnonymous,
          note,
          consentGiven,
          paymentMethod: 'card',
          website_url_check: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start donation');
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      throw new Error('Payment initialization failed');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <p className="text-sm font-semibold text-navy-900 mb-2">Frequency</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDonationType('once')} className={`px-4 py-2 rounded text-sm font-semibold ${donationType === 'once' ? 'bg-navy-900 text-white' : 'bg-sand-100 text-navy-900 border border-sand-300'}`}>One time</button>
          <button type="button" onClick={() => setDonationType('monthly')} className={`px-4 py-2 rounded text-sm font-semibold ${donationType === 'monthly' ? 'bg-navy-900 text-white' : 'bg-sand-100 text-navy-900 border border-sand-300'}`}>Monthly</button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-navy-900 mb-2">Amount in Naira</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {suggested.map((s) => (
            <button key={s} type="button" onClick={() => { setUseCustom(false); setAmount(s); }} className={`px-3 py-2 rounded text-sm font-semibold ${!useCustom && amount === s ? 'bg-gold-500 text-navy-900' : 'bg-sand-100 text-navy-900 border border-sand-300'}`}>{s.toLocaleString()}</button>
          ))}
        </div>
        <button type="button" onClick={() => setUseCustom(true)} className={`px-3 py-2 rounded text-sm font-semibold mb-2 ${useCustom ? 'bg-gold-500 text-navy-900' : 'bg-sand-100 text-navy-900 border border-sand-300'}`}>Custom amount</button>
        {useCustom && (
          <input type="number" min="100" max="1000000" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" placeholder="Enter amount" />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-navy-900 mb-2">Designation</p>
        <select value={designation} onChange={(e) => setDesignation(e.target.value as any)} className="w-full px-3 py-2 border border-sand-300 rounded text-sm">
          <option value="general">General Fund</option>
          <option value="ssi">Secondary Schools Invasion</option>
          <option value="cs">Campus Sparking</option>
          <option value="ce">Community Enlightenment</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Name</label>
          <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} disabled={isAnonymous} className="w-full px-3 py-2 border border-sand-300 rounded text-sm disabled:bg-sand-100" />
        </div>
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Email *</label>
          <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-navy-900 block mb-1">Phone number (optional)</label>
          <input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="anon" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          <label htmlFor="anon" className="text-sm text-navy-900">Give anonymously</label>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-navy-900 block mb-1">Note to the team (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border border-sand-300 rounded text-sm" rows={3} />
      </div>

      <div className="flex items-start gap-2">
        <input id="consent" type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} required />
        <label htmlFor="consent" className="text-xs text-navy-800">I consent to the privacy notice and agree to be contacted about this gift if needed.</label>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-800 rounded">{error}</div>}

      <button type="submit" disabled={loading} className="w-full px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all disabled:opacity-60">
        {loading ? 'Processing...' : 'Give with Paystack'}
      </button>
      <p className="text-xs text-navy-600 text-center">Payments processed securely by Paystack. MindSpark servers do not store card details.</p>
    </form>
  );
}
