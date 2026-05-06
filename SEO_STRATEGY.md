# SEO Strategy

## Current state (May 2026)

All Priority 1 and 2 items have been implemented. The site is in good SEO shape.

- Home page has `metadata` export (title, description, OpenGraph + OG image)
- H1 on home page: "Word-by-word pinyin, translation, and definitions for Mandarin Chinese learners" (`WelcomeCardComponent.tsx`)
- `public/robots.txt` blocks `/auth/`, `/settings/`, `/history/`; references sitemap
- `public/sitemap.xml` covers all 24 public URLs (home, reading, about, 21 chapters)
- Chapter pages export `generateMetadata` with per-chapter titles and descriptions
- JSON-LD structured data on home page (`WebApplication`) and chapter pages (`Chapter` + `Book`)
- OG image: `public/OG-image.png` (1200×630, 解 logo + "mandoBot" wordmark on blurred app screenshot)
- Favicon, web manifest, and PWA icons configured
- Next.js `Image` component used throughout (no raw `<img>` tags)
- Site is statically exported (`output: 'export'`), meaning all pages are pre-rendered HTML

## Remaining items

### Open Graph image on chapter pages
Chapter pages currently have no OG image set in `generateMetadata`. A generic fallback (e.g. the same `OG-image.png`) or per-book cover images would improve social sharing appearance for reading room links.

### Welcome card copy
The welcome card on the home page still contains lorem ipsum placeholder text. This is visible to users and affects first impressions — not a crawler signal, but worth replacing before launch.

### German H1 localisation
`home_page.heading.de` in `localization/home_page.ts` is an empty string. Will render blank for German-language users.

## What will not move the needle

- Adding metadata to `/auth`, `/settings` — these should be blocked from crawlers, not optimised
- Keyword stuffing in descriptions
- Backlink schemes

## Content strategy note

The Reading Room is the strongest organic SEO asset: it contains full Chinese literary texts that students and researchers search for. Priority should be given to expanding the Reading Room catalogue and ensuring every chapter has unique, descriptive metadata. When new books are added, `public/sitemap.xml` and `generateStaticParams` in the chapter page must both be updated.

## i18n note

Multiple-language metadata is not feasible with `output: 'export'` and a single URL structure. Proper hreflang support would require separate routes per language (e.g. `/de/`). Not worth pursuing until the German audience is a deliberate growth target.
