import { needsCaptchaWidget } from '../src/utils/captchaRoutes';

describe('needsCaptchaWidget', () => {
  it.each([
    ['/', 'home segments text'],
    ['/history', 'history re-segments stored sentences'],
    ['/auth', 'login sends a solution'],
    ['/auth/register', 'register sends a solution'],
    ['/auth/password_reset', 'password reset logs in afterwards'],
  ])('mounts the widget on %s (%s)', (pathname) => {
    expect(needsCaptchaWidget(pathname)).toBe(true);
  });

  it.each([
    ['/blog'],
    ['/blog/friendly-captcha'],
    ['/about'],
    ['/reading'],
    ['/reading/diary-of-a-madman/0'],
    ['/reading/romance-of-the-three-kingdoms/13'],
  ])(
    'skips the widget on %s',
    (pathname) => {
      expect(needsCaptchaWidget(pathname)).toBe(false);
    },
  );

  it.each([['/blogging-tools'], ['/aboutus'], ['/readings']])(
    'does not exempt %s, which merely starts with the same letters',
    (pathname) => {
      expect(needsCaptchaWidget(pathname)).toBe(true);
    },
  );

  it('defaults to mounting when the pathname is unknown', () => {
    expect(needsCaptchaWidget(null)).toBe(true);
    expect(needsCaptchaWidget(undefined)).toBe(true);
  });
});

export {};
