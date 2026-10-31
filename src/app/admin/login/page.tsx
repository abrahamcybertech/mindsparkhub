'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.requiresMfa) {
        setRequiresMfa(true);
        setLoading(false);
        return;
      }

      // Login succeeded
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotMessage(null);
    setResetUrl(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create password reset');

      setForgotMessage(data.message || 'Password reset requested.');
      if (data.resetUrl) setResetUrl(data.resetUrl);
      setMode('forgot-sent');
    } catch (err: any) {
      setError(err.message || 'Could not create password reset');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="relative w-12 h-12 rounded bg-navy-900 border border-gold-500/40 overflow-hidden">
            <Image
              src="/brand/mindspark.jpg"
              alt="MindSpark Hub"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold font-serif text-white tracking-tight">
            MindSpark <span className="text-gold-500">Hub</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Administrative Portal
        </h1>
        <p className="mt-2 text-xs text-navy-300">
          Restricted access for authorized staff and executive leadership.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-navy-900 py-8 px-6 shadow-2xl rounded-2xl border border-navy-800 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-700 rounded-lg text-xs text-red-200 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-4 bg-navy-950 rounded-lg border border-gold-500/40 text-center space-y-2">
                <Mail className="w-8 h-8 text-gold-500 mx-auto" />
                <h2 className="text-sm font-bold text-white font-serif">
                  Forgot Password
                </h2>
                <p className="text-xs text-navy-300">
                  Enter your official email address and we will send you a password reset link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-200 mb-1">
                  Official Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@mindsparkhub.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 transition-all shadow-md"
              >
                {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="w-full text-xs text-navy-400 hover:text-gold-400 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : mode === 'forgot-sent' ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-lg text-emerald-100 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{forgotMessage}</span>
              </div>

              {resetUrl && (
                <a
                  href={resetUrl}
                  className="block text-center w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 transition-all shadow-md"
                >
                  Open password reset page
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotMessage(null);
                  setResetUrl(null);
                  setError(null);
                }}
                className="w-full text-xs text-navy-400 hover:text-gold-400 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {!requiresMfa ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-200 mb-1">
                      Official Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@mindsparkhub.org"
                        className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-200 mb-1">
                      Password (Min 12 characters)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-navy-950 rounded-lg border border-gold-500/40 text-center space-y-2">
                    <KeyRound className="w-8 h-8 text-gold-500 mx-auto" />
                    <h2 className="text-sm font-bold text-white font-serif">
                      Two Step Verification Required
                    </h2>
                    <p className="text-xs text-navy-300">
                      Open Google Authenticator and enter the 6 digit code for MindSpark Hub, or enter one of your single use recovery codes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gold-400 mb-1">
                      6 Digit Code or Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-navy-950 border-2 border-gold-500 rounded-lg text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                    <p className="text-xs text-navy-400 mt-2 text-center">
                      Enter the current code shown in Google Authenticator.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 transition-all shadow-md mt-4"
              >
                {loading ? 'Verifying...' : requiresMfa ? 'Confirm and Enter Portal' : 'Continue to Verification'}
              </button>

              {!requiresMfa && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotEmail(email);
                    setError(null);
                  }}
                  className="w-full text-xs text-navy-400 hover:text-gold-400 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </form>
          )}

          <div className="pt-4 border-t border-navy-800 text-center">
            <Link href="/" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">
              &larr; Return to public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
