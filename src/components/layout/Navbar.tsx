'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProgrammesOpen, setIsProgrammesOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/structure', label: 'Our Structure' },
    {
      label: 'Our Programmes',
      children: [
        { href: '/programmes/ssi', label: 'Secondary Schools Invasion' },
        { href: '/programmes/cs', label: 'Campus Sparking' },
        { href: '/programmes/ce', label: 'Community Enlightenment' },
      ],
    },
    { href: '/impact', label: 'Our Impact' },
    { href: '/awards', label: 'Awards' },
    { href: '/insights', label: 'Insights' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo and Name */}
          <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded p-1">
            <div className="relative w-12 h-12 rounded overflow-hidden bg-navy-950 flex-shrink-0 border border-gold-500/30">
              <Image
                src="/brand/mindspark.jpg"
                alt="MindSpark Hub Official Emblem"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                MindSpark <span className="text-gold-500">Hub</span>
              </span>
              <span className="text-xs text-navy-200 tracking-wide font-sans">
                We spark growth and ignite Mindset
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              if (link.children) {
                return (
                  <div key={link.label} className="relative group">
                    <button
                      type="button"
                      onClick={() => setIsProgrammesOpen(!isProgrammesOpen)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname.startsWith('/programmes')
                          ? 'text-gold-500 bg-navy-800'
                          : 'text-navy-100 hover:text-white hover:bg-navy-800'
                      }`}
                      aria-expanded={isProgrammesOpen}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-navy-950 border border-navy-700 py-2 hidden group-hover:block focus-within:block">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(child.href)
                              ? 'text-gold-500 bg-navy-800 font-semibold'
                              : 'text-navy-100 hover:text-white hover:bg-navy-800'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href!)
                      ? 'text-gold-500 bg-navy-800 font-semibold'
                      : 'text-navy-100 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Call to Action Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
            >
              Get Involved
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-navy-200 hover:text-white hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950 px-4 pt-4 pb-6 space-y-2">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label} className="py-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold-400 px-3 py-1">
                    {link.label}
                  </div>
                  <div className="pl-2 space-y-1 mt-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 text-base font-medium rounded-md ${
                          isActive(child.href)
                            ? 'text-gold-500 bg-navy-800 font-semibold'
                            : 'text-navy-100 hover:text-white hover:bg-navy-800'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href!}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  isActive(link.href!)
                    ? 'text-gold-500 bg-navy-800 font-semibold'
                    : 'text-navy-100 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-navy-800">
            <Link
              href="/get-involved"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 text-base font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 rounded transition-colors"
            >
              Get Involved
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
