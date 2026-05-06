import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import {
  PronunciationPreference,
  SegmentResponseType,
  UserPreferences,
} from './types';
import type { AppDispatch } from './store/store';
import { setError, clearError } from '@/utils/store/errorSlice';
import { setPreferences } from './store/settingsSlice';

type AnyAction = { type: string; payload?: any };

let _dispatch: AppDispatch | undefined;
let _logout: (() => AnyAction) | undefined;
let _setUserDetails: ((data: { username: string; email: string }) => AnyAction) | undefined;

export function injectStore(
  dispatch: AppDispatch,
  logout: () => AnyAction,
  setUserDetails: (data: { username: string; email: string }) => AnyAction,
) {
  _dispatch = dispatch;
  _logout = logout;
  _setUserDetails = setUserDetails;
}
import { UserLanguage } from '@/localization/main';

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

// The response interceptor uses these error handlers.
const errorHandler = (error: {
  message: string;
  response: { status: any };
  code: string;
}) => {
  const statusCode = error.response?.status;
  if (error.code === 'ECONNABORTED') {
    setError(
      'Connection timeout. The server might be under heavy load. Please try again soon.',
    );
  }

  if (statusCode && statusCode === 403) {
    _dispatch?.(setError('Authentication error: CSRF token validation failed.'));
  }

  if (statusCode && ![401, 404, 409, 400].includes(statusCode)) {
    _dispatch?.(
      setError(
        'There has been an error connecting to the server. Please try again soon',
      ),
    );
  }
  return Promise.reject(error);
};

// Response Interceptor: Handle errors
api.interceptors.response.use(
  (response) => {
    _dispatch?.(clearError());
    return response;
  },
  (error) => {
    return errorHandler(error);
  },
);

// Request Interceptor: Sets or gets CSRF token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    (config.headers as AxiosRequestHeaders)['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// API endpoints
export const MandoBotAPI = {
  segment: async function (sentence: string): Promise<SegmentResponseType> {
    const endpoint = `/segment?data=${encodeURIComponent(sentence)}`;

    const response = await api.post(
      endpoint,
      {
        sentence: sentence,
      },
      { withCredentials: true },
    );
    return response.data;
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
      new URLSearchParams({ username, password }),
      {
        withCredentials: true,
      },
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
      new URLSearchParams({ username, password, email }),
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
    await api
      .get('/accounts/csrf', { withCredentials: true })
      .then((response) => {
        document.cookie = `csrfToken=${response.data}; path=/`;
      });
  },

  /**
   * Gets user preferences and sets user info and preferences
   * in the redux store, if user is logged in.
   * @returns Promise<boolean>
   */
  getUserSettings: async function (): Promise<boolean> {
    let result = false;
    await api
      .get('/accounts/user_settings', {
        withCredentials: true,
      })
      .then((response) => {
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
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
  },

  pronunciationPreference: async function (
    preference: PronunciationPreference,
  ): Promise<boolean> {
    let result = false;
    await api
      .post('/accounts/pronunciation_preference', { preference })
      .then(() => {
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
  },

  themePreference: async function (preference: 0 | 1): Promise<boolean> {
    let result = false;
    await api
      .post('/accounts/theme_preference', { preference })
      .then(() => {
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
  },

  languagePreference: async function (
    language: UserLanguage,
  ): Promise<boolean> {
    let result = false;
    await api
      .post('/accounts/language_preference', { language })
      .then(() => {
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
  },

  changePassword: async function (
    username: string,
    password: string,
    new_password: string,
    password_confirmation: string,
  ): Promise<boolean> {
    let result = false;
    await api
      .post(
        '/accounts/change_password',
        new URLSearchParams({
          username,
          password,
          new_password,
          password_confirmation,
        }),
        {
          withCredentials: true,
        },
      )
      .then(() => {
        result = true;
      });
    return result;
  },

  resetPasswordRequest: async function (
    username: string,
  ): Promise<{ message: string }> {
    const response = await api.post(
      '/accounts/reset_password_request',
      new URLSearchParams({
        username,
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
