import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { BookOpen, Wrench, Shield, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secondary Schools Invasion | Catch Them Young',
  description:
    'Secondary Schools Invasion influences teenagers early, rebuilding mindsets and instilling vision across Nigerian secondary schools.',
};

export default async function SSIPage() {
  const db = getDatabase();
  const ssiGallery = await db.prepare(`
    SELECT * FROM gallery_items WHERE category = 'ssi' AND is_published = 1 ORDER BY created_at ASC
  `).all() as any[];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Impact Vehicle 1: Secondary Education
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Secondary Schools Invasion
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Catch Them Young. Shape Them Early.
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Designed to influence teenagers at a critical stage of development, raising young Nigerians who are confident, disciplined, purpose driven, morally sound, skilful and academically intentional.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy and Theme */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy-900">
                Early Mindset Transformation
              </h2>
              <p className="text-base text-navy-800 leading-relaxed">
                Secondary Schools Invasion rebuilds student mindsets early, instils vision before confusion sets in, and plants seeds of greatness before the world plants doubt. It teaches character, leadership, entrepreneurial awareness, and academic excellence, empowering teenagers to see far beyond limitations and regional boundaries.
              </p>
              <div className="p-6 bg-sand-50 rounded-xl border-l-4 border-gold-500 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                  Curriculum Outreach Theme
                </p>
                <p className="text-lg font-serif font-bold text-navy-900">
                  Empowering Northern Secondary Schools Students on the Values of Academic Excellence, Skills Acquisition and Anti Social Vice Lifestyles.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden shadow-md border border-sand-200">
                <div className="relative h-72 w-full bg-navy-900">
                  <Image
                    src="/gallery/ssi_fgc_wukari_panoramic.jpg"
                    alt="Panoramic view of students at Federal Government College Wukari"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-sand-100 text-xs text-navy-700">
                  Documented outreach: Federal Government College Wukari, Taraba State.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Seminar Sessions */}
      <section className="py-20 bg-sand-100 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Structured Seminar Curriculum
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">
              Three Core Seminar Sessions
            </h2>
            <p className="text-base text-navy-700">
              Every Secondary Schools Invasion seminar delivers three rigorous educational modules led by trained MindSpark facilitators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Session 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                Session 1
              </span>
              <h3 className="text-xl font-bold font-serif text-navy-900">
                Academic Excellence
              </h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Covers greatness despite regional barriers and limitations, practical learning approaches, academic productivity, daily study discipline, and testimonials of academic breakthrough.
              </p>
              <ul className="space-y-2 text-xs text-navy-700 pt-2 border-t border-sand-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Strategic study habits and time allocation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Overcoming examination fear and mediocrity</span>
                </li>
              </ul>
            </div>

            {/* Session 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center font-bold">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                Session 2
              </span>
              <h3 className="text-xl font-bold font-serif text-navy-900">
                Skills Acquisition
              </h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Addresses why practical skills matter in secondary school, lifelong competence, early digital literacy, problem solving, personal development, and basic innovation.
              </p>
              <ul className="space-y-2 text-xs text-navy-700 pt-2 border-t border-sand-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Digital literacy fundamentals for teenagers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Connecting classroom learning to practical trades</span>
                </li>
              </ul>
            </div>

            {/* Session 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                Session 3
              </span>
              <h3 className="text-xl font-bold font-serif text-navy-900">
                Anti Social Vices
              </h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                Examines the irreversible damage of social vices on promising futures, providing clear educational materials, refusal skills, and responsible guidance on prevention.
              </p>
              <ul className="space-y-2 text-xs text-navy-700 pt-2 border-t border-sand-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Resisting negative peer pressure and cultism</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Preserving sexual purity and moral dignity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Engagement and Conclusion */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy-900">
              Interactive Engagement and Alignment
            </h2>
            <p className="text-base text-navy-800 max-w-2xl mx-auto">
              Each invasion concludes with an open question and answer dialogue where students engage experienced MindSpark agents directly, asking pressing questions about life, academics, and personal struggles.
            </p>
          </div>

          <div className="bg-navy-900 text-white p-8 rounded-xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              The MindSpark Conviction
            </p>
            <p className="text-xl sm:text-2xl font-serif font-bold text-white max-w-2xl mx-auto">
              Secondary Schools Invasion is not just school outreach. It is destiny alignment at an early stage.
            </p>
            <p className="text-sm text-navy-300 max-w-xl mx-auto">
              Every session culminates with the official MindSpark Hub chant, inspiring calls to embrace a transformed lifestyle, and closing prayers for the student body.
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated Gallery of Verified SSI Activities */}
      <section className="py-20 bg-sand-50 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Safeguarded Field Documentation
              </p>
              <h2 className="text-3xl font-bold font-serif text-navy-900 mt-1">
                Verified Secondary School Outreaches
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded mt-3 sm:mt-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Minor Safeguarding Consent Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ssiGallery.map((img) => (
              <div key={img.id} className="bg-white rounded-lg overflow-hidden border border-sand-200 shadow-sm flex flex-col">
                <div className="relative h-64 w-full bg-navy-950">
                  <Image
                    src={img.image_url}
                    alt={img.alt_text}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-base font-bold font-serif text-navy-900">
                      {img.title}
                    </h3>
                    <p className="text-xs text-navy-600 mt-1">
                      {img.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-navy-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-bold font-serif text-white">
            Host a Secondary Schools Invasion at Your College
          </h2>
          <p className="text-base text-navy-200">
            School principals, administrators, and educational authorities can invite the MindSpark Hub team to empower their student body.
          </p>
          <div className="pt-2">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md"
            >
              <span>Submit Outreach Request</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
