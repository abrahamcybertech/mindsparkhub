import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SkipLink } from '@/components/layout/SkipLink';

export const viewport: Viewport = {
  themeColor: '#0D2748',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://mindsparkhub.org'),
  title: {
    default: 'MindSpark Hub | Official Website',
    template: '%s | MindSpark Hub',
  },
  description:
    'MindSpark Hub equips Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential across classrooms, campuses and communities.',
  keywords: [
    'MindSpark Hub',
    'youth development Nigeria',
    'Secondary Schools Invasion',
    'Campus Sparking',
    'academic excellence Taraba',
    'mentorship Nigeria',
  ],
  authors: [{ name: 'MindSpark Hub Secretariat' }],
  creator: 'MindSpark Hub',
  publisher: 'MindSpark Hub',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://mindsparkhub.org',
    title: 'MindSpark Hub | Where every word lights a fire',
    description:
      'Equipping Nigerians with insights, mindset and motivation to strive for excellence and lead positive change.',
    siteName: 'MindSpark Hub',
    images: [
      {
        url: '/brand/mindspark.jpg',
        width: 667,
        height: 416,
        alt: 'MindSpark Hub Official Emblem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindSpark Hub | Official Website',
    description: 'Equipping Nigerians with insights, mindset and motivation to strive for excellence.',
    images: ['/brand/mindspark.jpg'],
  },
  icons: {
    icon: '/brand/mindspark.jpg',
    apple: '/brand/mindspark.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MindSpark Hub',
    url: 'https://mindsparkhub.org',
    logo: 'https://mindsparkhub.org/brand/mindspark.jpg',
    slogan: 'Where every word lights a fire',
    description:
      'MindSpark Hub equips Nigerians with the insights, mindset and motivation required to strive for excellence, reject mediocrity and unlock their full potential.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Wukari, Taraba State, Nigeria',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
