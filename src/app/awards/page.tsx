import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { SITE } from '@/content/public';

export const metadata: Metadata = {
  title: 'Honors and Awards | MindSpark Hub',
  description:
    'Celebrating individuals, mentors, students, and partner institutions recognized by MindSpark Hub for distinguished contributions to youth enlightenment and academic excellence.',
};

export const dynamic = 'force-dynamic';

interface AwardRow {
  id: string;
  recipient_name: string;
  award_title: string;
  category: string;
  year: number;
  citation: string;
  image_url: string | null;
  order_index: number;
}

export default async function AwardsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const selectedCategory = searchParams?.category || 'ALL';
  const db = getDatabase();

  const allCategories = (
    await db.prepare('SELECT DISTINCT category FROM awards ORDER BY category ASC').all()
  ) as { category: string }[];

  let query = 'SELECT * FROM awards WHERE 1=1';
  const params: any[] = [];

  if (selectedCategory !== 'ALL') {
    query += ' AND category = ?';
    params.push(selectedCategory);
  }

  query += ' ORDER BY year DESC, order_index ASC, created_at DESC';

  const awards = (await db.prepare(query).all(...params)) as AwardRow[];

  return (
    <div className="bg-sand-50 min-h-screen">
      {/* Hero Header */}
      <section className="bg-navy-900 text-white py-16 sm:py-24 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-950 border border-gold-500/30 px-3 py-1 rounded-full inline-block">
              Institutional Recognition
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
              MindSpark Honors and Awards
            </h1>
            <p className="text-lg sm:text-xl text-gold-400 font-serif">
              We spark growth and ignite Mindset.
            </p>
            <p className="text-navy-200 text-base sm:text-lg leading-relaxed pt-2">
              Recognizing dedicated educators, field mentors, student ambassadors, and community partners whose commitment to moral discipline, intellectual rigor, and youth enlightenment drives national transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pb-8 border-b border-sand-200">
          <Link
            href="/awards"
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white text-navy-800 hover:bg-sand-200 border border-sand-300'
            }`}
          >
            All Categories
          </Link>
          {allCategories.map((cat) => (
            <Link
              key={cat.category}
              href={`/awards?category=${encodeURIComponent(cat.category)}`}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.category
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-white text-navy-800 hover:bg-sand-200 border border-sand-300'
              }`}
            >
              {cat.category}
            </Link>
          ))}
        </div>

        {/* Awards Grid */}
        {awards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-sand-200 my-8">
            <p className="text-lg font-serif text-navy-900 font-semibold">
              No awards found in this category
            </p>
            <p className="text-navy-500 text-sm mt-2">
              Please choose another category or view all categories.
            </p>
            <Link
              href="/awards"
              className="inline-block mt-4 text-xs font-semibold text-gold-600 hover:text-gold-700 underline"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {awards.map((award) => (
              <div
                key={award.id}
                className="bg-white rounded-2xl border border-sand-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Category and Year Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gold-50 text-gold-800 border border-gold-200">
                      {award.category}
                    </span>
                    <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800">
                      Year {award.year}
                    </span>
                  </div>

                  {/* Honoree Photo / Emblem */}
                  <div className="flex items-center space-x-4 mb-5">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-navy-100 border-2 border-gold-400 shrink-0">
                      <Image
                        src={award.image_url || '/brand/mindspark.jpg'}
                        alt={award.recipient_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-navy-950 leading-snug">
                        {award.recipient_name}
                      </h3>
                      <p className="text-xs text-gold-700 font-medium mt-0.5">
                        {award.award_title}
                      </p>
                    </div>
                  </div>

                  {/* Citation */}
                  <div className="bg-sand-50/70 rounded-xl p-4 border border-sand-200/60 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-1">
                      Official Citation
                    </p>
                    <p className="text-xs text-navy-800 leading-relaxed italic">
                      "{award.citation}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-navy-400">
                  <span>MindSpark Hub Secretariat</span>
                  <span className="font-mono text-navy-300">Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
