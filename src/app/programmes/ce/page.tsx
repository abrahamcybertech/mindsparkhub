import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeartHandshake, Briefcase, Users, Activity, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Enlightenment | Grassroots Transformation',
  description:
    'Community Enlightenment promotes economic productivity, civic responsibility, and renewed purpose among adults and community members across Nigeria.',
};

export default function CommunityEnlightenmentPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Impact Vehicle 3: Community and Adult Citizens
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Community Enlightenment
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Awakening Productivity, Civic Responsibility and Renewed Purpose
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              The third core impact vehicle of MindSpark Hub, promoting positive grassroots transformation through enlightenment, economic initiative, and responsible citizenship.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience and Orientation Objectives */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy-900">
              Grassroots Civic Renewal
            </h2>
            <p className="text-base text-navy-800 leading-relaxed">
              Youth development cannot succeed in isolation from the homes and communities that nurture them. Community Enlightenment addresses working class adults, middle aged citizens, and senior community members, awakening an economic productivity mindset and reviving civic collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <Briefcase className="w-8 h-8 text-gold-600" />
              <h3 className="text-base font-bold font-serif text-navy-900">
                Economic Productivity
              </h3>
              <p className="text-sm text-navy-700">
                Awakening an entrepreneurial mindset, financial prudence, and productive economic enterprise at the community level.
              </p>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <Users className="w-8 h-8 text-gold-600" />
              <h3 className="text-base font-bold font-serif text-navy-900">
                Civic Responsibility
              </h3>
              <p className="text-sm text-navy-700">
                Promoting peaceful participation in local governance, lawfulness, and active contribution to national progress.
              </p>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <HeartHandshake className="w-8 h-8 text-gold-600" />
              <h3 className="text-base font-bold font-serif text-navy-900">
                Renewed Hope and Purpose
              </h3>
              <p className="text-sm text-navy-700">
                Overcoming widespread apathy and cynicism among adults through purpose discovery workshops and ethical encouragement.
              </p>
            </div>

            <div className="p-6 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
              <Activity className="w-8 h-8 text-gold-600" />
              <h3 className="text-base font-bold font-serif text-navy-900">
                Health Awareness
              </h3>
              <p className="text-sm text-navy-700">
                Conducting preventive health campaigns, basic wellness education, and communal welfare interventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Engagement Framework */}
      <section className="py-20 bg-sand-100 border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy-900">
              Grassroots Educational Initiatives
            </h2>
            <p className="text-base text-navy-700 max-w-2xl mx-auto">
              MindSpark Hub collaborates with community associations, artisans, and family leaders to bring structured workshops on personal transformation.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-sand-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-navy-900">
              Community Food Bank and Welfare Interventions
            </h3>
            <p className="text-sm text-navy-800 leading-relaxed">
              In conjunction with the MindSpark Welfare Unit, Community Enlightenment facilitates donation drives where food, clothing, and learning materials are gathered and responsibly distributed to vulnerable families and indigent students within host communities.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-navy-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-bold font-serif text-white">
            Partner on Community Outreaches
          </h2>
          <p className="text-base text-navy-200">
            Community leaders, healthcare professionals, and civic organisations can collaborate with MindSpark Hub on verified local enlightenment initiatives.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md"
            >
              <span>Connect with Our Team</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
