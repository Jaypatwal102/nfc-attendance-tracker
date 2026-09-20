const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const student = require('../controllers/student.controller');

// Enforce STUDENT role guard for all student endpoints
router.use(authenticate, requireRole('STUDENT'));

router.get('/profile', student.getProfile);
router.get('/attendance', student.getAttendanceHistory);
router.get('/attendance/summary', student.getAttendanceSummary);

module.exports = router;
