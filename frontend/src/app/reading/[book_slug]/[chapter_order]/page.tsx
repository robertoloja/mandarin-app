import { Metadata } from 'next';
import ChapterPageClient from './ChapterPageClient';

const BOOK_META: Record<string, { title: string; author: string }> = {
  'diary-of-a-madman': { title: 'Diary of a Madman', author: 'Lu Xun' },
  'romance-of-the-three-kingdoms': { title: 'Romance of the Three Kingdoms', author: 'Luo Guanzhong' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book_slug: string; chapter_order: string }>;
}): Promise<Metadata> {
  const { book_slug, chapter_order } = await params;
  const book = BOOK_META[book_slug];
  const bookTitle = book?.title ?? book_slug;
  const chapterNum = Number(chapter_order) + 1;
  return {
    title: `${bookTitle}, Chapter ${chapterNum}`,
    description: `Read Chapter ${chapterNum} of ${bookTitle} in the original Chinese with word-by-word segmentation and English translation.`,
  };
}

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000/api'
    : `${process.env.URL}/api`;

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

export default async function Page({
  params,
}: {
  params: Promise<{ book_slug: string; chapter_order: string }>;
}) {
  const { book_slug, chapter_order } = await params;
  const book = BOOK_META[book_slug];
  const chapterNum = Number(chapter_order) + 1;
  const res = await fetch(
    `${API_BASE}/reading-room/${book_slug}/${chapter_order}/`,
  );
  const chapterData = res.ok ? await res.json() : null;

  const jsonLd = book
    ? {
        '@context': 'https://schema.org',
        '@type': 'Chapter',
        name: `${book.title}, Chapter ${chapterNum}`,
        isPartOf: {
          '@type': 'Book',
          name: book.title,
          author: { '@type': 'Person', name: book.author },
          inLanguage: 'zh',
        },
        url: `https://www.mandobot.com/reading/${book_slug}/${chapter_order}/`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ChapterPageClient initialData={chapterData} />
    </>
  );
}
