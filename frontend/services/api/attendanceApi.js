import apiClient from './apiClient';

export const attendanceApi = {
  markNfcAttendance: (data) => apiClient.post('/api/attendance/nfc', data),
};

export default attendanceApi;

