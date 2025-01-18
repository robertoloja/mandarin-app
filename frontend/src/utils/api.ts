import axios from 'axios';
import { PronunciationPreference, SegmentResponseType } from './types';
import { store } from './store/store';
import { setError, clearError } from '@/utils/store/errorSlice';
import { logout, setUsername } from './store/authSlice';
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
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.8:8000/api'
    : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

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

  if (statusCode === 403) {
    store.dispatch(
      setError('Authentication error: CSRF token validation failed.'),
    );
  }

  if (statusCode && statusCode !== 401) {
    store.dispatch(
      setError(
        'There has been an error connecting to the server. Please try again soon',
      ),
    );
  }
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => {
    store.dispatch(clearError());
    return response;
  },
  (error) => {
    return errorHandler(error);
  },
);

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

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
  ): Promise<{
    user: string;
    email: string;
    pronunciation_preference: PronunciationPreference;
    theme_preference: number;
  }> {
    const response = await api.post(
      '/login',
      new URLSearchParams({ username, password }),
      {
        withCredentials: true,
      },
    );
    store.dispatch(setUsername(response.data.username));
    store.dispatch(
      setPreferences({
        pronunciation_preference: response.data.pronunciation_preference,
        theme_preference: response.data.theme_preference,
      }),
    );
    return response.data;
  },

  logout: async function (): Promise<string> {
    const response = await api.post('/logout', {}, { withCredentials: true });
    console.log(response.data);
    store.dispatch(logout());
    return response.data;
  },

  status: async function (): Promise<{
    updated_at: string;
    translation_backend: string;
    average_response_time: number;
  }> {
    const response = await api.get('/status');
    return response.data;
  },
};
