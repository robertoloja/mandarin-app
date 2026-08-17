/**
 * The account forms are one-shot submissions, so each sends its own single-use
 * captcha solution rather than reusing the timed pass that /segment relies on.
 */

const post = jest.fn();
const get = jest.fn();
const solveCaptcha = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post,
      get,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  },
}));

jest.mock('../src/utils/captcha', () => ({
  solveCaptcha: () => solveCaptcha(),
  setCaptchaWidgetElement: jest.fn(),
  SOLVE_TIMEOUT_MS: 20000,
}));

async function loadApi() {
  jest.resetModules();
  return (await import('../src/utils/api')).MandoBotAPI;
}

/** The account endpoints post form-encoded bodies. */
function sentField(callIndex: number, field: string) {
  const body = post.mock.calls[callIndex][1] as URLSearchParams;
  return body.get(field);
}

describe('account endpoints send a captcha solution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    solveCaptcha.mockResolvedValue('a-solution');
    post.mockResolvedValue({ data: {} });
  });

  it('login sends a freshly solved captcha', async () => {
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.login('tester', 'a-password');

    expect(solveCaptcha).toHaveBeenCalledTimes(1);
    expect(sentField(0, 'captcha_solution')).toBe('a-solution');
    expect(sentField(0, 'username')).toBe('tester');
  });

  it('register sends a freshly solved captcha', async () => {
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.register('newcomer', 'a-password', 'new@example.com');

    expect(sentField(0, 'captcha_solution')).toBe('a-solution');
    expect(sentField(0, 'email')).toBe('new@example.com');
  });

  it('password reset request sends a freshly solved captcha', async () => {
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.resetPasswordRequest('tester@example.com');

    expect(sentField(0, 'captcha_solution')).toBe('a-solution');
  });

  it('submits an empty solution when the widget cannot produce one', async () => {
    solveCaptcha.mockResolvedValue(null);
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.resetPasswordRequest('tester@example.com');

    expect(sentField(0, 'captcha_solution')).toBe('');
  });

  it('does not reuse one solution across two submissions', async () => {
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.resetPasswordRequest('tester@example.com');
    await MandoBotAPI.resetPasswordRequest('tester@example.com');

    expect(solveCaptcha).toHaveBeenCalledTimes(2);
  });
});

export {};
