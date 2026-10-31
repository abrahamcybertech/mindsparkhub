'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('Academic Excellence');
  const [featuredImage, setFeaturedImage] = useState('/gallery/ssi_fgc_wukari_panoramic.jpg');
  const [readingTimeMins, setReadingTimeMins] = useState(4);
  const [isPublished, setIsPublished] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = () => {
    fetch('/api/admin/articles')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          authorName,
          category,
          featuredImage,
          readingTimeMins: Number(readingTimeMins),
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create article');

      setShowModal(false);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      fetchArticles();
    } catch (err: any) {
      setError(err.message || 'Error creating article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: currentStatus === 0 }),
      });
      if (res.ok) fetchArticles();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Insights and Editorial Management
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Publish educational articles, academic guidelines, skills frameworks, and transformation reports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <Plus className="w-4 h-4 text-gold-500" />
          <span>Draft New Article</span>
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Title and Excerpt</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Reading Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    Loading editorial articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-4 max-w-sm">
                      <p className="font-bold text-navy-900 text-sm">{art.title}</p>
                      <p className="text-[11px] text-navy-600 line-clamp-1 mt-0.5">{art.excerpt}</p>
                    </td>
                    <td className="p-4">{art.author_name}</td>
                    <td className="p-4">
                      <span className="font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        {art.category}
                      </span>
                    </td>
                    <td className="p-4">{art.reading_time_mins} mins</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          art.is_published === 1
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-sand-200 text-navy-700'
                        }`}
                      >
                        {art.is_published === 1 ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(art.id, art.is_published)}
                        className="px-2.5 py-1 bg-white border border-sand-300 text-navy-800 hover:bg-sand-100 rounded text-[11px] font-semibold"
                      >
                        {art.is_published === 1 ? 'Unpublish' : 'Publish'}
                      </button>
                      {art.is_published === 1 && (
                        <Link
                          href={`/insights/${art.slug}`}
                          target="_blank"
                          className="inline-flex items-center px-2 py-1 text-gold-700 hover:underline text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-sand-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Draft Editorial Article
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Author Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Gladness Adeduni"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Academic Excellence"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Excerpt (Listing Summary)</label>
                <textarea
                  required
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Article Body (HTML / Structured Paragraphs)</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>Article introduction paragraph...</p><h2>Key Insights</h2><p>Second paragraph...</p>"
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50 font-mono text-[11px]"
                />
                <p className="text-[10px] text-navy-500 mt-1">
                  Server sanitization will strip any dangerous tags or scripts before storage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="art-publish"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded text-gold-500"
                />
                <label htmlFor="art-publish" className="font-semibold text-navy-900 cursor-pointer">
                  Publish article immediately to public Insights page
                </label>
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
                  {submitting ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
