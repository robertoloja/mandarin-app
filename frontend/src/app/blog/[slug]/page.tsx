import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatPostDate, getAllSlugs, getPost } from '@/utils/blog';
import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Writing' };

  const url = `https://www.mandobot.com/blog/${post.slug}/`;
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.keywords,
    alternates: { canonical: url },
    // Drafts keep a working URL so they can be shared directly, but must not
    // be indexed - "unlisted" is not the same as "private".
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${post.title} — mandoBot`,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: '/OG-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — mandoBot`,
      description: post.description,
      images: ['/OG-image.png'],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `https://www.mandobot.com/blog/${post.slug}/`;

  // BlogPosting rather than Article: it states authorship, dates and subject
  // matter as machine-readable facts, which is what both search engines and
  // answer engines extract. Named subjects go in `about` so the topic of the
  // piece is explicit rather than inferred from prose.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en',
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'mandoBot',
      url: 'https://www.mandobot.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.mandobot.com/OG-image.png',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    image: 'https://www.mandobot.com/OG-image.png',
    keywords: post.keywords.join(', '),
    about: post.keywords.map((name) => ({ '@type': 'Thing', name })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient
        title={post.title}
        author={post.author}
        dateLabel={formatPostDate(post.date)}
        dateISO={post.date}
        body={post.body}
      />
    </>
  );
}
