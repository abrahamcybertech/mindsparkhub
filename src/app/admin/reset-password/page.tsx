'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [accessToken, setAccessToken] = useState('');
  const [checkingSession, setCheckingSession] = useState(!token);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setCheckingSession(false);
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const hashError =
      hash.get('error_description') ||
      hash.get('error') ||
      query.get('error_description') ||
      query.get('error');

    if (hashError) {
      setLinkError(decodeURIComponent(hashError.replace(/\+/g, ' ')));
      setCheckingSession(false);
      return;
    }

    const hashAccessToken = hash.get('access_token');
    const hashRefreshToken = hash.get('refresh_token');

    if (!hashAccessToken || !hashRefreshToken) {
      setLinkError('This reset link is invalid or has expired. Please request a new link.');
      setCheckingSession(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLinkError('Password reset is not configured. Contact the Super Administrator.');
      setCheckingSession(false);
      return;
    }

    let active = true;

    supabase.auth
      .setSession({
        access_token: hashAccessToken,
        refresh_token: hashRefreshToken,
      })
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError || !data.session?.access_token) {
          setLinkError('This reset link is invalid or has expired. Please request a new link.');
        } else {
          setAccessToken(data.session.access_token);
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) return;
        setLinkError('This reset link is invalid or has expired. Please request a new link.');
        setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token && !accessToken) {
      setLinkError('This reset link is missing its token. Please request a new link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password and confirmation do not match');
      return;
    }

    setLoading(true);

    try {
      const payload = token ? { token, newPassword } : { accessToken, newPassword };
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not reset password');

      if (accessToken) {
        const supabase = getSupabaseBrowserClient();
        await supabase?.auth.signOut().catch(() => undefined);
      }

      setSuccess(data.message || 'Password reset successful.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Reset Your Password
        </h1>
        <p className="mt-2 text-xs text-navy-300">
          Choose a new password for your MindSpark Hub staff account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-navy-900 py-8 px-6 shadow-2xl rounded-2xl border border-navy-800 sm:px-10 space-y-6">
          {success ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-lg text-emerald-100 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
              <Link
                href="/admin/login"
                className="block text-center w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 transition-all shadow-md"
              >
                Go to sign in
              </Link>
            </div>
          ) : checkingSession ? (
            <div className="text-center text-xs text-navy-300 py-4">
              Validating your reset link...
            </div>
          ) : linkError ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-red-950/80 border border-red-700 rounded-lg text-red-200 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{linkError}</span>
              </div>
              <p className="text-navy-300">
                Use the Forgot password link on the sign in page to request a new link.
              </p>
              <Link
                href="/admin/login"
                className="block text-center w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 transition-all shadow-md"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-950/80 border border-red-700 rounded-lg text-xs text-red-200 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-200 mb-1">
                  New Password (Min 12 characters)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-200 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 transition-all shadow-md"
              >
                {loading ? 'Saving...' : 'Set New Password'}
              </button>

              <Link
                href="/admin/login"
                className="block text-center text-xs text-navy-400 hover:text-gold-400 transition-colors"
              >
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex items-center justify-center text-sm text-navy-300">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
