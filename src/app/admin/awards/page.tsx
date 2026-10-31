'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Plus, Trash2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORY_PRESETS = [
  'Mentorship Excellence',
  'Academic Distinction',
  'Youth Leadership',
  'Community Impact',
  'Institutional Partnership',
];

const PHOTO_PRESETS = [
  { label: 'Daniel Joseph (Exco)', url: '/exco/daniel_joseph_ayomide.jpg' },
  { label: 'Adakole Agene (Exco)', url: '/exco/adakole_agene_michael.jpg' },
  { label: 'Chukwuebuka James (Exco)', url: '/exco/chukwuebuka_james_obochi.jpg' },
  { label: 'Gladness Adeduni (Exco)', url: '/exco/gladness_adeduni.jpg' },
  { label: 'Omomayowa Eunice (Exco)', url: '/exco/omomayowa_eunice_adewuyi.jpg' },
  { label: 'Bekwapu Lucy (Exco)', url: '/exco/bekwapu_lucy_beshiunim.jpg' },
  { label: 'FGC Wukari Assembly', url: '/gallery/ssi_fgc_wukari_panoramic.jpg' },
  { label: 'Official Emblem', url: '/brand/mindspark.jpg' },
];

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [citation, setCitation] = useState('');
  const [imageUrl, setImageUrl] = useState('/brand/mindspark.jpg');
  const [orderIndex, setOrderIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = () => {
    fetch('/api/admin/awards')
      .then((res) => res.json())
      .then((data) => {
        setAwards(data.awards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          awardTitle,
          category,
          year: Number(year),
          citation,
          imageUrl,
          orderIndex: Number(orderIndex),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add award');
      }

      setMessage(`Successfully honored ${recipientName}`);
      setShowModal(false);
      // Reset form
      setRecipientName('');
      setAwardTitle('');
      setCitation('');
      fetchAwards();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the honor for ${name}?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/awards?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete award');
      }

      setMessage(`Removed award record for ${name}`);
      fetchAwards();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-gold-700 uppercase tracking-widest mb-1">
            <Link href="/admin" className="hover:underline flex items-center gap-1 text-navy-600">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <span>Honors and Recognition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-950">
            Awards Management
          </h1>
          <p className="text-sm text-navy-600 mt-1">
            Add or remove institutional honorees, citation texts, and award categories without modifying code.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gold-600 hover:bg-gold-700 text-white font-medium text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Honoree</span>
        </button>
      </div>

      {/* Status Notifications */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Awards List Table */}
      <div className="bg-white rounded-xl border border-sand-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-navy-500">
            Loading awards and honors...
          </div>
        ) : awards.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h3 className="font-serif font-semibold text-navy-900 text-lg">No awards recorded yet</h3>
            <p className="text-sm text-navy-500 mt-1 mb-4">
              Click the button below to add the first honored mentor, student, or partner institution.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              Add First Honoree
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-100/70 border-b border-sand-200 text-xs font-semibold text-navy-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Award Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Citation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {awards.map((award) => (
                  <tr key={award.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-navy-900 whitespace-nowrap">
                      {award.recipient_name}
                    </td>
                    <td className="py-3.5 px-4 text-navy-700 font-serif">
                      {award.award_title}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-gold-50 text-gold-800 border border-gold-200 font-medium">
                        {award.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-navy-600">
                      {award.year}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-navy-600 max-w-xs truncate" title={award.citation}>
                      {award.citation}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(award.id, award.recipient_name)}
                        disabled={deletingId === award.id}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete this award"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Honoree Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto border border-sand-200">
            <div className="flex items-center justify-between pb-4 border-b border-sand-200">
              <h2 className="text-xl font-serif font-bold text-navy-950">
                Add New Honoree
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-navy-400 hover:text-navy-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Samuel Daberechukwu"
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                  Award Title *
                </label>
                <input
                  type="text"
                  required
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  placeholder="e.g. Distinguished Field Agent of the Year"
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2050}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                  Official Citation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  placeholder="Explain why this individual or partner is being recognized by MindSpark Hub..."
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wider mb-1">
                  Recipient Photo Preset / URL
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 mb-2"
                >
                  {PHOTO_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="w-full px-3 py-1.5 border border-sand-200 rounded text-xs text-navy-700 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-sand-300 rounded-lg text-sm text-navy-700 hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Confirm and Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
