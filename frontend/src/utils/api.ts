import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import {
  PronunciationPreference,
  SegmentResponseType,
  UserPreferences,
} from './types';
import { UserLanguage } from '@/localization/main';
import type { AppDispatch } from './store/store';
import { setError, clearError } from '@/utils/store/errorSlice';
import { setPreferences } from './store/settingsSlice';
import { solveCaptcha } from './captcha';

type AnyAction = { type: string; payload?: any };

let _dispatch: AppDispatch | undefined;
let _logout: (() => AnyAction) | undefined;
let _setUserDetails:
  | ((data: { username: string; email: string }) => AnyAction)
  | undefined;

export function injectStore(
  dispatch: AppDispatch,
  logout: () => AnyAction,
  setUserDetails: (data: { username: string; email: string }) => AnyAction,
) {
  _dispatch = dispatch;
  _logout = logout;
  _setUserDetails = setUserDetails;
}

export function getCookie(name: string): string | null {
  if (typeof document !== 'undefined') {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

const API_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000/api' : '/api';
const TIMEOUT = process.env.NODE_ENV === 'development' ? 100000 : 20000;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: TIMEOUT,
});

const errorHandler = (error: {
  message: string;
  response: { status: any };
  code: string;
}) => {
  const statusCode = error.response?.status;
  if (error.code === 'ECONNABORTED') {
    _dispatch?.(
      setError(
        'Connection timeout. The server might be under heavy load. Please try again soon.',
      ),
    );
  }
  if (statusCode === 403) {
    _dispatch?.(
      setError('Authentication error: CSRF token validation failed.'),
    );
  }
  if (statusCode && ![401, 403, 404, 409, 400].includes(statusCode)) {
    _dispatch?.(
      setError(
        'There has been an error connecting to the server. Please try again soon',
      ),
    );
  }
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => {
    _dispatch?.(clearError());
    return response;
  },
  (error) => errorHandler(error),
);

// Sets CSRF token header from cookie on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    (config.headers as AxiosRequestHeaders)['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// --- Captcha pass -----------------------------------------------------------
// Anonymous callers must present a short-lived pass to use /segment. One
// captcha solve buys many segmentations, so the pass is cached here and only
// refreshed when it ages out or the backend says it is no longer good.

const CAPTCHA_PASS_HEADER = 'X-Captcha-Pass';
const CAPTCHA_PASS_REQUIRED = 428;
/** Refresh a little early rather than losing a request to a just-expired pass. */
const PASS_REFRESH_MARGIN_MS = 30_000;

let captchaPass: { value: string; expiresAt: number } | null = null;

export function clearCaptchaPass() {
  captchaPass = null;
}

async function getCaptchaPass(): Promise<string | null> {
  if (captchaPass && Date.now() < captchaPass.expiresAt) {
    return captchaPass.value;
  }

  const solution = await solveCaptcha();
  // No widget, or it could not solve. Send the request anyway and let the
  // backend decide - it may have the captcha switched off entirely.
  if (solution === null) return null;

  const { data } = await api.post('/captcha/verify', { solution });
  captchaPass = {
    value: data.captcha_pass,
    expiresAt: Date.now() + data.expires_in * 1000 - PASS_REFRESH_MARGIN_MS,
  };
  return captchaPass.value;
}

function isCaptchaPassRejected(error: unknown): boolean {
  return (
    (error as { response?: { status?: number } })?.response?.status ===
    CAPTCHA_PASS_REQUIRED
  );
}

