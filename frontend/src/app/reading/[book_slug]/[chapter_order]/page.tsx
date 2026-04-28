import ChapterPageClient from './ChapterPageClient';

export function generateStaticParams() {
  const diary = Array.from({ length: 14 }, (_, i) => ({
    book_slug: 'diary-of-a-madman',
    chapter_order: String(i),
  }));
  const rotk = Array.from({ length: 7 }, (_, i) => ({
    book_slug: 'romance-of-the-three-kingdoms',
    chapter_order: String(i),
  }));
  return [...diary, ...rotk];
}

export default function Page() {
  return <ChapterPageClient />;
}
