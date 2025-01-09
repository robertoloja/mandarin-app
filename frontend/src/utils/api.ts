import axios from 'axios';
import { SegmentResponseType } from './types';
import { store } from './store/store';
import { setError, clearError } from '@/utils/store/errorSlice';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.8:8000/api'
    : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const errorHandler = (error: {
  message: string;
  response: { status: any };
  code: string;
}) => {
  const statusCode = error.response?.status;
  store.dispatch(
    setError(
      'There has been an error connecting to the server. Please try again soon',
    ),
  );

  if (statusCode && statusCode !== 401) {
    console.error(error.code);
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

export const MandoBotAPI = {
  segment: async function (sentence: string): Promise<SegmentResponseType> {
    const response = await api.post(`/segment?data=${sentence}`, {
      sentence: sentence,
    });
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
  ): Promise<{ user: string; token: string }> {
    const response = await api.post(
      '/login',
      { username, password },
      { withCredentials: true },
    );
    return response.data;
  },

  logout: async function (): Promise<string> {
    const response = await api.post('/logout', {}, { withCredentials: true });
    return response.data;
  },
};
