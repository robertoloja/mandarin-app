import { Metadata } from 'next';
import ReadingClient from './ReadingClient';

export const metadata: Metadata = {
  title: 'Reading Room',
  description: 'Read classic Chinese literature with word-by-word segmentation, pinyin pronunciation, and English translations.',
};

export default function ReadingPage() {
  return <ReadingClient />;
}
