import ChapterPageClient from './ChapterPageClient';

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
  const res = await fetch(
    `${API_BASE}/reading-room/${book_slug}/${chapter_order}/`,
  );
  const chapterData = res.ok ? await res.json() : null;
  return <ChapterPageClient initialData={chapterData} />;
}
