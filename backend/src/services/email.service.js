const prisma = require('../config/prisma');
const { getResendClient, getSenderEmail, isResendConfigured } = require('../config/resend');
const { generateLowAttendanceEmail } = require('../templates/lowAttendanceEmail.template');
const logger = require('../utils/logger.util');

/**
 * Resend Email Service for NFC Attendance Tracker
 * Manages individual and batch email dispatches with comprehensive audit logging.
 */

class EmailService {
  /**
   * Validates standard email format.
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Sends an individual low attendance notification email via Resend and logs to EmailLog.
   *
   * @param {Object} params
   * @param {string} params.to - Student email address
   * @param {string} params.studentName - Full student name
   * @param {string} params.subjectName - Course/Subject title
   * @param {number} params.percentage - Current attendance percentage
   * @param {number} params.threshold - Required dynamic threshold
   * @param {string} [params.studentId] - Student database ID for audit tracking
   * @param {string} [params.subjectId] - Subject database ID for audit tracking
   * @param {string} [params.teacherName] - Optional teacher name for guidance
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendLowAttendanceEmail({
    to,
    studentName,
    subjectName,
    percentage,
    threshold,
    studentId,
    subjectId,
    teacherName,
  }) {
    const studentEmail = to ? to.trim() : null;

    // 1. Validate email address
    if (!this.isValidEmail(studentEmail)) {
      const errorMsg = `Invalid or missing recipient email address: '${studentEmail}'`;
      logger.warn(`Email skipped for ${studentName || studentId}: ${errorMsg}`);

      if (studentId && subjectId) {
        await this.logEmailAttempt({
          studentId,
          subjectId,
          percentage,
          status: 'FAILED',
          errorMessage: errorMsg,
        });
      }

      return { success: false, error: errorMsg };
    }

    // 2. Verify Resend client configuration
    const resend = getResendClient();
    if (!resend) {
      const configMsg = 'Resend API key is not configured or is a placeholder in RESEND_API_KEY environment variable.';
      logger.warn(`Resend dispatch skipped for ${studentEmail}: ${configMsg}`);

      if (studentId && subjectId) {
        await this.logEmailAttempt({
          studentId,
          subjectId,
          percentage,
          status: 'FAILED',
          errorMessage: configMsg,
        });
      }

      return { success: false, error: configMsg };
    }

    // 3. Generate template content
    const { subject, html, text } = generateLowAttendanceEmail({
      studentName,
      subjectName,
      percentage,
      threshold,
      teacherName,
    });

    const sender = getSenderEmail();

    try {
      logger.info(`Sending low attendance alert via Resend to ${studentEmail} from ${sender}`);

      const { data, error } = await resend.emails.send({
        from: sender,
        to: [studentEmail],
        subject,
        html,
        text,
      });

      if (error) {
        const errorDetails = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        logger.error(`Resend API rejected email for ${studentEmail}:`, error, { recipient: studentEmail });

        if (studentId && subjectId) {
          await this.logEmailAttempt({
            studentId,
            subjectId,
            percentage,
            status: 'FAILED',
            errorMessage: errorDetails,
          });
        }

        return { success: false, error: errorDetails };
      }

      const messageId = data?.id || 'resend_ok';
      logger.info(`Resend successfully dispatched email to ${studentEmail} (ID: ${messageId})`);

      if (studentId && subjectId) {
        await this.logEmailAttempt({
          studentId,
          subjectId,
          percentage,
          status: 'SENT',
        });
      }

      return { success: true, messageId };
    } catch (err) {
      const errorMsg = err.message || 'Unknown network or Resend error';
      logger.error(`Exception during Resend dispatch for ${studentEmail}:`, err, { recipient: studentEmail });

      if (studentId && subjectId) {
        await this.logEmailAttempt({
          studentId,
          subjectId,
          percentage,
          status: 'FAILED',
          errorMessage: errorMsg,
        });
      }

      return { success: false, error: errorMsg };
    }
  }

  /**
   * Dispatches low attendance notification emails to a list of eligible students.
   * Sends individually to protect student privacy and isolates errors so one failure never halts others.
   *
   * @param {Object} params
   * @param {Array<Object>} params.students - List of students below threshold
   * @param {string} params.subjectName - Name of the course/subject
   * @param {string} params.subjectId - ID of the course/subject
   * @param {number} params.threshold - Teacher-configured dynamic threshold
   * @param {string} [params.teacherName] - Teacher name
   * @returns {Promise<{total: number, emailsSent: number, emailsFailed: number, details: Array}>}
   */
  async sendBatchLowAttendanceAlerts({
    students = [],
    subjectName,
    subjectId,
    threshold,
    teacherName,
  }) {
    let emailsSent = 0;
    let emailsFailed = 0;
    const details = [];

    if (!students || students.length === 0) {
      return {
        total: 0,
        emailsSent: 0,
        emailsFailed: 0,
        details: [],
      };
    }

    // Process students sequentially or in controlled batches to respect Resend rate limits
    for (const student of students) {
      const studentEmail = student.email || student.user?.email;

      const result = await this.sendLowAttendanceEmail({
        to: studentEmail,
        studentName: student.studentName || student.name,
        subjectName,
        percentage: student.attendancePercentage,
        threshold,
        studentId: student.studentId || student.id,
        subjectId,
        teacherName,
      });

      if (result.success) {
        emailsSent++;
      } else {
        emailsFailed++;
      }

      details.push({
        studentId: student.studentId || student.id,
        studentName: student.studentName || student.name,
        email: studentEmail,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
    }

    return {
      total: students.length,
      emailsSent,
      emailsFailed,
      details,
    };
  }

  /**
   * Audit helper to write records to the existing EmailLog table.
   * @private
   */
  async logEmailAttempt({ studentId, subjectId, percentage, status, errorMessage = null }) {
    try {
      await prisma.emailLog.create({
        data: {
          studentId,
          subjectId,
          attendancePercentage: Number(percentage) || 0.0,
          emailType: 'LOW_ATTENDANCE',
          status,
          errorMessage: errorMessage ? String(errorMessage).slice(0, 1000) : null,
          sentAt: new Date(),
        },
      });
    } catch (logErr) {
      logger.error('Failed to write email attempt to EmailLog table:', logErr, { studentId, subjectId });
    }
  }
}

module.exports = new EmailService();

