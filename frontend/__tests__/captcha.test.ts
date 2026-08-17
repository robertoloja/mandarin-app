/**
 * The widget module owns the Friendly Captcha widget and nothing else: it turns
 * the widget into a promise for a solution string. The pass it gets exchanged
 * for lives in the API client, so nothing here touches the network.
 */

const createWidget = jest.fn();
const start = jest.fn();
const reset = jest.fn();
const destroy = jest.fn();

jest.mock('@friendlycaptcha/sdk', () => ({
  FriendlyCaptchaSDK: jest.fn().mockImplementation(() => ({ createWidget })),
}));

const COMPLETE = 'frc:widget.complete';
const ERROR = 'frc:widget.error';

async function loadModule() {
  jest.resetModules();
  createWidget.mockImplementation(() => ({ start, reset, destroy }));
  return import('@/utils/captcha');
}

function mountElement() {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
}

function completeWith(element: HTMLElement, response: string) {
  element.dispatchEvent(new CustomEvent(COMPLETE, { detail: { response } }));
}

describe('solveCaptcha', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('resolves with the solution the widget produces', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    const solution = captcha.solveCaptcha();
    completeWith(element, 'a-solution');

    await expect(solution).resolves.toBe('a-solution');
  });

  it('resolves null when no widget has been mounted', async () => {
    const captcha = await loadModule();
    await expect(captcha.solveCaptcha()).resolves.toBeNull();
  });

  it('resolves null when the widget reports an error', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    const solution = captcha.solveCaptcha();
    element.dispatchEvent(
      new CustomEvent(ERROR, { detail: { error: { code: 'network_error' } } }),
    );

    await expect(solution).resolves.toBeNull();
  });

  it('uses a solution the widget already produced without solving again', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    completeWith(element, 'solved-on-mount');

    await expect(captcha.solveCaptcha()).resolves.toBe('solved-on-mount');
    expect(reset).not.toHaveBeenCalled();
  });

  it('does not hand the same single-use solution out twice', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    completeWith(element, 'first');
    await expect(captcha.solveCaptcha()).resolves.toBe('first');

    const second = captcha.solveCaptcha();
    completeWith(element, 'second');
    await expect(second).resolves.toBe('second');
  });

  it('resets the widget to obtain a fresh solution', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    completeWith(element, 'first');
    await captcha.solveCaptcha();

    const second = captcha.solveCaptcha();
    completeWith(element, 'second');
    await second;

    expect(reset).toHaveBeenCalled();
  });

  it('shares one solve between concurrent callers', async () => {
    const captcha = await loadModule();
    const element = mountElement();
    captcha.setCaptchaWidgetElement(element);

    const first = captcha.solveCaptcha();
    const second = captcha.solveCaptcha();
    completeWith(element, 'shared');

    await expect(first).resolves.toBe('shared');
    await expect(second).resolves.toBe('shared');
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('gives up rather than hanging when the widget never completes', async () => {
    jest.useFakeTimers();
    try {
      const captcha = await loadModule();
      const element = mountElement();
      captcha.setCaptchaWidgetElement(element);

      const solution = captcha.solveCaptcha();
      jest.advanceTimersByTime(captcha.SOLVE_TIMEOUT_MS);

      await expect(solution).resolves.toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('setCaptchaWidgetElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('creates a widget that starts solving immediately', async () => {
    const captcha = await loadModule();
    captcha.setCaptchaWidgetElement(mountElement());

    expect(createWidget).toHaveBeenCalledTimes(1);
    expect(createWidget.mock.calls[0][0]).toMatchObject({ startMode: 'auto' });
  });

  it('destroys the previous widget when unmounted', async () => {
    const captcha = await loadModule();
    captcha.setCaptchaWidgetElement(mountElement());
    captcha.setCaptchaWidgetElement(null);

    expect(destroy).toHaveBeenCalledTimes(1);
  });
});

export {};
