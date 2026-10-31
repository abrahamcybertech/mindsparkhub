import React from 'react';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getDatabase } from '@/lib/db';
import { Shield, BookOpen, Wrench, Heart, Radio, Truck, Flame, FileText, Landmark, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organisational Structure and Leadership | MindSpark Hub',
  description:
    'Meet the Executive Council and explore the eight specialised functional advocacy units that drive the mission of MindSpark Hub across Nigeria.',
};

export const revalidate = 60;

export default async function StructurePage() {
  const db = getDatabase();

  const excos = await db.prepare(`
    SELECT * FROM exco_members WHERE is_published = 1 ORDER BY order_index ASC
  `).all() as any[];

  const units = await db.prepare(`
    SELECT * FROM units ORDER BY order_index ASC
  `).all() as any[];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-20 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest bg-navy-900 border border-gold-500/30 px-3 py-1 rounded-full">
              Governance and Organisation
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Our Structure and Leadership
            </h1>
            <p className="text-xl text-gold-400 font-serif font-medium">
              Structure, Discipline and Dedicated Responsibility
            </p>
            <p className="text-lg text-navy-200 leading-relaxed pt-2">
              MindSpark Hub operates as a structured platform with eight specialised functional units, dedicated administrative departments, and a verified Executive Council guiding our national impact.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Executive Council (Excos) */}
      <section className="py-20 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Executive Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">
              The Executive Council
            </h2>
            <p className="text-base text-navy-700">
              Dedicated institutional leadership steering MindSpark Hub with integrity, excellence, and shared purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {excos.map((member) => (
              <div
                key={member.id}
                className="bg-sand-50 rounded-2xl overflow-hidden border border-sand-200 shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="relative h-80 w-full bg-navy-950">
                  <Image
                    src={member.image_url}
                    alt={`${member.name}, ${member.role_title}`}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gold-700 uppercase tracking-wider block">
                      {member.role_title}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-navy-900 mt-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-navy-800 leading-relaxed mt-2">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Eight Functional Units */}
      <section className="py-20 bg-sand-100 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Operational Engines
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-900">
              Eight Functional Advocacy Units
            </h2>
            <p className="text-base text-navy-700">
              Per the MindSpark Hub orientation document, every unit executes distinct operational responsibilities to ensure holistic youth development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {units.map((unit) => {
              const functions = JSON.parse(unit.core_functions_json || '[]');
              const rules = JSON.parse(unit.guiding_rules_json || '[]');

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-sand-200 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
                        Unit {unit.order_index}
                      </span>
                      <span className="text-xs text-navy-600 font-medium">
                        Head: <strong className="text-navy-900">{unit.unit_head_name}</strong>
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold font-serif text-navy-900">
                      {unit.name}
                    </h3>

                    <p className="text-sm text-navy-800 leading-relaxed">
                      {unit.description}
                    </p>

                    {functions.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                          Core Responsibilities
                        </h4>
                        <ul className="space-y-1.5 text-xs text-navy-700">
                          {functions.slice(0, 4).map((fn: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-gold-600 font-bold">•</span>
                              <span>{fn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {rules.length > 0 && (
                    <div className="pt-4 border-t border-sand-200">
                      <p className="text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                        Guiding Standard
                      </p>
                      <p className="text-xs text-navy-600 italic">
                        "{rules[0]}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Administrative Structures Acknowledgment */}
      <section className="py-20 bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Institutional Backbone
            </span>
            <h2 className="text-3xl font-bold font-serif text-navy-900">
              Administrative Structures
            </h2>
            <p className="text-base text-navy-700">
              The operational stability of MindSpark Hub is anchored by two dedicated administrative departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-sand-50 rounded-2xl border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-navy-900">
                The Hub Secretariat
              </h3>
              <p className="text-xs font-semibold text-gold-700">
                General Secretary: Dimas Mercy
              </p>
              <p className="text-sm text-navy-800 leading-relaxed">
                The administrative backbone of MindSpark Hub. It ensures effective coordination, documentation, minutes of meetings, official correspondence, and the smooth running of all organisational activities across units and programmes.
              </p>
            </div>

            <div className="p-8 bg-sand-50 rounded-2xl border border-sand-200 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-navy-900">
                The Financial Department
              </h3>
              <p className="text-xs font-semibold text-gold-700">
                Financial Secretary: Kayode Mary Ayomide
              </p>
              <p className="text-sm text-navy-800 leading-relaxed">
                Responsible for the prudent management, absolute transparency, and strategic allocation of financial resources. Oversees budgets, membership dues, and accounts to ensure institutional sustainability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* General Rules Binding on All Members */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Code of Conduct
            </p>
            <h2 className="text-3xl font-bold font-serif text-white">
              General Rules Binding on All Units and Members
            </h2>
            <p className="text-sm text-navy-300 max-w-2xl mx-auto">
              Established to ensure efficiency, unity, discipline, and maximum productivity in achieving the vision and mission of MindSpark Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-navy-200">
            <div className="bg-navy-950 p-6 rounded-xl border border-navy-800 space-y-2">
              <h4 className="font-bold text-white font-serif">Mission Alignment</h4>
              <p>All activities, programmes, and decisions must directly support the vision and mission of MindSpark Hub.</p>
            </div>
            <div className="bg-navy-950 p-6 rounded-xl border border-navy-800 space-y-2">
              <h4 className="font-bold text-white font-serif">Leadership Authority</h4>
              <p>All units operate under the authority of the Hub Director and administrative supervision of the General Secretary.</p>
            </div>
            <div className="bg-navy-950 p-6 rounded-xl border border-navy-800 space-y-2">
              <h4 className="font-bold text-white font-serif">Synergy Over Rivalry</h4>
              <p>Units must work in synergy, supporting one another and avoiding rivalry, division, or duplication of roles.</p>
            </div>
            <div className="bg-navy-950 p-6 rounded-xl border border-navy-800 space-y-2">
              <h4 className="font-bold text-white font-serif">Honour and Modesty</h4>
              <p>Members must represent MindSpark Hub with honour, modesty, and credibility both online and offline.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
