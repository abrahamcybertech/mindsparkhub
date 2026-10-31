'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export interface GalleryImage {
  id: string;
  title: string;
  caption: string;
  alt_text: string;
  category: string;
  image_url: string;
  is_minor_depicted?: number;
  consent_reference?: string;
}

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const currentImage = images[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 backdrop-blur-sm p-4 sm:p-6"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-navy-900/80 text-white hover:text-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-navy-900/80 text-white hover:text-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image and Details Container */}
      <div className="max-w-5xl w-full flex flex-col items-center">
        <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-lg overflow-hidden bg-black flex items-center justify-center">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Captions and Safeguarding Verification */}
        <div className="w-full mt-4 bg-navy-900 p-4 rounded-lg text-white border border-navy-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gold-400 font-serif">
                {currentImage.title}
              </h3>
              <p className="text-sm text-navy-200 mt-1">
                {currentImage.caption}
              </p>
            </div>
            {currentImage.is_minor_depicted === 1 && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>Safeguarded Minor Consent Verified</span>
              </div>
            )}
          </div>
          <div className="text-xs text-navy-400 mt-3 pt-2 border-t border-navy-800 flex justify-between">
            <span>Category: {currentImage.category.toUpperCase()}</span>
            <span>{currentIndex + 1} of {images.length}</span>
          </div>
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={() => onNavigate((currentIndex + 1) % images.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-navy-900/80 text-white hover:text-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
