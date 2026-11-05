const prisma = require('../config/prisma');

/**
 * NFC Attendance Validation Service
 * Enforces backend validations when an NFC tag/card is scanned.
 *
 * Validation Workflow (Section 19):
 * 1. Find student by NFC ID.
 * 2. Find active attendance session.
 * 3. Verify student belongs to session batch.
 * 4. Verify student is mapped to session subject.
 * 5. Check whether attendance record already exists.
 * 6. Create/update attendance record.
 */

class AttendanceValidationService {
  /**
   * Processes NFC scan for attendance recording.
   * @param {Object} params
   * @param {string} params.nfcId - Scanned NFC tag identifier
   * @param {string} params.sessionId - ID of current attendance session
   * @param {string} [params.status='PRESENT'] - Attendance status ('PRESENT' | 'ABSENT')
   * @param {string} [params.remark] - Optional remark
   */
  async processNfcScan({ nfcId, sessionId, status = 'PRESENT', remark }) {
    if (!nfcId) {
      throw new Error('NFC ID is required');
    }
    if (!sessionId) {
      throw new Error('Attendance session ID is required');
    }

    // 1. Find student by NFC ID
    const student = await prisma.student.findUnique({
      where: { nfcId },
      include: { user: true, batch: true },
    });

    if (!student) {
      throw new Error(`No student found associated with NFC ID '${nfcId}'`);
    }

    if (!student.user.isActive) {
      throw new Error(`Student account '${student.name}' is inactive`);
    }

    // 2. Find active attendance session
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { subject: true, teacher: true, batch: true },
    });

    if (!session) {
      throw new Error(`Attendance session with ID '${sessionId}' not found`);
    }

    // 3. Verify student belongs to session batch
    if (student.batchId !== session.batchId) {
      throw new Error(
        `Student '${student.name}' belongs to batch '${student.batch.name}', but session is for batch '${session.batch.name}'`
      );
    }

    // 4. Verify student is mapped to session subject
    const studentSubjectMap = await prisma.studentSubjectMapping.findUnique({
      where: {
        studentId_subjectId_batchId: {
          studentId: student.id,
          subjectId: session.subjectId,
          batchId: session.batchId,
        },
      },
    });

    if (!studentSubjectMap) {
      // Fallback: If no explicit student-subject mapping exists, verify student belongs to session batch
      if (student.batchId !== session.batchId) {
        throw new Error(
          `Student '${student.name}' is not enrolled in subject '${session.subject.name}' for batch '${session.batch.name}'`
        );
      }
    }

    // 5. Check whether attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
    });

    // 6. Create or update attendance record
    const attendanceRecord = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
      update: {
        status,
        remark: remark !== undefined ? remark : (existingAttendance?.remark || null),
        markedAt: new Date(),
      },
      create: {
        sessionId: session.id,
        studentId: student.id,
        status,
        remark: remark || null,
        markedAt: new Date(),
      },
      include: {
        student: {
          select: { id: true, name: true, enrollmentNo: true, nfcId: true },
        },
      },
    });

    return {
      success: true,
      alreadyMarked: !!existingAttendance,
      attendance: attendanceRecord,
      session: {
        id: session.id,
        subjectName: session.subject.name,
        batchName: session.batch.name,
      },
    };
  }
}

module.exports = new AttendanceValidationService();
