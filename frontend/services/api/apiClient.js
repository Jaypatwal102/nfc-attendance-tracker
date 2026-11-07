import axios from 'axios';
import { getErrorMessage, logDevError } from '@/utils/errorHandler';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization Bearer token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to normalize errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const friendlyMessage = getErrorMessage(error);
    error.friendlyMessage = friendlyMessage;
    error.status = error.response?.status || 0;
    error.errorCode =
      error.response?.data?.code ||
      error.response?.data?.error?.code ||
      'UNKNOWN_ERROR';

    logDevError('API Request Failed', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.status,
      message: friendlyMessage,
    });

    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('nfc:auth:expired'));

      // If not already on /login or home redirect
      if (
        !window.location.pathname.startsWith('/login') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

