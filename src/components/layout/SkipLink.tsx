import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-navy-900 focus:font-semibold focus:shadow-md focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
