import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insights and Resources | MindSpark Hub',
  description:
    'Educational articles, academic guidance, skills acquisition resources, and transformation stories from MindSpark Hub.',
};

export const revalidate = 60;

export default async function InsightsPage() {
  const db = getDatabase();
  const articles = await db.prepare(`
    SELECT id, slug, title, excerpt, author_name, category, featured_image, reading_time_mins, published_at
    FROM articles WHERE is_published = 1 ORDER BY published_at DESC
  `).all() as any[];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Editorial Publications
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              MindSpark Insights
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Where every word lights a fire.
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              Thought leadership, academic productivity methods, skills frameworks, and character lessons curated by our Communication and Editorial Unit.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Listing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-sand-50 rounded-2xl overflow-hidden border border-sand-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative h-56 w-full bg-navy-950">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-navy-600">
                      <span className="font-semibold uppercase tracking-wider text-gold-700">
                        {article.category}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.reading_time_mins} min read</span>
                      </span>
                    </div>

                    <h2 className="text-xl font-bold font-serif text-navy-900 leading-snug hover:text-gold-600 transition-colors">
                      <Link href={`/insights/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-navy-800 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-sand-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-navy-700">
                    By {article.author_name}
                  </span>
                  <Link
                    href={`/insights/${article.slug}`}
                    className="inline-flex items-center text-xs font-bold text-navy-900 hover:text-gold-600"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="ml-1 w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
