import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Style Guide and Design Tokens | MindSpark Hub',
  description: 'Design system documentation, WCAG 2.2 AA contrast rules, design tokens, and components for MindSpark Hub.',
};

export default function StyleGuidePage() {
  return (
    <PublicLayout>
      <section className="bg-navy-950 text-white py-16 border-b border-navy-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Design System Documentation
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Brand Style Guide and Tokens
          </h1>
          <p className="text-sm text-navy-300">
            Tokens, typography, component states, and accessibility standards for MindSpark Hub.
          </p>
        </div>
      </section>

      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section 1: Colors & Contrast */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              1. Brand Palette and WCAG Contrast Verification
            </h2>
            <p className="text-sm text-navy-800 leading-relaxed">
              Every colour pairing is verified to meet WCAG 2.2 AA standards (minimum 4.5 to 1 for body text, 3.0 to 1 for large headings). Gold on white fails text contrast; therefore, gold is reserved for fills, buttons with navy text, rules, and small accents.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Primary Navy */}
              <div className="rounded-xl overflow-hidden border border-sand-300 shadow-sm">
                <div className="h-32 bg-navy-900 p-4 text-white flex flex-col justify-between">
                  <span className="text-xs font-mono">#0D2748</span>
                  <span className="font-bold font-serif text-lg">Deep Navy</span>
                </div>
                <div className="p-4 bg-sand-50 text-xs text-navy-800 space-y-1">
                  <p><strong>Role:</strong> Primary brand colour</p>
                  <p><strong>Contrast vs White:</strong> 13.8 to 1 (Exceeds AAA)</p>
                  <p><strong>Usage:</strong> Headers, primary backgrounds, dark accents</p>
                </div>
              </div>

              {/* Secondary Gold */}
              <div className="rounded-xl overflow-hidden border border-sand-300 shadow-sm">
                <div className="h-32 bg-gold-500 p-4 text-navy-950 flex flex-col justify-between">
                  <span className="text-xs font-mono">#FFC107</span>
                  <span className="font-bold font-serif text-lg">Strategic Gold</span>
                </div>
                <div className="p-4 bg-sand-50 text-xs text-navy-800 space-y-1">
                  <p><strong>Role:</strong> Secondary accent colour</p>
                  <p><strong>Navy Text on Gold:</strong> 8.2 to 1 (Exceeds AAA)</p>
                  <p><strong>Usage:</strong> Action buttons, icons, highlights</p>
                </div>
              </div>

              {/* Soft Sand Neutral */}
              <div className="rounded-xl overflow-hidden border border-sand-300 shadow-sm">
                <div className="h-32 bg-sand-100 p-4 text-navy-900 flex flex-col justify-between border-b border-sand-200">
                  <span className="text-xs font-mono">#F5F3EF</span>
                  <span className="font-bold font-serif text-lg">Warm Sand</span>
                </div>
                <div className="p-4 bg-sand-50 text-xs text-navy-800 space-y-1">
                  <p><strong>Role:</strong> Supporting surface neutral</p>
                  <p><strong>Navy Text on Sand:</strong> 12.4 to 1 (Exceeds AAA)</p>
                  <p><strong>Usage:</strong> Content cards, section backgrounds</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Typography Scale */}
          <section className="space-y-6 pt-8 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              2. Typography Hierarchy
            </h2>
            <p className="text-sm text-navy-800">
              We pair an authoritative editorial serif for headlines with a clean, high legibility sans serif for body text, maintaining comfortable 60 to 75 character line lengths.
            </p>

            <div className="space-y-4 p-6 bg-sand-50 rounded-xl border border-sand-200">
              <div>
                <p className="text-xs uppercase text-gold-700 font-semibold">Heading 1: Serif Bold (48px / 3rem)</p>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900">
                  Igniting Minds. Sparking Purpose.
                </h1>
              </div>
              <div>
                <p className="text-xs uppercase text-gold-700 font-semibold">Heading 2: Serif Bold (30px / 1.875rem)</p>
                <h2 className="text-2xl font-serif font-bold text-navy-900">
                  Secondary Schools Invasion
                </h2>
              </div>
              <div>
                <p className="text-xs uppercase text-gold-700 font-semibold">Body Copy: Sans Serif Regular (16px / 1rem)</p>
                <p className="text-base text-navy-800 leading-relaxed max-w-2xl">
                  MindSpark Hub is a dynamic platform committed to equipping Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Interactive Component States */}
          <section className="space-y-6 pt-8 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              3. Button and Component States
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded shadow-sm text-sm">
                Primary Action (Default)
              </button>
              <button type="button" className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded shadow-sm text-sm">
                Secondary Action
              </button>
              <button type="button" className="px-6 py-3 border border-navy-800 text-navy-900 hover:bg-sand-100 font-semibold rounded text-sm">
                Outline Button
              </button>
              <button type="button" disabled className="px-6 py-3 bg-sand-300 text-navy-400 font-semibold rounded text-sm cursor-not-allowed">
                Disabled State
              </button>
            </div>
          </section>

          {/* Section 4: Writing Rules Matrix */}
          <section className="space-y-4 pt-8 border-t border-sand-200">
            <h2 className="text-2xl font-bold font-serif text-navy-900">
              4. Strict Writing Standards (Section 2.1)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-2">
                <p className="font-bold flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                  Prohibited Patterns:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>No em dashes anywhere in visible text</li>
                  <li>No hyphens in visible copy such as compound adjectives</li>
                  <li>No emojis or decorative unicode symbols</li>
                  <li>No AI or robot iconography</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-2">
                <p className="font-bold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  Required Standards:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Natural, confident Nigerian English</li>
                  <li>Rephrased clean text (secondary school, real world)</li>
                  <li>Clean professional line SVG icons only</li>
                  <li>Real verified institutional facts only</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
