import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { Clock, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const db = getDatabase();
  const article = await db.prepare('SELECT title, excerpt, featured_image FROM articles WHERE slug = ? AND is_published = 1').get(params.slug) as any;

  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.featured_image }],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const db = getDatabase();
  const article = await db.prepare('SELECT * FROM articles WHERE slug = ? AND is_published = 1').get(params.slug) as any;

  if (!article) {
    notFound();
  }

  const related = await db.prepare('SELECT slug, title, category FROM articles WHERE slug != ? AND is_published = 1 LIMIT 2').all(params.slug) as any[];

  return (
    <PublicLayout>
      <article className="py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/insights"
              className="inline-flex items-center text-sm font-semibold text-navy-800 hover:text-gold-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to all insights</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="space-y-4 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-700 bg-sand-100 px-3 py-1 rounded-full border border-sand-300">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-navy-900 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs text-navy-600 pt-2 border-b border-sand-200 pb-6">
              <span>Author: <strong className="text-navy-900">{article.author_name}</strong></span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.reading_time_mins} minutes read</span>
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden mb-12 bg-navy-950 border border-sand-200">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Rich Content */}
          <div
            className="prose prose-lg max-w-none text-navy-800 leading-relaxed space-y-6 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-navy-900 [&>h2]:mt-8 [&>p]:text-base [&>p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Related Articles Footer */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-sand-200 space-y-4">
              <h3 className="text-lg font-bold font-serif text-navy-900">
                Related Reading
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/insights/${rel.slug}`}
                    className="p-4 rounded-xl bg-sand-50 border border-sand-200 hover:border-gold-500 transition-colors block"
                  >
                    <span className="text-xs uppercase font-semibold text-gold-700 block mb-1">
                      {rel.category}
                    </span>
                    <span className="text-sm font-bold text-navy-900 hover:text-gold-600 block">
                      {rel.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </PublicLayout>
  );
}
