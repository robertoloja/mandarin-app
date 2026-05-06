import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: { absolute: 'mandoBot' },
  description:
    'Paste any Mandarin text to get instant word-by-word segmentation, pronunciation, and translations.',
  openGraph: {
    title: 'mandoBot — Mandarin segmentation and translation',
    description:
      'Paste any Mandarin text to get instant word-by-word segmentation, pronunciation, and translations.',
    url: 'https://www.mandobot.com',
    type: 'website',
    images: [{ url: '/OG-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mandoBot — Mandarin segmentation and translation',
    description:
      'Paste any Mandarin text to get instant word-by-word segmentation, pronunciation, and translations.',
    images: ['/OG-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'mandoBot',
  description:
    'Word-by-word pronunciation, translation, and definitions for Mandarin Chinese learners',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web',
  url: 'https://www.mandobot.com',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
