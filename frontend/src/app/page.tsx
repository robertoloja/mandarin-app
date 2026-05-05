import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'mandoBot',
  description:
    'Paste any Mandarin text to get instant word-by-word segmentation, pinyin pronunciation, and English translations.',
  openGraph: {
    title: 'mandoBot — Mandarin segmentation and translation',
    description:
      'Paste any Mandarin text to get instant word-by-word segmentation, pinyin pronunciation, and English translations.',
    type: 'website',
  },
};

export default function Home() {
  return <HomeClient />;
}
