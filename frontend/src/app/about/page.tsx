import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About',
  description:
    'mandoBot is a free Mandarin Chinese learning tool. Paste any text to get word-by-word segmentation, pronunciation, and translations.',
};

export default function AboutPage() {
  return <AboutClient />;
}
