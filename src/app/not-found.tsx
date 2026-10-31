import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-sand-50">
        <div className="max-w-md w-full text-center space-y-6">
          <span className="text-xs uppercase tracking-widest font-bold text-gold-600 bg-sand-200 px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-4xl font-bold font-serif text-navy-900">
            Page Not Found
          </h1>
          <p className="text-sm text-navy-700 leading-relaxed">
            The page you requested does not exist or may have been relocated. Please check the URL or return to our homepage.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
