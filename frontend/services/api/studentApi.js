import apiClient from './apiClient';

export const studentApi = {
  getProfile: () => apiClient.get('/api/student/profile'),
  getAttendance: (params) => apiClient.get('/api/student/attendance', { params }),
  getSummary: () => apiClient.get('/api/student/attendance/summary'),
  getSubjects: () => apiClient.get('/api/subjects'),
};

export default studentApi;

