'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Plus, Shield, ShieldAlert, KeyRound, Check } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PROGRAMME_MANAGER'>('EDITOR');
  const [initialPassword, setInitialPassword] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => {
        if (!res.ok) throw new Error('Forbidden');
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, initialPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard staff member');

      setCreatedCredentials(data);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: currentStatus === 0 }),
      });
      if (res.ok) fetchUsers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-navy-900">
            Staff and Privileged User Management
          </h1>
          <p className="text-xs text-navy-600 mt-1">
            Invite only onboarding with mandatory two step verification on every account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreatedCredentials(null);
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors self-start sm:self-auto shadow"
        >
          <Plus className="w-4 h-4 text-gold-500" />
          <span>Onboard New Staff Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-100 text-navy-800 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Two Step Verification</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Last Sign In</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-navy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-500">
                    No users accessible or insufficient privileges.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-navy-900 text-sm">{u.name}</p>
                      <p className="text-[11px] text-navy-600">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        Enforced (MFA)
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.is_active === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active === 1 ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-navy-500">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                          u.is_active === 1
                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.is_active === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Onboard Staff Account
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {error}
              </div>
            )}

            {createdCredentials ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 space-y-2">
                  <p className="font-bold text-sm">Account Created Successfully!</p>
                  <p>Provide the enrolled member with their initial credentials and two step enrollment code.</p>
                </div>

                {createdCredentials.mfaUri && (
                  <div className="p-3 bg-sand-100 rounded-lg space-y-2">
                    <p className="font-bold text-navy-900">
                      Scan with Google Authenticator
                    </p>
                    <div className="flex justify-center bg-white p-3 rounded border border-sand-300">
                      <QRCodeSVG
                        value={createdCredentials.mfaUri}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#0b1f33"
                        level="M"
                      />
                    </div>
                    <p className="text-[11px] text-navy-600 text-center">
                      Scan the QR code, or enter the secret key manually in Google Authenticator.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-sand-100 rounded-lg space-y-2 font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-navy-500 block">MFA Base32 Secret Key</span>
                    <span className="font-bold text-navy-900 select-all">{createdCredentials.mfaSecret}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-navy-500 block">Single Use Backup Recovery Codes</span>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-[11px]">
                      {createdCredentials.backupCodes?.map((c: string, idx: number) => (
                        <span key={idx} className="bg-white p-1 rounded border border-sand-300 select-all">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 bg-navy-900 text-white rounded font-semibold text-xs"
                >
                  Done and Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gladness Adeduni"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gladness@mindsparkhub.org"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Initial Password (Min 12 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Must be at least 12 characters"
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Role Assignment</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  >
                    <option value="EDITOR">Editor (Articles and Gallery)</option>
                    <option value="PROGRAMME_MANAGER">Programme Manager (Events and Curricula)</option>
                    <option value="ADMIN">Administrator (Content, Approvals, Inquiries)</option>
                    <option value="SUPER_ADMIN">Super Administrator (Security and Users)</option>
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
                    {submitting ? 'Generating MFA...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
