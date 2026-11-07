import apiClient from './apiClient';

export const publicApi = {
  getBatches: () => apiClient.get('/api/batches'),
  getSubjects: () => apiClient.get('/api/subjects'),
};

export default publicApi;

