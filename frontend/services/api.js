import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// Logical API Modules
// ----------------------------------------------------

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
};

export const adminApi = {
  // Users
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, is_active) => api.patch(`/api/admin/users/${id}/status`, { is_active }),
  
  // Teachers
  getTeachers: () => api.get('/api/admin/teachers'),
  getTeacherById: (id) => api.get(`/api/admin/teachers/${id}`),
  createTeacher: (data) => api.post('/api/admin/teachers', data),
  
  // Students
  getStudents: (params) => api.get('/api/admin/students', { params }),
  getStudentById: (id) => api.get(`/api/admin/students/${id}`),
  updateStudent: (id, data) => api.patch(`/api/admin/students/${id}`, data),
  
  // Batches
  createBatch: (data) => api.post('/api/admin/batches', data),
  getBatchById: (id) => api.get(`/api/admin/batches/${id}`),
  updateBatch: (id, data) => api.patch(`/api/admin/batches/${id}`, data),
  
  // Subjects
  createSubject: (data) => api.post('/api/admin/subjects', data),
  getSubjectById: (id) => api.get(`/api/admin/subjects/${id}`),
  updateSubject: (id, data) => api.patch(`/api/admin/subjects/${id}`, data),
  updateSubjectStatus: (id, is_active) => api.patch(`/api/admin/subjects/${id}/status`, { is_active }),
  
  // Mappings
  getTeacherSubjectMappings: (params) => api.get('/api/admin/teacher-subject-mappings', { params }),
  createTeacherSubjectMapping: (data) => api.post('/api/admin/teacher-subject-mappings', data),
  deleteTeacherSubjectMapping: (id) => api.delete(`/api/admin/teacher-subject-mappings/${id}`),
  
  getStudentSubjectMappings: (params) => api.get('/api/admin/student-subject-mappings', { params }),
  createStudentSubjectMapping: (data) => api.post('/api/admin/student-subject-mappings', data),
  deleteStudentSubjectMapping: (id) => api.delete(`/api/admin/student-subject-mappings/${id}`),
};

export const teacherApi = {
  getSubjects: () => api.get('/api/teacher/subjects'),
  getBatches: () => api.get('/api/teacher/batches'),
  getAssignments: () => api.get('/api/teacher/assignments'),
  createSession: (data) => api.post('/api/teacher/attendance-sessions', data),
  getSessions: (params) => api.get('/api/teacher/attendance-sessions', { params }),
  getSessionById: (id) => api.get(`/api/teacher/attendance-sessions/${id}`),
  updateAttendance: (id, data) => api.patch(`/api/teacher/attendance/${id}`, data),
  getAttendance: (params) => api.get('/api/teacher/attendance', { params }),
  getStatistics: (params) => api.get('/api/teacher/attendance/statistics', { params }),
  getLowAttendance: (params) => api.get('/api/teacher/low-attendance', { params }),
  sendLowAttendanceEmail: (data) => api.post('/api/teacher/low-attendance/send-email', data),
};

export const attendanceApi = {
  markNfcAttendance: (data) => api.post('/api/attendance/nfc', data),
};

export const studentApi = {
  getProfile: () => api.get('/api/student/profile'),
  getAttendance: (params) => api.get('/api/student/attendance', { params }),
  getSummary: () => api.get('/api/student/attendance/summary'),
};

export const publicApi = {
  getBatches: () => api.get('/api/batches'),
  getSubjects: () => api.get('/api/subjects'),
};

export default api;
