import { Metadata } from 'next';
import { formatPostDate, getAllPosts } from '@/utils/blog';
import BlogIndexClient from './BlogIndexClient';

export const metadata: Metadata = {
  title: 'Writing',
  alternates: { canonical: 'https://www.mandobot.com/blog/' },
  description:
    'Notes on building mandoBot: Mandarin text segmentation, translation, and the engineering behind them.',
  openGraph: {
    title: 'Writing — mandoBot',
    description:
      'Notes on building mandoBot: Mandarin text segmentation, translation, and the engineering behind them.',
    url: 'https://www.mandobot.com/blog/',
    type: 'website',
    images: [{ url: '/OG-image.png', width: 1200, height: 630 }],
  },
};

export default function BlogIndexPage() {
  const published = getAllPosts();

  const posts = published.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    dateLabel: formatPostDate(post.date),
  }));

  // Declares the collection and its members, so a crawler or answer engine can
  // enumerate the posts without parsing the page layout.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'mandoBot — Writing',
    url: 'https://www.mandobot.com/blog/',
    inLanguage: 'en',
    blogPost: published.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@type': 'Person', name: post.author },
      url: `https://www.mandobot.com/blog/${post.slug}/`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogIndexClient posts={posts} />
    </>
  );
}
