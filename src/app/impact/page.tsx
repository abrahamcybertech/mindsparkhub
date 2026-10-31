'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Lightbox, GalleryImage } from '@/components/gallery/Lightbox';
import { ShieldCheck, Filter } from 'lucide-react';

export default function ImpactPage() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production/client hydration, fetch verified published gallery
    fetch('/api/admin/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        const pub = (data.items || []).filter((i: any) => i.is_published === 1);
        setItems(pub);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default verified static list if fetch fails or unauthenticated
        setItems([
          {
            id: 'gal_ssi_fgc_pano',
            title: 'SSI 1.0 Assembly at Federal Government College Wukari',
            caption: 'Full assembly hall during Secondary Schools Invasion 1.0 at Federal Government College Wukari, Taraba State.',
            alt_text: 'Panoramic view of students gathered in the assembly hall at Federal Government College Wukari',
            category: 'ssi',
            image_url: '/gallery/ssi_fgc_wukari_panoramic.jpg',
            is_minor_depicted: 1,
            consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
          },
          {
            id: 'gal_ssi_agents',
            title: 'MindSpark Agents Deborah and Anna',
            caption: 'MindSpark Hub field agents engaging students on character discipline and academic excellence.',
            alt_text: 'MindSpark Hub agents Deborah and Anna addressing students during school seminar session',
            category: 'ssi',
            image_url: '/gallery/ssi_agents_deborah_anna.jpg',
            is_minor_depicted: 0,
          },
          {
            id: 'gal_ssi_godwin',
            title: 'MindSpark Agent Godwin Addressing Assembly',
            caption: 'MindSpark Agent Godwin facilitating the practical skills and personal development session.',
            alt_text: 'MindSpark Agent Godwin standing before students facilitating learning session',
            category: 'ssi',
            image_url: '/gallery/ssi_agent_godwin.jpg',
            is_minor_depicted: 0,
          },
          {
            id: 'gal_ssi_interact1',
            title: 'Interactive Dialogue at FGC Wukari',
            caption: 'Students asking thought provoking questions during the interactive dialogue session.',
            alt_text: 'Students participating enthusiastically in question and answer dialogue',
            category: 'ssi',
            image_url: '/gallery/ssi_interactive_session_1.jpg',
            is_minor_depicted: 1,
            consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
          },
          {
            id: 'gal_ssi_interact2',
            title: 'Rejecting Anti Social Vices Seminar',
            caption: 'Secondary school students participating in the anti social vices educational session.',
            alt_text: 'Secondary school students listening intently during anti social vices seminar',
            category: 'ssi',
            image_url: '/gallery/ssi_interactive_session_2.jpg',
            is_minor_depicted: 1,
            consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
          },
          {
            id: 'gal_ssi_hall',
            title: 'Full Assembly Engagement at FGC Wukari',
            caption: 'Students and teachers gathered for the closing session and MindSpark Hub chant.',
            alt_text: 'Large student body seated attentively during MindSpark Hub school invasion',
            category: 'ssi',
            image_url: '/gallery/ssi_hall_assembly.jpg',
            is_minor_depicted: 1,
            consent_reference: 'FGCW-SSI1-INST-CONSENT-VERIFIED',
          },
          {
            id: 'gal_cs_fuw_pano',
            title: 'Campus Sparking at Federal University Wukari',
            caption: 'Panoramic view of undergraduate students gathered for Campus Sparking.',
            alt_text: 'Undergraduate students seated in university lecture hall during Campus Sparking',
            category: 'cs',
            image_url: '/gallery/cs_fu_wukari_panoramic.jpg',
            is_minor_depicted: 0,
          },
          {
            id: 'gal_cs_lecture',
            title: 'Beyond CGPA Seminar Session at FU Wukari',
            caption: 'Undergraduates exploring practical skills and value creation mentality.',
            alt_text: 'University students listening intently to presentation on skills and career preparedness',
            category: 'cs',
            image_url: '/gallery/cs_lecture_hall_session.jpg',
            is_minor_depicted: 0,
          },
          {
            id: 'gal_cs_convergence',
            title: 'Participants Convergence and Mentorship',
            caption: 'Campus Sparking participants convening for small group mentorship and purpose alignment.',
            alt_text: 'Undergraduate participants engaged in community mentorship dialogue',
            category: 'cs',
            image_url: '/gallery/cs_participants_convergence.jpg',
            is_minor_depicted: 0,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', label: 'All Documented Moments' },
    { id: 'ssi', label: 'Secondary Schools Invasion' },
    { id: 'cs', label: 'Campus Sparking' },
  ];

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Field Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Our Documented Impact
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Authentic Moments of Transformation
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Every photograph below represents a verified outreach moment from our Secondary Schools Invasion 1.0 at Federal Government College Wukari and Campus Sparking at Federal University Wukari.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Safeguarding Banner */}
      <section className="py-8 bg-sand-100 border-b border-sand-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0" role="tablist">
              <Filter className="w-4 h-4 text-navy-700 mr-1 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-white text-navy-700 hover:bg-sand-200 border border-sand-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Safeguarding notice */}
            <div className="flex items-center space-x-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Documented minor consent verified on all secondary school imagery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse bg-sand-200 rounded-xl h-72 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-navy-600">No images found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(index)}
                  className="group cursor-pointer bg-sand-50 rounded-2xl overflow-hidden border border-sand-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  tabIndex={0}
                  role="button"
                  aria-label={`Open photo: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                >
                  <div className="relative h-72 w-full bg-navy-950 overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.alt_text}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-transparent transition-colors" />
                    {item.is_minor_depicted === 1 && (
                      <div className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-sm text-emerald-400 p-1.5 rounded-full shadow">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gold-700 block mb-1">
                        {item.category.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-bold font-serif text-navy-900 group-hover:text-gold-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-navy-700 mt-2 line-clamp-2">
                        {item.caption}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-navy-900 mt-4 inline-block group-hover:underline">
                      Click to view in high resolution
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Accessible Fullscreen Lightbox Modal */}
      <Lightbox
        images={filteredItems}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </PublicLayout>
  );
}
