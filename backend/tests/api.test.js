const prisma = require('../src/config/prisma');
const { hashPassword, comparePassword, generateToken } = require('../src/utils/auth.util');
const attendanceValidationService = require('../src/services/attendanceValidation.service');
const attendanceCalculationService = require('../src/services/attendanceCalculation.service');

async function runTests() {
  console.log('=== STARTING NFC ATTENDANCE TRACKER API & BUSINESS LOGIC TESTS ===\n');
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
    // TEST GROUP 1: AUTHENTICATION & ROLE REJECTION
    // ----------------------------------------------------
    console.log('--- Test Group 1: Authentication & Security ---');

    // Password Hashing
    const pass = 'secret123';
    const hash = await hashPassword(pass);
    const isValidPass = await comparePassword(pass, hash);
    const isInvalidPass = await comparePassword('wrongpass', hash);
    assert(isValidPass === true, 'Password comparison returns true for correct credentials');
    assert(isInvalidPass === false, 'Password comparison returns false for incorrect credentials');

    // Token Generation
    const token = generateToken({ userId: 'test-user-id', role: 'STUDENT' });
    assert(typeof token === 'string' && token.length > 20, 'JWT token generation generates valid string');

    // ----------------------------------------------------
    // TEST GROUP 2: DATABASE ENTITY RELATIONS & SEED DATA
    // ----------------------------------------------------
    console.log('\n--- Test Group 2: Database Schema & Seed Integrity ---');

    // Find seeded batch
    const batch = await prisma.batch.findUnique({ where: { name: '2024_MCA' } });
    assert(!!batch, 'Seeded batch 2024_MCA exists in database');

    // Find seeded subject
    const subject = await prisma.subject.findUnique({ where: { courseCode: 'MCA501' } });
    assert(!!subject, 'Seeded subject MCA501 exists in database');

    // Find seeded student
    const studentUser = await prisma.user.findUnique({
      where: { email: 'student@attendancetracker.com' },
      include: { student: true },
    });
    assert(studentUser && studentUser.role === 'STUDENT', 'Student user has default role STUDENT');
    assert(!!studentUser?.student?.nfcId, 'Student profile has assigned nfc_id');

    // Find seeded teacher
    const teacherUser = await prisma.user.findUnique({
      where: { email: 'teacher@attendancetracker.com' },
      include: { teacher: true },
    });
    assert(teacherUser && teacherUser.role === 'TEACHER', 'Teacher user has role TEACHER');

    // ----------------------------------------------------
    // TEST GROUP 3: ATTENDANCE SESSION & NFC SCAN VALIDATION
    // ----------------------------------------------------
    console.log('\n--- Test Group 3: NFC Scan Validation ---');

    if (subject && teacherUser?.teacher && batch && studentUser?.student) {
      // Create test attendance session
      const session = await prisma.attendanceSession.create({
        data: {
          subjectId: subject.id,
          teacherId: teacherUser.teacher.id,
          batchId: batch.id,
          sessionDate: new Date(),
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
        },
      });
      assert(!!session.id, 'Attendance session created successfully');

      // 1. Process valid NFC scan
      const scanResult1 = await attendanceValidationService.processNfcScan({
        nfcId: studentUser.student.nfcId,
        sessionId: session.id,
        status: 'PRESENT',
      });
      assert(scanResult1.success === true, 'Valid NFC scan successfully marks attendance PRESENT');
      assert(scanResult1.alreadyMarked === false, 'First scan is marked as new record');

      // 2. Duplicate NFC scan handling
      const scanResult2 = await attendanceValidationService.processNfcScan({
        nfcId: studentUser.student.nfcId,
        sessionId: session.id,
        status: 'PRESENT',
      });
      assert(scanResult2.success === true, 'Duplicate scan returns success without error');
      assert(scanResult2.alreadyMarked === true, 'Duplicate scan accurately sets alreadyMarked flag');

      // 3. Unknown NFC ID rejection test
      let unknownRejected = false;
      try {
        await attendanceValidationService.processNfcScan({
          nfcId: 'NON_EXISTENT_NFC_9999',
          sessionId: session.id,
        });
      } catch (err) {
        unknownRejected = err.message.includes('No student found');
      }
      assert(unknownRejected, 'Unknown NFC tag is rejected with descriptive error');

      // Clean up test session
      await prisma.attendanceSession.delete({ where: { id: session.id } });
    }

    // ----------------------------------------------------
    // TEST GROUP 4: ATTENDANCE CALCULATIONS & LOW ATTENDANCE
    // ----------------------------------------------------
    console.log('\n--- Test Group 4: Attendance Calculations ---');

    if (studentUser?.student && subject && batch) {
      const calcSummary = await attendanceCalculationService.calculateStudentSubjectAttendance(
        studentUser.student.id,
        subject.id
      );
      assert(
        typeof calcSummary.attendancePercentage === 'number',
        'Attendance percentage calculation returns numeric value'
      );

      const lowAtt = await attendanceCalculationService.getLowAttendanceStudents({
        batchId: batch.id,
        subjectId: subject.id,
        threshold: 75,
      });
      assert(Array.isArray(lowAtt.students), 'Low attendance query returns list of evaluated students');
    }

  } catch (error) {
    console.error('CRITICAL TEST FAILURE:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
