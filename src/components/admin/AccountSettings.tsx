'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Lock, ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, Smartphone } from 'lucide-react';

interface AccountSettingsProps {
  user: {
    name: string;
    email: string;
    role: string;
    mfaEnabled: boolean;
  };
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaSetup, setMfaSetup] = useState<any | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordSuccess(data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/admin/login');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const startMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaSubmitting(true);

    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: mfaPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start setup');

      setMfaSetup(data);
      setMfaPassword('');
    } catch (err: any) {
      setMfaError(err.message || 'Error starting Google Authenticator setup');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const verifyMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaSubmitting(true);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify code');

      setMfaSuccess(data.message || 'Google Authenticator is now active.');
      setMfaSetup(null);
      setMfaCode('');
      router.refresh();
    } catch (err: any) {
      setMfaError(err.message || 'Error verifying code');
    } finally {
      setMfaSubmitting(false);
    }
  };

  const closeMfaModal = () => {
    setShowMfaModal(false);
    setMfaPassword('');
    setMfaSetup(null);
    setMfaCode('');
    setMfaError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-navy-900">
          Account Settings
        </h1>
        <p className="text-xs text-navy-600 mt-1">
          Manage your sign in password and Google Authenticator enrollment.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 shadow-sm p-6 space-y-2">
        <p className="text-xs uppercase tracking-wider font-bold text-navy-500">Signed in as</p>
        <p className="text-lg font-bold font-serif text-navy-900">{user.name}</p>
        <p className="text-xs text-navy-600">{user.email}</p>
        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-gold-50 text-gold-700 border border-gold-200">
          {user.role.replace(/_/g, ' ')}
        </span>
      </div>

      <section className="bg-white rounded-2xl border border-sand-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gold-600" />
          <h2 className="text-lg font-bold font-serif text-navy-900">Change Password</h2>
        </div>

        {passwordError && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded border border-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{passwordSuccess} Redirecting to sign in...</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase text-navy-800 mb-1">Current Password</label>
            <input
              type="password"
              required
              minLength={12}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-navy-800 mb-1">New Password (Min 12 chars)</label>
              <input
                type="password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-navy-800 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={12}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
              />
            </div>
          </div>

          <p className="text-[11px] text-navy-500">
            After a successful change, all active sessions are revoked and you must sign in again.
          </p>

          <button
            type="submit"
            disabled={passwordSubmitting}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 disabled:opacity-50 transition-colors"
          >
            <Lock className="w-4 h-4 text-gold-500" />
            <span>{passwordSubmitting ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-sand-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-gold-600" />
          <h2 className="text-lg font-bold font-serif text-navy-900">Google Authenticator</h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <ShieldCheck className={`w-4 h-4 ${user.mfaEnabled ? 'text-emerald-600' : 'text-navy-400'}`} />
          <span className="text-navy-800 font-semibold">
            {user.mfaEnabled ? 'Active on this account' : 'Not active yet'}
          </span>
        </div>

        <p className="text-xs text-navy-600">
          Use the Google Authenticator app on your phone. When you start setup, scan the QR code or enter the secret key manually, then confirm with the 6 digit code shown in the app.
        </p>

        {mfaSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded border border-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mfaSuccess}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowMfaModal(true);
            setMfaSuccess(null);
            setMfaError(null);
            setMfaSetup(null);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 border border-navy-900 text-navy-900 rounded-lg font-semibold hover:bg-navy-900 hover:text-white transition-colors text-xs"
        >
          <KeyRound className="w-4 h-4" />
          <span>{user.mfaEnabled ? 'Reconfigure Google Authenticator' : 'Set up Google Authenticator'}</span>
        </button>
      </section>

      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-sand-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Google Authenticator Setup
            </h2>

            {mfaError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded border border-red-300">
                {mfaError}
              </div>
            )}

            {!mfaSetup ? (
              <form onSubmit={startMfaSetup} className="space-y-4 text-xs">
                <p className="text-navy-700">
                  Confirm your current password to generate a new Google Authenticator key. Your existing MFA stays active until the new code is verified.
                </p>
                <div>
                  <label className="block font-bold uppercase text-navy-800 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={mfaPassword}
                    onChange={(e) => setMfaPassword(e.target.value)}
                    className="w-full p-2.5 rounded border border-sand-300 bg-sand-50"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-3 border-t border-sand-200">
                  <button
                    type="button"
                    onClick={closeMfaModal}
                    className="px-4 py-2 border border-sand-300 text-navy-700 rounded hover:bg-sand-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mfaSubmitting}
                    className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 font-semibold disabled:opacity-50"
                  >
                    {mfaSubmitting ? 'Generating...' : 'Generate QR Code'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-sand-100 rounded-lg space-y-2">
                  <p className="font-bold text-navy-900">1. Scan this QR code with Google Authenticator</p>
                  <div className="flex justify-center bg-white p-3 rounded border border-sand-300">
                    <QRCodeSVG value={mfaSetup.uri} size={210} bgColor="#ffffff" fgColor="#0b1f33" level="M" />
                  </div>
                  <p className="text-[11px] text-navy-600">
                    Cannot scan? Enter this secret key manually:
                  </p>
                  <p className="font-mono font-bold text-navy-900 select-all break-all">{mfaSetup.secret}</p>
                </div>

                <div className="p-3 bg-sand-100 rounded-lg space-y-2">
                  <p className="font-bold text-navy-900">2. Save your backup codes</p>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {mfaSetup.backupCodes?.map((code: string, idx: number) => (
                      <span key={idx} className="bg-white p-1 rounded border border-sand-300 select-all font-mono">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <form onSubmit={verifyMfaSetup} className="space-y-3">
                  <div>
                    <label className="block font-bold uppercase text-navy-800 mb-1">
                      3. Enter the 6 digit code from Google Authenticator
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="123456"
                      className="w-full p-3 rounded border-2 border-gold-500 bg-sand-50 text-center font-mono text-xl tracking-widest"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-3 border-t border-sand-200">
                    <button
                      type="button"
                      onClick={closeMfaModal}
                      className="px-4 py-2 border border-sand-300 text-navy-700 rounded hover:bg-sand-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mfaSubmitting}
                      className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 font-semibold disabled:opacity-50"
                    >
                      {mfaSubmitting ? 'Verifying...' : 'Activate Google Authenticator'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
