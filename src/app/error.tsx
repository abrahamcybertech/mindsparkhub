'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log privately to internal server logs; never leak raw stack traces to visitor
    console.error('Handled application error boundary:', error);
  }, [error]);

  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-sand-50">
        <div className="max-w-md w-full text-center space-y-6">
          <span className="text-xs uppercase tracking-widest font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
            Operational Notice
          </span>
          <h1 className="text-3xl font-bold font-serif text-navy-900">
            Service Temporarily Unavailable
          </h1>
          <p className="text-sm text-navy-700 leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-navy-900 bg-white border border-sand-300 hover:bg-sand-100 rounded transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
