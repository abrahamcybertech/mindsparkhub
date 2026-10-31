'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, Eye, EyeOff, Upload } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  roleTitle: '',
  unitSlug: '',
  bio: '',
  imageUrl: '',
  orderIndex: 0,
  isPublished: true,
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = () => {
    fetch('/api/admin/team')
      .then((res) => {
        if (!res.ok) throw new Error('Forbidden');
        return res.json();
      })
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, orderIndex: members.length + 1 });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (member: any) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      roleTitle: member.role_title,
      unitSlug: member.unit_slug || '',
      bio: member.bio,
      imageUrl: member.image_url,
      orderIndex: member.order_index,
      isPublished: member.is_published === 1,
    });
    setError(null);
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('directory', 'exco');

      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setForm((prev) => ({ ...prev, imageUrl: data.filePath }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/team', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save team member');

      setShowModal(false);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error saving team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: currentStatus === 0 }),
      });
      if (res.ok) fetchMembers();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (member: any) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;

    try {
      const res = await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id }),
      });
      if (res.ok) fetchMembers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Structure and Exco
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Add, edit, publish, or remove Executive Council members shown on the public Structure page without changing the code.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <UserPlus className="w-4 h-4 text-gold-500" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    Loading team members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    No team members yet. Add the first one.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-navy-900 border border-sand-300">
                          {member.image_url ? (
                            <img
                              src={member.image_url}
                              alt={member.name}
                              className="h-full w-full object-cover object-top"
                            />
                          ) : null}
                        </div>
                        <p className="font-bold text-navy-900 text-sm">{member.name}</p>
                      </div>
                    </td>
                    <td className="p-4">{member.role_title}</td>
                    <td className="p-4 text-[11px] font-mono text-navy-600">
                      {member.unit_slug || 'None'}
                    </td>
                    <td className="p-4">{member.order_index}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          member.is_published === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sand-200 text-navy-700'
                        }`}
                      >
                        {member.is_published === 1 ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        className="inline-flex items-center px-2.5 py-1 bg-white border border-sand-300 text-navy-800 hover:bg-sand-100 rounded text-[11px] font-semibold"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(member.id, member.is_published)}
                        className="inline-flex items-center px-2.5 py-1 bg-white border border-sand-300 text-navy-800 hover:bg-sand-100 rounded text-[11px] font-semibold"
                      >
                        {member.is_published === 1 ? (
                          <EyeOff className="w-3 h-3 mr-1" />
                        ) : (
                          <Eye className="w-3 h-3 mr-1" />
                        )}
                        {member.is_published === 1 ? 'Hide' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member)}
                        className="inline-flex items-center px-2.5 py-1 border border-red-300 text-red-700 hover:bg-red-50 rounded text-[11px] font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-sand-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Gladness Adeduni"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={form.roleTitle}
                    onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                    placeholder="e.g. Communications Unit Head"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Unit Slug (Optional)</label>
                  <input
                    type="text"
                    value={form.unitSlug}
                    onChange={(e) => setForm({ ...form, unitSlug: e.target.value })}
                    placeholder="e.g. communication_editorial"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    required
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-navy-800 mb-1">Short Biography</label>
                <textarea
                  required
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold uppercase text-navy-800 mb-1">Profile Photo</label>
                <input
                  type="text"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/exco/member_photo.jpg"
                  className="w-full p-2.5 rounded border border-sand-300 bg-sand-50 font-mono"
                />
                <label className="inline-flex items-center space-x-2 px-3 py-2 rounded border border-sand-300 bg-sand-100 text-navy-800 font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {form.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded border border-sand-300 bg-navy-950">
                    <img
                      src={form.imageUrl}
                      alt="Team member preview"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="team-publish"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded text-gold-500"
                />
                <label htmlFor="team-publish" className="font-semibold text-navy-900 cursor-pointer">
                  Show this member on the public Structure page
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
                  disabled={submitting || uploading}
                  className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 font-semibold"
                >
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
