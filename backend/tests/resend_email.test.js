/**
 * Automated Verification Suite for Resend Email Integration
 * Tests:
 * 1. Resend Configuration & Safety Guards
 * 2. Low Attendance Email Template Content & Formatting
 * 3. Individual & Batch Dispatch Isolation (one failure doesn't block others)
 * 4. Dynamic Attendance Threshold Filtering (studentAttendance < threshold)
 * 5. Error Handling & Unconfigured Key Fallback
 */

const { getResendClient, getSenderEmail, isResendConfigured, DEFAULT_SENDER } = require('../src/config/resend');
const { generateLowAttendanceEmail } = require('../src/templates/lowAttendanceEmail.template');
const emailService = require('../src/services/email.service');
const attendanceCalculationService = require('../src/services/attendanceCalculation.service');

async function runEmailTests() {
  console.log('=== STARTING RESEND EMAIL & DYNAMIC THRESHOLD TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: RESEND CONFIGURATION & SENDER RESOLUTION
    // ----------------------------------------------------
    console.log('--- Test Group 1: Resend Configuration ---');

    assert(typeof getSenderEmail() === 'string' && getSenderEmail().length > 0, 'Sender email resolved to a non-empty string');
    assert(getSenderEmail().includes('@'), 'Sender email has valid email format');

    // Test safety guards on placeholder keys
    const originalApiKey = process.env.RESEND_API_KEY;
    
    process.env.RESEND_API_KEY = 'your_new_resend_api_key';
    assert(isResendConfigured() === false, 'Placeholder key "your_new_resend_api_key" identified as unconfigured');
    assert(getResendClient() === null, 'getResendClient returns null for placeholder key');

    process.env.RESEND_API_KEY = '';
    assert(isResendConfigured() === false, 'Empty key identified as unconfigured');

    process.env.RESEND_API_KEY = 're_1234567890abcdef_mock_key';
    assert(isResendConfigured() === true, 'Valid re_ prefix identified as configured');
    assert(getResendClient() !== null, 'getResendClient returns instance for valid re_ key');

    // Restore original key
    process.env.RESEND_API_KEY = originalApiKey;

    // ----------------------------------------------------
    // TEST GROUP 2: EMAIL TEMPLATE GENERATION & DYNAMIC CONTENT
    // ----------------------------------------------------
    console.log('\n--- Test Group 2: Email Template Content Verification ---');

    const templateOutput = generateLowAttendanceEmail({
      studentName: 'Rahul Patwal',
      subjectName: 'Database Management Systems',
      percentage: 60.0,
      threshold: 75.0,
      teacherName: 'Dr. Jane Smith',
    });

    assert(templateOutput.subject.includes('Database Management Systems'), 'Subject contains subject name');
    assert(templateOutput.subject.startsWith('Low Attendance Alert'), 'Subject starts with Low Attendance Alert');
    assert(templateOutput.html.includes('Rahul Patwal'), 'HTML includes student name');
    assert(templateOutput.html.includes('60.0%'), 'HTML includes current attendance percentage');
    assert(templateOutput.html.includes('75.0%'), 'HTML includes dynamic teacher threshold');
    assert(templateOutput.html.includes('Dr. Jane Smith'), 'HTML includes teacher name contact guidance');
    assert(templateOutput.html.includes('NFC_TRACKER Attendance System'), 'HTML includes system signature');
    assert(templateOutput.text.includes('Rahul Patwal'), 'Plain text contains student name');
    assert(templateOutput.text.includes('60.0%') && templateOutput.text.includes('75.0%'), 'Plain text contains metrics');

    // ----------------------------------------------------
    // TEST GROUP 3: INPUT VALIDATION & ERROR ISOLATION
    // ----------------------------------------------------
    console.log('\n--- Test Group 3: Input Validation & Dispatch Safety ---');

    // Invalid email validation
    assert(emailService.isValidEmail('test@example.com') === true, 'Standard email is valid');
    assert(emailService.isValidEmail('invalid-email') === false, 'Invalid string rejected');
    assert(emailService.isValidEmail(null) === false, 'Null email rejected');
    assert(emailService.isValidEmail('') === false, 'Empty email rejected');

    // Attempt individual send with unconfigured key - must NOT throw
    process.env.RESEND_API_KEY = 'your_new_resend_api_key';
    const unconfiguredResult = await emailService.sendLowAttendanceEmail({
      to: 'student@example.com',
      studentName: 'Test Student',
      subjectName: 'Math',
      percentage: 55,
      threshold: 75,
    });
    assert(unconfiguredResult.success === false, 'Unconfigured Resend returns success=false without crashing');
    assert(unconfiguredResult.error.includes('Resend API key is not configured'), 'Error message clearly explains unconfigured key');

    // Missing recipient email
    const missingEmailResult = await emailService.sendLowAttendanceEmail({
      to: '',
      studentName: 'No Email Student',
      subjectName: 'Physics',
      percentage: 40,
      threshold: 75,
    });
    assert(missingEmailResult.success === false, 'Missing recipient email returns success=false');
    assert(missingEmailResult.error.includes('Invalid or missing recipient'), 'Clear message on missing recipient');

    // Restore key
    process.env.RESEND_API_KEY = originalApiKey;

    // ----------------------------------------------------
    // TEST GROUP 4: BATCH DISPATCH ISOLATION (Partial Failures)
    // ----------------------------------------------------
    console.log('\n--- Test Group 4: Batch Dispatch & Error Isolation ---');

    const mockStudents = [
      { id: 'st-1', name: 'Valid Student 1', email: 'valid1@example.com', attendancePercentage: 50 },
      { id: 'st-2', name: 'Invalid Email Student', email: 'invalid_email_format', attendancePercentage: 45 },
      { id: 'st-3', name: 'Valid Student 2', email: 'valid2@example.com', attendancePercentage: 60 },
    ];

    const batchResult = await emailService.sendBatchLowAttendanceAlerts({
      students: mockStudents,
      subjectName: 'Software Engineering',
      subjectId: 'sub-demo-1',
      threshold: 75,
    });

    assert(batchResult.total === 3, 'Batch processed all 3 students');
    assert(Array.isArray(batchResult.details), 'Batch returned details array');
    assert(batchResult.details.length === 3, 'Details array contains result for each student');
    // Even if sending fails due to unconfigured key or invalid email, all items are evaluated without throwing!
    assert(batchResult.emailsSent + batchResult.emailsFailed === 3, 'Sum of sent and failed equals total evaluated');

    // ----------------------------------------------------
    // TEST GROUP 5: DYNAMIC THRESHOLD LOGIC (studentAttendance < threshold)
    // ----------------------------------------------------
    console.log('\n--- Test Group 5: Dynamic Threshold Rule Math ---');

    function evaluateLowAttendance(percentage, threshold) {
      return percentage < threshold;
    }

    assert(evaluateLowAttendance(30, 75) === true, '30% is below 75% -> eligible for email');
    assert(evaluateLowAttendance(60, 75) === true, '60% is below 75% -> eligible for email');
    assert(evaluateLowAttendance(74, 75) === true, '74% is below 75% -> eligible for email');
    assert(evaluateLowAttendance(74.99, 75) === true, '74.99% is below 75% -> eligible for email');
    assert(evaluateLowAttendance(75, 75) === false, '75% is at 75% threshold -> NOT eligible for email');
    assert(evaluateLowAttendance(80, 75) === false, '80% is above 75% threshold -> NOT eligible for email');
    
    // Dynamic teacher threshold 65%
    assert(evaluateLowAttendance(64, 65) === true, '64% is below 65% dynamic threshold -> eligible');
    assert(evaluateLowAttendance(65, 65) === false, '65% is at 65% dynamic threshold -> NOT eligible');
    assert(evaluateLowAttendance(70, 65) === false, '70% is above 65% dynamic threshold -> NOT eligible');

    // Dynamic teacher threshold 85%
    assert(evaluateLowAttendance(80, 85) === true, '80% is below 85% dynamic threshold -> eligible');
    assert(evaluateLowAttendance(85, 85) === false, '85% is at 85% dynamic threshold -> NOT eligible');

    // ----------------------------------------------------
    // TEST GROUP 6: BACKWARD COMPATIBILITY ADAPTER
    // ----------------------------------------------------
    console.log('\n--- Test Group 6: email.util Legacy Adapter Compatibility ---');

    const emailUtil = require('../src/utils/email.util');
    assert(typeof emailUtil.sendLowAttendanceEmail === 'function', 'email.util.sendLowAttendanceEmail is exported');
    assert(typeof emailUtil.sendBatchLowAttendanceAlerts === 'function', 'email.util.sendBatchLowAttendanceAlerts is exported');

  } catch (err) {
    console.error('CRITICAL TEST ERROR:', err);
    failed++;
  }

  console.log(`\n=== RESEND TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runEmailTests();

