/**
 * Owns the Friendly Captcha widget.
 *
 * Its whole job is turning the widget into a promise for a solution string.
 * Exchanging that solution for a pass is the API client's business, which keeps
 * the dependency running one way: api.ts -> captcha.ts.
 */

import { FriendlyCaptchaSDK, type WidgetHandle } from '@friendlycaptcha/sdk';

/** How long to wait for a proof of work before giving up on the widget. */
export const SOLVE_TIMEOUT_MS = 20_000;

const COMPLETE_EVENT = 'frc:widget.complete';
const ERROR_EVENT = 'frc:widget.error';
const SITEKEY = process.env.NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITEKEY ?? '';

let sdk: FriendlyCaptchaSDK | null = null;
let widget: WidgetHandle | null = null;
let element: HTMLElement | null = null;

/** A solved, unused proof of work waiting to be handed to a caller. */
let readySolution: string | null = null;
let inFlight: Promise<string | null> | null = null;
let pendingResolve: ((solution: string | null) => void) | null = null;
let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

function settle(solution: string | null) {
  if (!pendingResolve) return;

  const resolve = pendingResolve;
  pendingResolve = null;

  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }

  // Solutions are single-use, so handing one over consumes it.
  if (solution !== null) readySolution = null;
  resolve(solution);
}

function handleComplete(event: Event) {
  const solution = (event as CustomEvent).detail?.response ?? null;
  readySolution = solution;
  settle(solution);
}

function handleError() {
  settle(null);
}

/**
 * Mount or unmount the widget. Called by the React component that renders the
 * widget's container; passing null tears the widget down.
 */
export function setCaptchaWidgetElement(el: HTMLElement | null): void {
  if (element) {
    element.removeEventListener(COMPLETE_EVENT, handleComplete);
    element.removeEventListener(ERROR_EVENT, handleError);
  }
  if (widget) {
    widget.destroy();
    widget = null;
  }

  readySolution = null;
  element = el;
  if (!el) return;

  sdk = sdk ?? new FriendlyCaptchaSDK();
  el.addEventListener(COMPLETE_EVENT, handleComplete);
  el.addEventListener(ERROR_EVENT, handleError);

  // "auto" starts the proof of work as soon as the widget exists, so a solution
  // is usually waiting by the time the reader submits anything.
  widget = sdk.createWidget({
    element: el,
    sitekey: SITEKEY,
    startMode: 'auto',
  });
}

/**
 * Resolve with a fresh, unused solution, or null if the widget cannot produce
 * one. Never rejects: a captcha the user cannot solve is the API client's
 * problem to report, not an exception to handle at every call site.
 */
export function solveCaptcha(): Promise<string | null> {
  if (!widget || !element) return Promise.resolve(null);

  if (readySolution !== null) {
    const solution = readySolution;
    readySolution = null;
    return Promise.resolve(solution);
  }

  if (inFlight) return inFlight;

  widget.reset();
  widget.start();

  inFlight = new Promise<string | null>((resolve) => {
    pendingResolve = resolve;
    timeoutHandle = setTimeout(() => settle(null), SOLVE_TIMEOUT_MS);
  }).finally(() => {
    inFlight = null;
  });

  return inFlight;
}
