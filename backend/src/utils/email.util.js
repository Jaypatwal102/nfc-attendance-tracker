const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

/**
 * Creates email transport based on environment variables or test account fallback.
 */
function createTransporter() {
  if (process.env.SMTP_SERVICE === 'gmail' || process.env.SMTP_HOST?.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback test/json transport for development/local environments
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Sends low attendance notification email and logs output to EmailLog table.
 */
async function sendLowAttendanceEmail({
  to,
  studentName,
  subjectName,
  percentage,
  threshold,
  studentId,
  subjectId,
}) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"NFC Attendance Tracker" <${process.env.SMTP_USER || 'noreply@attendancetracker.com'}>`,
    to,
    subject: `Low Attendance Warning: ${subjectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #e11d48;">Low Attendance Warning</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your current attendance in <strong>${subjectName}</strong> is <strong style="color: #e11d48;">${percentage}%</strong>, which is below the required minimum threshold of <strong>${threshold}%</strong>.</p>
        <p>Please attend upcoming sessions regularly to avoid academic penalties.</p>
        <br/>
        <p>Best regards,<br/><strong>NFC Attendance Management Team</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId || 'Success'}`);

    if (studentId && subjectId) {
      await prisma.emailLog.create({
        data: {
          studentId,
          subjectId,
          attendancePercentage: percentage,
          emailType: 'LOW_ATTENDANCE',
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email dispatch failed for ${to}:`, error.message);

    if (studentId && subjectId) {
      await prisma.emailLog.create({
        data: {
          studentId,
          subjectId,
          attendancePercentage: percentage,
          emailType: 'LOW_ATTENDANCE',
          status: 'FAILED',
          errorMessage: error.message,
          sentAt: new Date(),
        },
      });
    }

    return { success: false, error: error.message };
  }
}

module.exports = {
  sendLowAttendanceEmail,
};
