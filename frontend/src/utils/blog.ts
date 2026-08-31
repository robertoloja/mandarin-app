/**
 * Build-time blog loader.
 *
 * Posts are markdown files in src/content/blog with a small frontmatter block.
 * This module touches the filesystem, so it may only be imported by server
 * components - it runs during `next build` and never ships to the browser.
 */

import fs from 'node:fs';
import path from 'node:path';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  author: string;
  /** Comma-separated in frontmatter; drives metadata keywords and JSON-LD `about`. */
  keywords: string[];
  /**
   * Unlisted: the post keeps a working URL so it can be previewed or shared,
   * but is hidden from the /blog index. Flip to false to publish.
   */
  draft: boolean;
  body: string;
};

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

type Frontmatter = Record<string, string>;

/**
 * Minimal frontmatter parser: `key: value` lines between --- fences.
 * Deliberately not YAML - a dependency is not worth it for four fields.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const fence = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!fence) return { data: {}, body: raw };

  const data: Frontmatter = {};
  for (const line of fence[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) data[key] = value;
  }

  return { data, body: raw.slice(fence[0].length) };
}

/**
 * Remove HTML comments from a post body.
 *
 * The body is handed to a client component, so it is serialised into the page
 * payload and readable in page source. Notes-to-self kept alongside the prose
 * would therefore be published; stripping them here means the working file and
 * the published article can be the same file.
 */
export function stripComments(body: string): string {
  return body.replace(/<!--[\s\S]*?-->/g, '');
}

function readPost(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || filename.replace(/\.md$/, '');

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || '',
    author: data.author || 'Roberto Loja',
    keywords: (data.keywords || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    draft: data.draft === 'true',
    body: stripComments(body).trim(),
  };
}

/** Every post on disk, drafts included, newest first. */
function readAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.md'))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Published posts only - what the /blog index lists. */
export function getAllPosts(): BlogPost[] {
  return readAllPosts().filter((post) => !post.draft);
}

/**
 * Slugs for every post including drafts, so an unpublished post still gets a
 * routable URL. Static export also requires at least one path here.
 */
export function getAllSlugs(): string[] {
  return readAllPosts().map((post) => post.slug);
}

export function getPost(slug: string): BlogPost | undefined {
  return readAllPosts().find((post) => post.slug === slug);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formatted without `toLocaleDateString` on purpose: the page is prerendered at
 * build time and hydrated in the browser, and a locale-dependent string would
 * differ between the two.
 */
export function formatPostDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
