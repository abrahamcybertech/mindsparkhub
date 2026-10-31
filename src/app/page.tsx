import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { ArrowRight, BookOpen, Wrench, Shield, Compass, HeartHandshake, Award, Sparkles } from 'lucide-react';

export const revalidate = 60; // Refresh every 60 seconds

export default async function HomePage() {
  const db = getDatabase();
  const galleryItems = await db.prepare(`
    SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY created_at DESC LIMIT 6
  `).all() as any[];

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="relative bg-navy-950 text-white overflow-hidden py-16 lg:py-24 border-b border-navy-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFC107_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-900 border border-gold-500/40 text-xs font-semibold text-gold-400 uppercase tracking-wider">
                <span>Youth Development and Enlightenment</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white leading-tight">
                Igniting Minds. <br />
                <span className="text-gold-500">Sparking Purpose.</span> <br />
                Transforming Lives.
              </h1>
              <p className="text-lg sm:text-xl text-navy-200 leading-relaxed max-w-2xl">
                MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Link
                  href="/impact"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                >
                  <span>Discover Our Impact</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/programmes/ssi"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                >
                  Explore Our Programmes
                </Link>
              </div>
            </div>

            {/* Authentic Photograph from Real Mentorship Outreach */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-navy-800 bg-navy-900">
                <div className="relative h-80 sm:h-96 w-full">
                  <Image
                    src="/gallery/ssi_fgc_wukari_panoramic.jpg"
                    alt="Students gathered at Federal Government College Wukari during MindSpark Hub outreach"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-4 bg-navy-900 border-t border-navy-800">
                  <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                    Verified Outreach In Action
                  </p>
                  <p className="text-sm text-navy-200 mt-1">
                    Secondary Schools Invasion 1.0 assembly at Federal Government College Wukari, Taraba State.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Introduction Section */}
      <section className="py-16 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold font-serif text-navy-900">
              Where Every Word Lights a Fire
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded" />
            <p className="text-lg text-navy-800 leading-relaxed pt-2">
              We believe that genuine transformation begins with the mind. Through rigorous mentorship, practical skills training, moral discipline, and academic empowerment, MindSpark Hub mobilises young minds across Nigeria to reject complacency and embrace purpose.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Vision and Mission Grid */}
      <section className="py-16 bg-sand-100 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center font-bold text-xl">
                V
              </div>
              <h3 className="text-2xl font-bold font-serif text-navy-900">
                Our Vision
              </h3>
              <p className="text-base text-navy-800 leading-relaxed">
                To build a Nigeria where citizens excel, innovate and lead positive change.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-xl">
                M
              </div>
              <h3 className="text-2xl font-bold font-serif text-navy-900">
                Our Mission
              </h3>
              <p className="text-base text-navy-800 leading-relaxed">
                Strategically reaching out to and engaging Nigerians across all 36 states through enlightening and transformative seminar sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Impact Vehicles */}
      <section className="py-20 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Strategic Vehicles
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">
              Our Three Impact Vehicles
            </h2>
            <p className="text-base text-navy-700">
              MindSpark Hub operates through three dedicated vehicles structured to address key developmental stages across Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SSI Card */}
            <div className="flex flex-col bg-sand-50 rounded-xl overflow-hidden border border-sand-200 hover:shadow-md transition-shadow">
              <div className="relative h-56 w-full bg-navy-950">
                <Image
                  src="/gallery/ssi_students_engagement.jpg"
                  alt="Secondary school students participating in invasion seminar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gold-700 uppercase tracking-wider">
                    Vehicle 1: Teenagers
                  </span>
                  <h3 className="text-xl font-bold font-serif text-navy-900">
                    Secondary Schools Invasion
                  </h3>
                  <p className="text-sm font-medium text-navy-600">
                    Catch Them Young. Shape Them Early.
                  </p>
                  <p className="text-sm text-navy-800 leading-relaxed">
                    Designed to influence teenagers early, rebuild mindsets, instil vision before confusion sets in, and plant seeds of greatness before doubt takes root.
                  </p>
                </div>
                <Link
                  href="/programmes/ssi"
                  className="inline-flex items-center text-sm font-semibold text-navy-900 hover:text-gold-600 pt-2"
                >
                  <span>Learn about SSI</span>
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Campus Sparking Card */}
            <div className="flex flex-col bg-sand-50 rounded-xl overflow-hidden border border-sand-200 hover:shadow-md transition-shadow">
              <div className="relative h-56 w-full bg-navy-950">
                <Image
                  src="/gallery/cs_fu_wukari_panoramic.jpg"
                  alt="Undergraduates during Campus Sparking at Federal University Wukari"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gold-700 uppercase tracking-wider">
                    Vehicle 2: Undergraduates
                  </span>
                  <h3 className="text-xl font-bold font-serif text-navy-900">
                    Campus Sparking
                  </h3>
                  <p className="text-sm font-medium text-navy-600">
                    Beyond CGPA: Unlocking Skills and Opportunities
                  </p>
                  <p className="text-sm text-navy-800 leading-relaxed">
                    Transforms undergraduates into competent, skilled, and purpose aligned students prepared for real impact, shifting minds from certificates to value creation.
                  </p>
                </div>
                <Link
                  href="/programmes/cs"
                  className="inline-flex items-center text-sm font-semibold text-navy-900 hover:text-gold-600 pt-2"
                >
                  <span>Learn about Campus Sparking</span>
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Community Enlightenment Card */}
            <div className="flex flex-col bg-sand-50 rounded-xl overflow-hidden border border-sand-200 hover:shadow-md transition-shadow">
              <div className="relative h-56 w-full bg-navy-900 flex items-center justify-center p-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gold-300 font-semibold uppercase">Community Impact</p>
                  <p className="text-sm text-navy-200 font-medium">Grassroots Enlightenment</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gold-700 uppercase tracking-wider">
                    Vehicle 3: Adults and Communities
                  </span>
                  <h3 className="text-xl font-bold font-serif text-navy-900">
                    Community Enlightenment
                  </h3>
                  <p className="text-sm font-medium text-navy-600">
                    Economic Productivity and Civic Responsibility
                  </p>
                  <p className="text-sm text-navy-800 leading-relaxed">
                    Reaches working class adults and middle aged citizens, awakening economic productivity, renewing purpose, and promoting civic participation.
                  </p>
                </div>
                <Link
                  href="/programmes/ce"
                  className="inline-flex items-center text-sm font-semibold text-navy-900 hover:text-gold-600 pt-2"
                >
                  <span>Learn about Community Enlightenment</span>
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Approach: 7 Pillars */}
      <section className="py-20 bg-navy-900 text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Transformation Framework
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              Our Comprehensive Approach
            </h2>
            <p className="text-base text-navy-200">
              Holistic personal transformation requires simultaneous growth across intellectual, practical, moral, and communal dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <BookOpen className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Academic Excellence</h3>
              <p className="text-sm text-navy-300">
                Promoting structured study discipline, productivity tools, and intellectual curiosity to overcome limitations.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <Wrench className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Skills Acquisition</h3>
              <p className="text-sm text-navy-300">
                Equipping young Nigerians with in demand practical skills, digital literacy, and entrepreneurial competence early.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <Shield className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Character Development</h3>
              <p className="text-sm text-navy-300">
                Instilling moral integrity, personal dignity, and the courage to firmly reject anti social vice lifestyles.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <Award className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Leadership Development</h3>
              <p className="text-sm text-navy-300">
                Training disciplined young leaders who take personal responsibility and influence their peers positively.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <Compass className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Purpose Discovery</h3>
              <p className="text-sm text-navy-300">
                Guiding students from confusion into clear life vision and destiny alignment before doubt takes root.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3">
              <Sparkles className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Moral and Spiritual Growth</h3>
              <p className="text-sm text-navy-300">
                Fostering reverence, spiritual consciousness, and genuine Christlike character in everyday conduct.
              </p>
            </div>

            <div className="bg-navy-950/80 p-6 rounded-lg border border-navy-800 space-y-3 sm:col-span-2 lg:col-span-2">
              <HeartHandshake className="w-8 h-8 text-gold-500" />
              <h3 className="text-lg font-bold font-serif text-white">Community Responsibility</h3>
              <p className="text-sm text-navy-300">
                Inspiring active citizenship, local community service, mutual welfare support, and dedication to national progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Documented Impact Gallery Showcase */}
      <section className="py-20 bg-sand-50 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Authentic Verification
              </p>
              <h2 className="text-3xl font-bold font-serif text-navy-900 mt-2">
                Documented Field Impact
              </h2>
              <p className="text-base text-navy-700 mt-2">
                Real moments from verified outreaches at Federal Government College Wukari and Federal University Wukari.
              </p>
            </div>
            <Link
              href="/impact"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-navy-900 hover:text-gold-600"
            >
              <span>View full gallery</span>
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden border border-sand-200 shadow-sm flex flex-col">
                <div className="relative h-64 w-full bg-navy-950">
                  <Image
                    src={item.image_url}
                    alt={item.alt_text}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-xs font-semibold text-gold-700 uppercase">
                      {item.category.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold font-serif text-navy-900 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-navy-600 mt-1">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Closing Call to Action */}
      <section className="py-20 bg-navy-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white">
            The future is not waiting. <br />
            <span className="text-gold-500">We are building it.</span>
          </h2>
          <p className="text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Join a structured generation of Nigerians committed to excellence, character, and societal transformation. Partner with us, volunteer as a mentor, or participate in upcoming programmes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/get-involved"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-md"
            >
              Get Involved With Us
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded transition-all"
            >
              Contact Our Secretariat
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
