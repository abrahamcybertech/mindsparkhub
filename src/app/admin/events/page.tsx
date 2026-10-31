'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [programmeSlug, setProgrammeSlug] = useState<'ssi' | 'cs' | 'ce'>('cs');
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED'>('PENDING_APPROVAL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programmeSlug,
          title,
          venue,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          description,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');

      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      if (res.ok) fetchEvents();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Events and Schedule Approvals
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Enforcing four eyes verification: Programme Managers draft events; Administrators review and approve.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <Plus className="w-4 h-4 text-gold-500" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Event Details</th>
                <th className="p-4">Programme</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    Loading scheduled events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    No events scheduled yet.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-navy-900 text-sm">{evt.title}</p>
                      <p className="text-[11px] text-navy-600 line-clamp-1 mt-0.5">{evt.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono uppercase font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        {evt.programme_slug}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-navy-900">
                        {new Date(evt.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-navy-500">
                        {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-4 max-w-xs truncate">{evt.venue}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          evt.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : evt.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-sand-200 text-navy-700'
                        }`}
                      >
                        {evt.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {evt.status === 'PENDING_APPROVAL' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(evt.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Approve and Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Schedule New Event
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Programme</label>
                <select
                  value={programmeSlug}
                  onChange={(e) => setProgrammeSlug(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                >
                  <option value="ssi">Secondary Schools Invasion</option>
                  <option value="cs">Campus Sparking</option>
                  <option value="ce">Community Enlightenment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Campus Sparking Convergence Session"
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Venue</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Federal University Wukari Auditorium"
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Submission Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_APPROVAL">Pending Administrator Approval</option>
                  <option value="APPROVED">Approved and Published (Admin Only)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-sand-300 text-navy-700 rounded hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 font-semibold"
                >
                  {submitting ? 'Saving...' : 'Submit Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
