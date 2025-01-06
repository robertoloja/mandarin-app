import axios from 'axios';
import { SegmentResponseType } from './types';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://0.0.0.0:8000/api'
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
    const response = await api.post(`/segment?data=${sentence}`);
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
};
