const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const teacher = require('../controllers/teacher.controller');

// Protect all teacher endpoints with TEACHER role requirement
router.use(authenticate, requireRole('TEACHER'));

// Dashboard
router.get('/subjects', teacher.getAssignedSubjects);
router.get('/batches', teacher.getAssignedBatches);
router.get('/assignments', teacher.getAssignments);
router.get('/students', teacher.getEnrolledStudents);

// Sessions
router.post('/attendance-sessions', teacher.createAttendanceSession);
router.get('/attendance-sessions', teacher.getAttendanceSessions);
router.get('/attendance-sessions/:id', teacher.getAttendanceSessionById);

// Manual Updates
router.patch('/attendance/:id', teacher.updateAttendance);

// Reports & Low Attendance
router.get('/attendance', teacher.getAttendance);
router.get('/attendance/statistics', teacher.getAttendanceStatistics);
router.get('/low-attendance', teacher.getLowAttendance);
router.post('/low-attendance/send-email', teacher.sendLowAttendanceEmailAction);

module.exports = router;