export const MandoBotAPI = {
  segment: async function (sentence: string): Promise<SegmentResponseType> {
    const send = async () => {
      const pass = await getCaptchaPass();
      return api.post(
        `/segment?data=${encodeURIComponent(sentence)}`,
        { sentence },
        {
          withCredentials: true,
          headers: pass ? { [CAPTCHA_PASS_HEADER]: pass } : {},
        },
      );
    };

    try {
      return (await send()).data;
    } catch (error) {
      if (!isCaptchaPassRejected(error)) throw error;

      // The pass was stale or forged as far as the backend is concerned.
      // Drop it, solve once more, and try exactly one more time.
      clearCaptchaPass();
      return (await send()).data;
    }
  },

  share: async function (jsonData: SegmentResponseType): Promise<string> {
    const response = await api.post(`/share`, jsonData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  shared: async function (share_id: string): Promise<SegmentResponseType> {
    const response = await api.get(`/shared?share_id=${share_id}`);
    return response.data;
  },

  readingRoomChapter: async function (
    book_slug: string,
    chapter_order: number,
  ) {
    const response = await api.get(
      `/reading-room/${book_slug}/${chapter_order}/`,
    );
    return response.data;
  },

  login: async function (
    username: string,
    password: string,
  ): Promise<UserPreferences> {
    const response = await api.post(
      '/accounts/login',
      new URLSearchParams({
        username,
        password,
        captcha_solution: (await solveCaptcha()) ?? '',
      }),
      { withCredentials: true },
    );
    _dispatch?.(
      setPreferences({
        pronunciation_preference: response.data.pronunciation_preference,
        theme_preference: response.data.theme_preference,
        user_language:
          (localStorage.getItem('user_language') as UserLanguage) ??
          response.data.user_language,
      }),
    );
    return response.data;
  },

  logout: async function (): Promise<string> {
    const response = await api.post(
      '/accounts/logout',
      {},
      { withCredentials: true },
    );
    if (_logout) _dispatch?.(_logout());
    return response.data;
  },

  status: async function (): Promise<{
    updated_at: string;
    translation_backend: string;
    mandobot_response_time: number;
  }> {
    const response = await api.get('/status');
    return response.data;
  },

  register: async function (
    username: string,
    password: string,
    email: string,
  ): Promise<{ message: string }> {
    const response = await api.post(
      '/accounts/register',
      new URLSearchParams({
        username,
        password,
        email,
        captcha_solution: (await solveCaptcha()) ?? '',
      }),
      { withCredentials: true },
    );
    return response.data;
  },

  registerId: async function (registerId: string): Promise<string> {
    const response = await api.get(
      `/accounts/registerId?register_id=${registerId}`,
    );
    return response.data;
  },

  updateCSRF: async function () {
    const response = await api.get('/accounts/csrf', { withCredentials: true });
    document.cookie = `csrfToken=${response.data}; path=/`;
  },

  getUserSettings: async function (): Promise<boolean> {
    try {
      const response = await api.get('/accounts/user_settings', {
        withCredentials: true,
      });
      if (response.data.username) {
        if (_setUserDetails) {
          _dispatch?.(
            _setUserDetails({
              username: response.data.username,
              email: response.data.email,
            }),
          );
        }
        _dispatch?.(
          setPreferences({
            pronunciation_preference: response.data.pronunciation_preference,
            theme_preference: response.data.theme_preference,
            user_language:
              (localStorage.getItem('user_language') as UserLanguage) ??
              response.data.user_language,
          }),
        );
      }
      return true;
    } catch {
      return false;
    }
  },

  pronunciationPreference: async function (
    preference: PronunciationPreference,
  ): Promise<boolean> {
    try {
      await api.post('/accounts/pronunciation_preference', { preference });
      return true;
    } catch {
      return false;
    }
  },

  themePreference: async function (preference: 0 | 1): Promise<boolean> {
    try {
      await api.post('/accounts/theme_preference', { preference });
      return true;
    } catch {
      return false;
    }
  },

  languagePreference: async function (
    language: UserLanguage,
  ): Promise<boolean> {
    try {
      await api.post('/accounts/language_preference', { language });
      return true;
    } catch {
      return false;
    }
  },

  changePassword: async function (
    username: string,
    password: string,
    new_password: string,
    password_confirmation: string,
  ): Promise<boolean> {
    try {
      await api.post(
        '/accounts/change_password',
        new URLSearchParams({
          username,
          password,
          new_password,
          password_confirmation,
        }),
        { withCredentials: true },
      );
      return true;
    } catch {
      return false;
    }
  },

  resetPasswordRequest: async function (
    username: string,
  ): Promise<{ message: string }> {
    const response = await api.post(
      '/accounts/reset_password_request',
      new URLSearchParams({
        username,
        captcha_solution: (await solveCaptcha()) ?? '',
      }),
      { withCredentials: true },
    );
    return response.data;
  },

  resetPassword: async function (
    reset_token: string,
    new_password: string,
    confirmation: string,
  ): Promise<{ message: string }> {
    const response = await api.post(
      '/accounts/reset_password',
      new URLSearchParams({
        reset_token,
        new_password,
        confirmation,
      }),
    );
    return response.data;
  },
};
