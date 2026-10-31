'use client';

import React, { useState, useEffect } from 'react';
import { Inbox, Download, Search, CheckCircle, Clock, Archive, FileText } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchSubmissions = () => {
    fetch('/api/admin/submissions')
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchSubmissions();
        if (selectedSub && selectedSub.id === id) {
          setSelectedSub({ ...selectedSub, status: newStatus });
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSub) return;
    setSavingNotes(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSub.id, internalNotes: notes }),
      });
      if (res.ok) {
        fetchSubmissions();
        setSelectedSub({ ...selectedSub, internal_notes: notes });
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/admin/submissions';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Applications and Citizen Inquiries
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Review incoming volunteer, mentorship, membership, and partnership submissions. All data managed under NDPA 2023.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <Download className="w-4 h-4 text-gold-500" />
          <span>Export All as CSV (Audited)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
                <tr>
                  <th className="p-3">Ref Code</th>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-navy-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-navy-500">
                      Loading submissions...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-navy-500">
                      No citizen inquiries or applications yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        setSelectedSub(sub);
                        setNotes(sub.internal_notes || '');
                      }}
                      className={`cursor-pointer transition-colors ${
                        selectedSub?.id === sub.id ? 'bg-sand-100 font-semibold' : 'hover:bg-sand-50'
                      }`}
                    >
                      <td className="p-3 font-mono text-navy-900 font-bold">{sub.reference_code}</td>
                      <td className="p-3">
                        <p className="font-bold text-navy-900">{sub.full_name}</p>
                        <p className="text-[10px] text-navy-500">{sub.email}</p>
                      </td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                          {sub.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'NEW'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'CONTACTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sand-200 text-navy-700'
                          }`}
                        >
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-navy-500">
                        {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Submission Inspector & Internal Notes */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-4">
          {selectedSub ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-500">Reference Number</span>
                  <p className="text-base font-mono font-bold text-navy-900">{selectedSub.reference_code}</p>
                </div>
                <div className="flex space-x-1">
                  {['NEW', 'UNDER_REVIEW', 'CONTACTED', 'ARCHIVED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedSub.id, st)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        selectedSub.status === st
                          ? 'bg-navy-900 text-white'
                          : 'bg-sand-100 text-navy-700 hover:bg-sand-200'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p><strong>Full Name:</strong> {selectedSub.full_name}</p>
                <p><strong>Email Address:</strong> <a href={`mailto:${selectedSub.email}`} className="text-navy-900 underline">{selectedSub.email}</a></p>
                {selectedSub.phone_number && <p><strong>Telephone:</strong> {selectedSub.phone_number}</p>}
                {selectedSub.interests && <p><strong>Interests / Trade:</strong> {selectedSub.interests}</p>}
                <p><strong>Submission Type:</strong> <span className="uppercase text-gold-700 font-bold">{selectedSub.type}</span></p>
                <p><strong>Received:</strong> {new Date(selectedSub.created_at).toLocaleString()}</p>
              </div>

              <div className="p-3 bg-sand-50 rounded-lg border border-sand-200 space-y-1">
                <p className="font-bold text-navy-900">Message / Statement of Intent:</p>
                <p className="text-navy-800 leading-relaxed whitespace-pre-wrap">{selectedSub.message}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-sand-200">
                <label className="block font-bold text-navy-900 uppercase text-[10px]">
                  Internal Staff Review Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record review notes, reviewer initial, or action taken..."
                  className="w-full p-2.5 rounded border border-sand-300 text-xs bg-sand-50"
                />
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 bg-navy-900 text-white font-semibold rounded text-xs hover:bg-navy-800 disabled:opacity-50"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-navy-500 space-y-2">
              <Inbox className="w-8 h-8 text-navy-400 mx-auto" />
              <p>Select any application or inquiry from the table to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
