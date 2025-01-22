import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import {
  PronunciationPreference,
  SegmentResponseType,
  UserPreferences,
} from './types';
import { store } from './store/store';
import { setError, clearError } from '@/utils/store/errorSlice';
import { logout, setUserDetails } from './store/authSlice';
import { MAX_LENGTH_FREE } from 'constant_variables';
import { setPreferences } from './store/settingsSlice';

export function getCookie(name: string): string | null {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

const API_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
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
    store.dispatch(
      setError('Authentication error: CSRF token validation failed.'),
    );
  }

  if (statusCode && ![401, 404, 409, 400].includes(statusCode)) {
    store.dispatch(
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
    store.dispatch(clearError());
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
    const response = await api.post(
      `/segment?data=${sentence.slice(0, MAX_LENGTH_FREE)}`,
      {
        sentence: sentence,
      },
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
    store.dispatch(
      setPreferences({
        pronunciation_preference: response.data.pronunciation_preference,
        theme_preference: response.data.theme_preference,
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
    store.dispatch(logout());
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
  ): Promise<{ success: boolean; message: string }> {
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
        store.dispatch(
          setUserDetails({
            username: response.data.username,
            email: response.data.email,
          }),
        );
        store.dispatch(
          setPreferences({
            pronunciation_preference: response.data.pronunciation_preference,
            theme_preference: response.data.theme_preference,
          }),
        );
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
};
