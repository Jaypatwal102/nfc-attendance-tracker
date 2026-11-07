import apiClient from './apiClient';

export const teacherApi = {
  getSubjects: () => apiClient.get('/api/teacher/subjects'),
  getBatches: () => apiClient.get('/api/teacher/batches'),
  getAssignments: () => apiClient.get('/api/teacher/assignments'),
  getEnrolledStudents: (params) => apiClient.get('/api/teacher/students', { params }),
  createSession: (data) => apiClient.post('/api/teacher/attendance-sessions', data),
  getSessions: (params) => apiClient.get('/api/teacher/attendance-sessions', { params }),
  getSessionById: (id) => apiClient.get(`/api/teacher/attendance-sessions/${id}`),
  updateAttendance: (id, data) => apiClient.patch(`/api/teacher/attendance/${id}`, data),
  getAttendance: (params) => apiClient.get('/api/teacher/attendance', { params }),
  getStatistics: (params) => apiClient.get('/api/teacher/attendance/statistics', { params }),
  getLowAttendance: (params) => apiClient.get('/api/teacher/low-attendance', { params }),
  sendLowAttendanceEmail: (data) => apiClient.post('/api/teacher/low-attendance/send-email', data),
  markAttendance: (data) => apiClient.post('/api/attendance/nfc', data),
};

export default teacherApi;

