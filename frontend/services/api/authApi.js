import apiClient from './apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (data) => apiClient.post('/api/auth/register', data),
  getMe: () => apiClient.get('/api/auth/me'),
};

export default authApi;

