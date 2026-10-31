'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, ShieldCheck, ShieldAlert, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState<'ssi' | 'cs' | 'ce' | 'seminar' | 'mentorship'>('ssi');
  const [file, setFile] = useState<File | null>(null);
  const [isMinorDepicted, setIsMinorDepicted] = useState(false);
  const [consentVerified, setConsentVerified] = useState(false);
  const [consentReference, setConsentReference] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/gallery')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select an image file to upload');
      return;
    }

    if (isMinorDepicted && isPublished && (!consentVerified || !consentReference)) {
      setError('Child Safeguarding Gate: You cannot publish photographs depicting minors without verified consent and a documented consent reference code.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload file binary with magic bytes validation
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'gallery');

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      // 2. Create gallery database record
      const recordRes = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          caption,
          altText,
          category,
          imageUrl: uploadData.filePath,
          isMinorDepicted,
          consentVerified,
          consentReference,
          isPublished,
        }),
      });

      const recordData = await recordRes.json();
      if (!recordRes.ok) throw new Error(recordData.error || 'Failed to save record');

      setShowUploadModal(false);
      setTitle('');
      setCaption('');
      setAltText('');
      setFile(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message || 'Error uploading photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergencyTakedown = async (id: string) => {
    if (!confirm('Execute instant emergency takedown for this photograph? It will vanish from public view immediately.')) return;

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'takedown' }),
      });
      if (res.ok) fetchItems();
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: currentStatus === 0 }),
      });
      if (res.ok) fetchItems();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Safeguarded Media and Gallery
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Re encode images, inspect magic bytes, manage captions, verify minor consent, and execute emergency takedowns.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <Upload className="w-4 h-4 text-gold-500" />
          <span>Upload Media Item</span>
        </button>
      </div>

      {/* Gallery List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-navy-500">
            Loading gallery records...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-navy-500">
            No gallery items available.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-sand-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-navy-950">
                  <Image
                    src={item.image_url}
                    alt={item.alt_text}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        item.is_published === 1
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {item.is_published === 1 ? 'Published' : 'Unpublished'}
                    </span>
                  </div>
                  {item.is_minor_depicted === 1 && (
                    <div className="absolute top-2 right-2 bg-navy-950/80 p-1 rounded text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-700">
                    Category: {item.category}
                  </span>
                  <h3 className="font-bold text-navy-900 text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-navy-600 line-clamp-2">
                    {item.caption}
                  </p>

                  {item.is_minor_depicted === 1 && (
                    <div className="p-2 rounded bg-sand-100 border border-sand-300 text-[11px] text-navy-800 space-y-0.5">
                      <p className="font-semibold text-emerald-800 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Minor Consent Verified</span>
                      </p>
                      <p className="font-mono text-[10px] text-navy-600 truncate">
                        Ref: {item.consent_reference || 'Archived Institutional'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-sand-200 bg-sand-50 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item.id, item.is_published)}
                  className="text-navy-700 hover:text-navy-900 font-semibold flex items-center space-x-1"
                >
                  {item.is_published === 1 ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Publish</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleEmergencyTakedown(item.id)}
                  className="text-red-700 hover:text-red-800 font-bold flex items-center space-x-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Emergency Takedown</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Upload Media to Secure Pipeline
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Select File (JPEG, PNG, WebP)</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded border border-sand-300 bg-sand-50"
                />
                <p className="text-[10px] text-navy-500 mt-1">
                  Magic byte verification and EXIF metadata stripping will be applied automatically.
                </p>
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Caption</label>
                <textarea
                  required
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Alt Text (Accessible Screen Reader Copy)</label>
                <input
                  type="text"
                  required
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                >
                  <option value="ssi">Secondary Schools Invasion</option>
                  <option value="cs">Campus Sparking</option>
                  <option value="ce">Community Enlightenment</option>
                  <option value="seminar">General Seminar</option>
                  <option value="mentorship">Mentorship Session</option>
                </select>
              </div>

              {/* Safeguarding Controls for Minors */}
              <div className="p-3 bg-sand-100 rounded-lg border border-sand-300 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="minor-check"
                    type="checkbox"
                    checked={isMinorDepicted}
                    onChange={(e) => setIsMinorDepicted(e.target.checked)}
                    className="h-4 w-4 rounded text-gold-500"
                  />
                  <label htmlFor="minor-check" className="font-bold text-navy-900 cursor-pointer">
                    Does this photograph depict identifiable secondary school minors?
                  </label>
                </div>

                {isMinorDepicted && (
                  <div className="pt-2 border-t border-sand-200 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        id="consent-check"
                        type="checkbox"
                        checked={consentVerified}
                        onChange={(e) => setConsentVerified(e.target.checked)}
                        className="h-4 w-4 rounded text-gold-500"
                      />
                      <label htmlFor="consent-check" className="font-semibold text-emerald-900 cursor-pointer">
                        Confirmed written parental or institutional school consent exists on file.
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-navy-800 mb-1">Institutional Consent Reference Code</label>
                      <input
                        type="text"
                        value={consentReference}
                        onChange={(e) => setConsentReference(e.target.value)}
                        placeholder="e.g. FGCW-SSI1-2026-CONSENT"
                        className="w-full p-2 rounded border border-sand-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-sand-300 text-navy-700 rounded hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 font-semibold"
                >
                  {submitting ? 'Uploading...' : 'Save to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
