import React from 'react';
import { getDatabase } from '@/lib/db';
import Link from 'next/link';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export default async function AdminProgrammesPage() {
  const db = getDatabase();
  const programmes = await db.prepare('SELECT * FROM programmes ORDER BY slug ASC').all() as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-navy-900">
          Core Impact Programmes
        </h1>
        <p className="text-xs text-navy-600 mt-1">
          Manage curricula, taglines, structured seminar objectives, and publication status for the three impact vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programmes.map((p) => {
          const objectives = JSON.parse(p.objectives_json || '[]');
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-sand-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                    {p.slug.toUpperCase()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <h2 className="text-xl font-bold font-serif text-navy-900">
                  {p.title}
                </h2>

                <p className="text-xs font-semibold text-navy-700 italic">
                  "{p.tagline}"
                </p>

                <p className="text-xs text-navy-600">
                  <strong>Audience:</strong> {p.audience}
                </p>

                <div className="pt-2 border-t border-sand-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Structured Objectives
                  </p>
                  <ul className="space-y-1 text-xs text-navy-700">
                    {objectives.slice(0, 3).map((obj: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-200 flex items-center justify-between">
                <Link
                  href={`/programmes/${p.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-navy-900 hover:text-gold-600 inline-flex items-center"
                >
                  <span>View Public Page</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
