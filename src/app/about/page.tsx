import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | MindSpark Hub',
  description:
    'Learn about MindSpark Hub, our mission, vision, philosophy, and structured institutional approach to transforming lives across Nigeria.',
};

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              About MindSpark Hub
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              An Institution for National Transformation
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              We spark growth and ignite Mindset.
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-bold font-serif text-navy-900">
                Who We Are
              </h2>
              <div className="w-16 h-1 bg-gold-500 rounded" />
              <p className="text-base text-navy-800 leading-relaxed">
                MindSpark Hub is a dynamic youth development, mentorship, enlightenment, and personal transformation organisation. Established in Wukari, Taraba State, the platform exists to raise a generation of Nigerians who excel academically, innovate practically, develop in demand skills, demonstrate unwavering character, and contribute positively to national development.
              </p>
              <p className="text-base text-navy-800 leading-relaxed">
                We operate not as a temporary initiative, but as a structured institution. Through clear governance, specialised functional units, and dedicated volunteer field agents, we translate bold ideas into transformative realities in classrooms, campuses, and communities.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="p-8 bg-sand-50 rounded-2xl border border-sand-200 space-y-6 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                    Our Motto
                  </p>
                  <p className="text-xl font-serif font-bold text-navy-900 mt-1">
                    We spark growth and ignite Mindset.
                  </p>
                </div>
                <div className="pt-4 border-t border-sand-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                    Our Philosophy
                  </p>
                  <p className="text-base font-serif text-navy-800 mt-1 leading-relaxed">
                    Igniting minds, sparking purpose, and transforming lives across classrooms, campuses, and communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Deep Dive */}
      <section className="py-20 bg-sand-100 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-sand-200 space-y-4">
              <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                Institutional Vision
              </span>
              <h3 className="text-2xl font-bold font-serif text-navy-900">
                Building a Nation of Excellence
              </h3>
              <p className="text-base text-navy-800 leading-relaxed">
                To build a Nigeria where citizens excel, innovate and lead positive change. We envision a society where youth reject mediocrity and cultivate the discipline required to stand on global stages.
              </p>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-sand-200 space-y-4">
              <span className="text-xs font-semibold uppercase text-gold-700 tracking-wider">
                Institutional Mission
              </span>
              <h3 className="text-2xl font-bold font-serif text-navy-900">
                Strategic Nationwide Engagement
              </h3>
              <p className="text-base text-navy-800 leading-relaxed">
                Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions, practical workshops, and sustained mentorship relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Vehicles Overview */}
      <section className="py-20 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Structured Operations
            </span>
            <h2 className="text-3xl font-bold font-serif text-navy-900">
              Three Vehicles Reaching Every Stage of Life
            </h2>
            <p className="text-base text-navy-700">
              Our interventions are tailored specifically to address the psychological and practical needs of each demographic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <h3 className="text-lg font-bold font-serif text-navy-900">
                1. Secondary Schools Invasion
              </h3>
              <p className="text-xs text-gold-700 font-semibold uppercase">Target: Teenagers</p>
              <p className="text-sm text-navy-800 leading-relaxed">
                Rebuilding student mindsets, instilling academic productivity, teaching early trade skills, and rejecting anti social vice lifestyles before doubt sets in.
              </p>
              <Link href="/programmes/ssi" className="inline-flex items-center text-xs font-bold text-navy-900 hover:text-gold-600 pt-2">
                <span>Explore SSI</span>
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <h3 className="text-lg font-bold font-serif text-navy-900">
                2. Campus Sparking
              </h3>
              <p className="text-xs text-gold-700 font-semibold uppercase">Target: Undergraduates</p>
              <p className="text-sm text-navy-800 leading-relaxed">
                Shifting university and polytechnic students from certificate mentality to value creation, fostering practical skills, purpose discovery, and career preparedness.
              </p>
              <Link href="/programmes/cs" className="inline-flex items-center text-xs font-bold text-navy-900 hover:text-gold-600 pt-2">
                <span>Explore Campus Sparking</span>
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <h3 className="text-lg font-bold font-serif text-navy-900">
                3. Community Enlightenment
              </h3>
              <p className="text-xs text-gold-700 font-semibold uppercase">Target: Adults and Families</p>
              <p className="text-sm text-navy-800 leading-relaxed">
                Awakening local economic productivity, civic responsibility, health awareness outreaches, and renewed hope among working class adults and elders.
              </p>
              <Link href="/programmes/ce" className="inline-flex items-center text-xs font-bold text-navy-900 hover:text-gold-600 pt-2">
                <span>Explore Community Enlightenment</span>
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Structure Callout */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                Governance and Responsibility
              </span>
              <h2 className="text-3xl font-bold font-serif text-white">
                Our Eight Functional Units and Executive Leadership
              </h2>
              <p className="text-base text-navy-200 leading-relaxed max-w-2xl">
                MindSpark Hub executes its mission through eight specialised functional advocacy units, supported by the Hub Secretariat and the Financial Department, led by our Executive Council.
              </p>
            </div>
            <div className="lg:col-span-4 text-left lg:text-right">
              <Link
                href="/structure"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md"
              >
                <span>View Full Structure</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
