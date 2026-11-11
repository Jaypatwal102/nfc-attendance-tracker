/**
 * Low Attendance Email Template Generator
 * Produces structured HTML and text notifications for students below dynamic threshold.
 */

function generateLowAttendanceEmail({
  studentName,
  subjectName,
  percentage,
  threshold,
  teacherName = null,
}) {
  const safeStudentName = studentName || 'Student';
  const safeSubjectName = subjectName || 'your enrolled course';
  const formattedPercentage = Number(percentage).toFixed(1);
  const formattedThreshold = Number(threshold).toFixed(1);

  const subject = `Low Attendance Alert - ${safeSubjectName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 28px 32px; color: #ffffff;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">NFC_TRACKER Attendance System</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #dbeafe;">Automated Academic Attendance Notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px;">Dear <strong>${safeStudentName}</strong>,</p>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155;">
                This is an automated notification regarding your attendance in <strong>${safeSubjectName}</strong>.
              </p>

              <!-- Attendance Metrics Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; margin: 20px 0; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #be123c; margin-bottom: 12px;">
                      ⚠️ Attendance Status Alert
                    </div>
                    <table role="presentation" width="100%" style="font-size: 14px;">
                      <tr>
                        <td style="padding: 6px 0; color: #475569;">Course / Subject:</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">${safeSubjectName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #475569;">Your Current Attendance:</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #e11d48; font-size: 16px;">${formattedPercentage}%</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #475569;">Required Minimum Threshold:</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">${formattedThreshold}%</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 16px 0; font-size: 14px; color: #334155;">
                Your current attendance is <strong>${formattedPercentage}%</strong>, which is below the minimum attendance requirement of <strong>${formattedThreshold}%</strong>.
              </p>

              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Please attend upcoming classes regularly to improve your attendance and avoid potential academic consequences.
              </p>

              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 24px 0 20px 0; font-size: 13px; color: #475569;">
                If you believe your attendance record is incorrect, please contact your concerned teacher${teacherName ? ` (<strong>${teacherName}</strong>)` : ''}.
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #1e293b;">
                Regards,<br/>
                <strong>NFC_TRACKER Attendance System</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              This is an automated system email generated by NFC_TRACKER. Please do not reply directly to this message.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Subject: ${subject}

Dear ${safeStudentName},

This is an automated notification regarding your attendance in ${safeSubjectName}.

Your current attendance is ${formattedPercentage}%, which is below the minimum attendance requirement of ${formattedThreshold}%.

Please attend upcoming classes regularly to improve your attendance and avoid potential academic consequences.

If you believe your attendance record is incorrect, please contact your concerned teacher${teacherName ? ` (${teacherName})` : ''}.

Regards,  
NFC_TRACKER Attendance System
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

module.exports = {
  generateLowAttendanceEmail,
};

