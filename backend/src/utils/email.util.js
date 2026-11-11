const emailService = require('../services/email.service');

/**
 * Legacy Email Utility Adapter
 * Re-routes email requests to the Resend EmailService.
 * Preserves backwards compatibility with existing imports.
 */

async function sendLowAttendanceEmail(params) {
  return emailService.sendLowAttendanceEmail(params);
}

async function sendBatchLowAttendanceAlerts(params) {
  return emailService.sendBatchLowAttendanceAlerts(params);
}

module.exports = {
  sendLowAttendanceEmail,
  sendBatchLowAttendanceAlerts,
};
