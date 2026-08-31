/**
 * Which routes should mount the Friendly Captcha widget.
 *
 * The widget begins a proof-of-work as soon as it mounts, so running it on
 * static content is pure waste. This is an exclusion list rather than an
 * allow-list on purpose: forgetting to exempt a page costs one wasted solve,
 * while forgetting to allow one would break segmentation with a 428.
 */

export const CAPTCHA_EXEMPT_PREFIXES = [
  // Static writing.
  '/blog',
  '/about',
  // The reading room serves prebuilt chapters and never calls /segment.
  '/reading',
];

export function needsCaptchaWidget(pathname: string | null | undefined): boolean {
  const path = pathname ?? '';
  return !CAPTCHA_EXEMPT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
