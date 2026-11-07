import apiClient from './apiClient';

export const adminApi = {
  // Users
  getUsers: (params) => apiClient.get('/api/admin/users', { params }),
  updateUserRole: (id, role) => apiClient.patch(`/api/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, is_active) => apiClient.patch(`/api/admin/users/${id}/status`, { is_active }),

  // Teachers
  getTeachers: () => apiClient.get('/api/admin/teachers'),
  getTeacherById: (id) => apiClient.get(`/api/admin/teachers/${id}`),
  createTeacher: (data) => apiClient.post('/api/admin/teachers', data),

  // Students
  getStudents: (params) => apiClient.get('/api/admin/students', { params }),
  getStudentById: (id) => apiClient.get(`/api/admin/students/${id}`),
  updateStudent: (id, data) => apiClient.patch(`/api/admin/students/${id}`, data),

  // Batches
  getBatches: () => apiClient.get('/api/batches'),
  createBatch: (data) => apiClient.post('/api/admin/batches', data),
  getBatchById: (id) => apiClient.get(`/api/admin/batches/${id}`),
  updateBatch: (id, data) => apiClient.patch(`/api/admin/batches/${id}`, data),

  // Subjects
  getSubjects: () => apiClient.get('/api/subjects'),
  createSubject: (data) => apiClient.post('/api/admin/subjects', data),
  getSubjectById: (id) => apiClient.get(`/api/admin/subjects/${id}`),
  updateSubject: (id, data) => apiClient.patch(`/api/admin/subjects/${id}`, data),
  updateSubjectStatus: (id, is_active) => apiClient.patch(`/api/admin/subjects/${id}/status`, { is_active }),

  // Mappings
  getTeacherSubjectMappings: (params) => apiClient.get('/api/admin/teacher-subject-mappings', { params }),
  createTeacherSubjectMapping: (data) => apiClient.post('/api/admin/teacher-subject-mappings', data),
  assignTeacherSubject: (data) => apiClient.post('/api/admin/teacher-subject-mappings', data),
  deleteTeacherSubjectMapping: (id) => apiClient.delete(`/api/admin/teacher-subject-mappings/${id}`),

  getStudentSubjectMappings: (params) => apiClient.get('/api/admin/student-subject-mappings', { params }),
  createStudentSubjectMapping: (data) => apiClient.post('/api/admin/student-subject-mappings', data),
  assignStudentSubject: (data) => apiClient.post('/api/admin/student-subject-mappings', data),
  deleteStudentSubjectMapping: (id) => apiClient.delete(`/api/admin/student-subject-mappings/${id}`),
};

export default adminApi;

