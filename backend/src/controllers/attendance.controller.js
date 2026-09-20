const attendanceValidationService = require('../services/attendanceValidation.service');

/**
 * Handles NFC scan attendance marking.
 * Route: POST /api/attendance/nfc
 */
async function markNfcAttendance(req, res, next) {
  try {
    const { session_id, nfc_id } = req.body;

    if (!session_id || !nfc_id) {
      return res.status(400).json({
        error: { message: 'Required body parameters: session_id, nfc_id' },
      });
    }

    const result = await attendanceValidationService.processNfcScan({
      nfcId: nfc_id,
      sessionId: session_id,
      status: 'PRESENT',
    });

    return res.status(200).json({
      data: {
        message: result.alreadyMarked
          ? 'Student attendance was already recorded as PRESENT.'
          : 'Attendance marked successfully via NFC scan.',
        already_marked: result.alreadyMarked,
        attendance: result.attendance,
        session: result.session,
      },
    });
  } catch (error) {
    if (
      error.message.includes('not found') ||
      error.message.includes('belongs to batch') ||
      error.message.includes('not enrolled') ||
      error.message.includes('inactive')
    ) {
      return res.status(400).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
}

module.exports = {
  markNfcAttendance,
};
