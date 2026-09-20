const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { markNfcAttendance } = require('../controllers/attendance.controller');

// Authenticated NFC scan route
router.post('/nfc', authenticate, markNfcAttendance);

module.exports = router;
