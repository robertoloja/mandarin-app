import axios from 'axios';
import { SegmentResponseType } from './types';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.8:8000/api'
    : 'https://mandobot.pythonanywhere.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const errorHandler = (error: { response: { status: any }; code: string }) => {
  const statusCode = error.response?.status;

  if (statusCode && statusCode !== 401) {
    console.error(error);
  }
  return Promise.reject(error);
};

api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});

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
