import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.49a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.32z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25H8.1l4.71 6.23 5.43-6.23zm-1.16 17.52h1.83L6.99 4.13H5.02l12.06 15.64z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200 border-t border-navy-800" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded overflow-hidden bg-navy-900 border border-gold-500/40">
                <Image
                  src="/brand/mindspark.jpg"
                  alt="MindSpark Hub Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white font-serif tracking-tight">
                MindSpark <span className="text-gold-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed max-w-sm">
              Where every word lights a fire. Igniting minds, sparking purpose, and transforming lives across classrooms, campuses, and communities.
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-gold-400 font-semibold">
                Our Motto
              </p>
              <p className="text-sm text-white font-medium mt-1">
                We spark growth and ignite Mindset.
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <p className="text-xs uppercase tracking-wider text-gold-400 font-semibold">
                Connect with us
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://vm.tiktok.com/ZS9ymVp45QCyV-vCs16/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on TikTok"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/chukwuebuka-james-obochi-1b549422b"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/mindsparkhub2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://x.com/ObochiJame66287"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on X"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com/@mindspark-hub-i3h"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on YouTube"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="https://www.facebook.com/share/1C7Anzbdny/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MindSpark Hub on Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-navy-800 text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
              <a
                href="mailto:Mindsparkhub25@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-navy-300 hover:text-gold-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Mindsparkhub25@gmail.com
              </a>
            </div>
          </div>

          {/* Impact Vehicles */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Programmes
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/programmes/ssi" className="hover:text-gold-400 transition-colors">
                  Secondary Schools Invasion
                </Link>
              </li>
              <li>
                <Link href="/programmes/cs" className="hover:text-gold-400 transition-colors">
                  Campus Sparking
                </Link>
              </li>
              <li>
                <Link href="/programmes/ce" className="hover:text-gold-400 transition-colors">
                  Community Enlightenment
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-gold-400 transition-colors">
                  Documented Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Institution
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/structure" className="hover:text-gold-400 transition-colors">
                  Organisational Structure
                </Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-gold-400 transition-colors">
                  Insights and Resources
                </Link>
              </li>
              <li>
                <Link href="/get-involved" className="hover:text-gold-400 transition-colors">
                  Get Involved
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Trust and Governance
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-400 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-gold-400 transition-colors">
                  Security and Disclosure
                </Link>
              </li>
              <li>
                <Link href="/styleguide" className="hover:text-gold-400 transition-colors">
                  Brand Style Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-8 border-t border-navy-800 text-xs text-navy-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2026 MindSpark Hub. All rights reserved. Registered youth development organisation.
          </p>
          <p className="text-navy-400">
            Compliant with Nigeria Data Protection Act 2023. Zero non essential cookies used.
          </p>
          <p className="text-navy-400">
            Built by{' '}
            <a
              href="https://abrahamcyber.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              Abraham Cyber Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
