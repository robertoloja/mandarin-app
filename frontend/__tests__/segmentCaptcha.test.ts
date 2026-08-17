/**
 * /segment is gated by a short-lived captcha pass. The API client is what holds
 * that pass, attaches it, and recovers when the backend says it has gone stale.
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

const PASS_TTL_SECONDS = 1800;

function passResponse(captcha_pass = 'a-pass', expires_in = PASS_TTL_SECONDS) {
  return { data: { captcha_pass, expires_in } };
}

function segmentResponse(sentence = 'ok') {
  return { data: { sentence } };
}

function rejectionWithStatus(status: number) {
  return Object.assign(new Error(`HTTP ${status}`), { response: { status } });
}

async function loadApi() {
  jest.resetModules();
  return (await import('../src/utils/api')).MandoBotAPI;
}

/** Route calls by URL so tests can stay agnostic about call ordering. */
function routePost(handlers: {
  verify?: () => unknown;
  segment?: () => unknown;
}) {
  post.mockImplementation((url: string) => {
    if (url.includes('/captcha/verify')) {
      return Promise.resolve((handlers.verify ?? passResponse)());
    }
    return Promise.resolve((handlers.segment ?? segmentResponse)());
  });
}

function segmentCallHeaders() {
  const call = post.mock.calls.find(
    ([url]) => !String(url).includes('/captcha/verify'),
  );
  return call?.[2]?.headers ?? {};
}

describe('MandoBotAPI.segment captcha pass handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    solveCaptcha.mockResolvedValue('a-solution');
  });

  it('exchanges a solution for a pass and sends it with the segment request', async () => {
    routePost({});
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.segment('你好');

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/captcha/verify'),
      { solution: 'a-solution' },
    );
    expect(segmentCallHeaders()['X-Captcha-Pass']).toBe('a-pass');
  });

  it('reuses the pass across calls instead of solving every time', async () => {
    routePost({});
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.segment('你好');
    await MandoBotAPI.segment('再見');

    expect(solveCaptcha).toHaveBeenCalledTimes(1);
  });

  it('solves again once the pass has expired', async () => {
    routePost({ verify: () => passResponse('short-lived', 0) });
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.segment('你好');
    await MandoBotAPI.segment('再見');

    expect(solveCaptcha).toHaveBeenCalledTimes(2);
  });

  it('re-solves and retries once when the backend rejects the pass', async () => {
    let segmentAttempts = 0;
    post.mockImplementation((url: string) => {
      if (url.includes('/captcha/verify'))
        return Promise.resolve(passResponse());
      segmentAttempts += 1;
      return segmentAttempts === 1
        ? Promise.reject(rejectionWithStatus(428))
        : Promise.resolve(segmentResponse('served'));
    });
    const MandoBotAPI = await loadApi();

    await expect(MandoBotAPI.segment('你好')).resolves.toEqual({
      sentence: 'served',
    });
    expect(solveCaptcha).toHaveBeenCalledTimes(2);
  });

  it('gives up rather than retrying forever when the pass keeps being rejected', async () => {
    post.mockImplementation((url: string) => {
      if (url.includes('/captcha/verify'))
        return Promise.resolve(passResponse());
      return Promise.reject(rejectionWithStatus(428));
    });
    const MandoBotAPI = await loadApi();

    await expect(MandoBotAPI.segment('你好')).rejects.toMatchObject({
      response: { status: 428 },
    });
    expect(solveCaptcha).toHaveBeenCalledTimes(2);
  });

  it('does not retry errors that have nothing to do with the captcha', async () => {
    let segmentAttempts = 0;
    post.mockImplementation((url: string) => {
      if (url.includes('/captcha/verify'))
        return Promise.resolve(passResponse());
      segmentAttempts += 1;
      return Promise.reject(rejectionWithStatus(500));
    });
    const MandoBotAPI = await loadApi();

    await expect(MandoBotAPI.segment('你好')).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(segmentAttempts).toBe(1);
  });

  it('still sends the request when the widget cannot produce a solution', async () => {
    solveCaptcha.mockResolvedValue(null);
    routePost({});
    const MandoBotAPI = await loadApi();

    await MandoBotAPI.segment('你好');

    const verifyCalled = post.mock.calls.some(([url]) =>
      String(url).includes('/captcha/verify'),
    );
    expect(verifyCalled).toBe(false);
    expect(segmentCallHeaders()['X-Captcha-Pass']).toBeUndefined();
  });
});

export {};
