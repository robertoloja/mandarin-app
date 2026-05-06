import { Metadata } from 'next';
import ReadingClient from './ReadingClient';

export const metadata: Metadata = {
  title: 'Reading Room',
  description:
    'Read classic Chinese literature with word-by-word segmentation, pronunciation, and translations.',
  openGraph: {
    title: 'Reading Room — mandoBot',
    description:
      'Read classic Chinese literature with word-by-word segmentation, pronunciation, and translations.',
    url: 'https://www.mandobot.com/reading/',
    type: 'website',
    images: [{ url: '/OG-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reading Room — mandoBot',
    description:
      'Read classic Chinese literature with word-by-word segmentation, pronunciation, and translations.',
    images: ['/OG-image.png'],
  },
};

export default function ReadingPage() {
  return <ReadingClient />;
}
