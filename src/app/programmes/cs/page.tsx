import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { Calendar, Clock, MapPin, CheckCircle, ArrowRight, Compass, Award, Lightbulb, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Sparking | Beyond CGPA',
  description:
    'Campus Sparking transforms Nigerian undergraduates into skilled, competent, and purpose aligned students prepared for life after graduation.',
};

export default async function CampusSparkingPage() {
  const db = getDatabase();

  // Fetch approved published events only
  const confirmedEvents = await db.prepare(`
    SELECT * FROM events WHERE programme_slug = 'cs' AND status = 'APPROVED' ORDER BY start_time ASC
  `).all() as any[];

  const csGallery = await db.prepare(`
    SELECT * FROM gallery_items WHERE category = 'cs' AND is_published = 1 ORDER BY created_at ASC
  `).all() as any[];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Impact Vehicle 2: Tertiary Education
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Campus Sparking
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Beyond CGPA: Unlocking Skills, Purpose and Opportunities
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Transforms undergraduates into competent, skilled and purpose aligned students prepared for life, not just examinations. We shift students from certificate mentality to value mentality.
            </p>
          </div>
        </div>
      </section>

      {/* Core Message and Objectives */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy-900">
                Bridging Lecture Rooms and Societal Impact
              </h2>
              <p className="text-base text-navy-800 leading-relaxed">
                Campus Sparking equips tertiary undergraduates across universities and polytechnics to understand that academic certificates are merely tickets to the arena. The true determinant of post graduation relevance is personal value creation, problem solving competence, and ethical leadership.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-3 p-4 bg-sand-50 rounded-lg border border-sand-200">
                  <CheckCircle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Value Creation Mentality</h3>
                    <p className="text-xs text-navy-700 mt-1">Focusing on practical skills and real world problem solving over passive degree hunting.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-sand-50 rounded-lg border border-sand-200">
                  <Compass className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Purpose Alignment</h3>
                    <p className="text-xs text-navy-700 mt-1">Clarifying vision, personal strengths, and lifelong career pathways before final year.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-sand-50 rounded-lg border border-sand-200">
                  <Lightbulb className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Practical Skills</h3>
                    <p className="text-xs text-navy-700 mt-1">Connecting students to digital literacy, communication excellence, and trade tools.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-sand-50 rounded-lg border border-sand-200">
                  <Award className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Leadership Capability</h3>
                    <p className="text-xs text-navy-700 mt-1">Building moral courage, emotional resilience, and responsible civic conduct.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden shadow-md border border-sand-200 bg-navy-950">
                <div className="relative h-80 w-full">
                  <Image
                    src="/gallery/cs_fu_wukari_panoramic.jpg"
                    alt="Campus Sparking session at Federal University Wukari"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-sand-100 text-xs text-navy-700">
                  Verified convergence: Federal University Wukari, Taraba State.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bi Weekly Community Sessions */}
      <section className="py-20 bg-sand-100 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Sustained Mentorship
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">
              Bi Weekly Community Sessions
            </h2>
            <p className="text-base text-navy-700 leading-relaxed">
              Per the MindSpark Hub orientation framework, general sessions convene bi weekly on Saturdays from 10 AM to 12 PM at selected campus venues.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-sand-200 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 text-navy-900">
              <Users className="w-8 h-8 text-gold-600" />
              <div>
                <h3 className="text-xl font-bold font-serif text-navy-900">
                  Destiny and Life Coaching Convergence
                </h3>
                <p className="text-xs text-navy-600">Open to students of all religious and academic backgrounds</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-navy-800 leading-relaxed">
              These recurring sessions create a loving, free, and supportive community where undergraduates receive continuous life mentorship, sharpen their professional skills, and bring personal questions for counsel with experienced MindSpark agents. It is the convergence of students who seek wisdom to live impactful, dignified lives.
            </p>

            <div className="pt-4 border-t border-sand-200">
              <h4 className="text-sm font-bold uppercase tracking-wider text-navy-900 mb-4">
                Confirmed Upcoming Sessions
              </h4>
              {confirmedEvents.length === 0 ? (
                <p className="text-sm text-navy-600 italic">
                  Next session date and venue are currently being finalized by programme coordinators.
                </p>
              ) : (
                <div className="space-y-4">
                  {confirmedEvents.map((evt) => (
                    <div key={evt.id} className="p-4 rounded-lg bg-sand-50 border border-sand-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-base font-bold text-navy-900">{evt.title}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-navy-700">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gold-600" />
                            <span>{new Date(evt.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gold-600" />
                            <span>10 AM to 12 PM</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gold-600" />
                            <span>{evt.venue}</span>
                          </span>
                        </div>
                      </div>
                      <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
                        Confirmed and Approved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Authentic FU Wukari Gallery */}
      <section className="py-20 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Campus Field Documentation
            </span>
            <h2 className="text-3xl font-bold font-serif text-navy-900 mt-1">
              Federal University Wukari Outreaches
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {csGallery.map((img) => (
              <div key={img.id} className="bg-sand-50 rounded-lg overflow-hidden border border-sand-200 shadow-sm flex flex-col">
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

      {/* Closing Statement */}
      <section className="py-16 bg-navy-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            The MindSpark Standard
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            We are preparing graduates who are not just educated, but empowered.
          </h2>
          <div className="pt-2">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md"
            >
              <span>Join Campus Sparking</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
