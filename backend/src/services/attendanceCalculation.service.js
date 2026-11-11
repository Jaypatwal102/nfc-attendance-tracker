const prisma = require('../config/prisma');

/**
 * Attendance Calculation & Low Attendance Service
 * Implements percentage calculations and threshold checks.
 *
 * Rules:
 * attendance_percentage = (number of PRESENT sessions / total sessions) * 100
 */

class AttendanceCalculationService {
  /**
   * Retrieves active minimum attendance threshold from settings or default (75%).
   */
  async getMinimumThreshold() {
    const settings = await prisma.attendanceSetting.findFirst();
    return settings ? settings.minimumPercentage : 75.0;
  }

  /**
   * Calculates attendance summary for a specific student and subject.
   * @param {string} studentId
   * @param {string} subjectId
   */
  async calculateStudentSubjectAttendance(studentId, subjectId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, enrollmentNo: true, batchId: true },
    });

    if (!student) {
      throw new Error(`Student '${studentId}' not found`);
    }

    // Total sessions conducted for this subject and student's batch
    const totalSessions = await prisma.attendanceSession.count({
      where: {
        subjectId,
        batchId: student.batchId,
      },
    });

    if (totalSessions === 0) {
      return {
        studentId,
        studentName: student.name,
        enrollmentNo: student.enrollmentNo,
        subjectId,
        totalSessions: 0,
        presentSessions: 0,
        absentSessions: 0,
        attendancePercentage: 0.0,
      };
    }

    // Present sessions count
    const presentSessions = await prisma.attendance.count({
      where: {
        studentId,
        status: 'PRESENT',
        session: {
          subjectId,
          batchId: student.batchId,
        },
      },
    });

    const absentSessions = totalSessions - presentSessions;
    const attendancePercentage = Number(((presentSessions / totalSessions) * 100).toFixed(2));

    return {
      studentId,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      subjectId,
      totalSessions,
      presentSessions,
      absentSessions,
      attendancePercentage,
    };
  }

  /**
   * Identifies all students in a batch & subject with attendance below configured threshold.
   * @param {Object} params
   * @param {string} params.batchId
   * @param {string} params.subjectId
   * @param {number} [params.threshold] - Optional override threshold (e.g. 75)
   */
  async getLowAttendanceStudents({ batchId, subjectId, threshold }) {
    const minThreshold = threshold !== undefined ? threshold : await this.getMinimumThreshold();

    // 1. Get all students mapped to this batch and subject
    const studentMappings = await prisma.studentSubjectMapping.findMany({
      where: { batchId, subjectId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollmentNo: true,
            email: true,
            user: { select: { email: true, isActive: true } },
          },
        },
      },
    });

    let studentsToEvaluate = studentMappings
      .filter((m) => m.student && (m.student.user ? m.student.user.isActive : true))
      .map((m) => ({
        id: m.student.id,
        name: m.student.name,
        enrollmentNo: m.student.enrollmentNo,
        email: m.student.email || m.student.user?.email,
      }));

    // Fallback: If no explicit student_subject_mapping rows exist,
    // evaluate all active students belonging to the batch
    if (studentsToEvaluate.length === 0) {
      const batchStudents = await prisma.student.findMany({
        where: {
          batchId,
          user: { isActive: true },
        },
        select: {
          id: true,
          name: true,
          enrollmentNo: true,
          email: true,
          user: { select: { email: true } },
        },
      });

      studentsToEvaluate = batchStudents.map((s) => ({
        id: s.id,
        name: s.name,
        enrollmentNo: s.enrollmentNo,
        email: s.email || s.user?.email,
      }));
    }

    const lowAttendanceList = [];

    for (const student of studentsToEvaluate) {
      const summary = await this.calculateStudentSubjectAttendance(
        student.id,
        subjectId
      );

      // Condition: student attendance is strictly below the dynamic threshold
      if (summary.totalSessions > 0 && summary.attendancePercentage < minThreshold) {
        lowAttendanceList.push({
          ...summary,
          email: student.email,
          threshold: minThreshold,
          isLowAttendance: true,
        });
      }
    }

    return {
      batchId,
      subjectId,
      threshold: minThreshold,
      totalStudentsEvaluated: studentsToEvaluate.length,
      lowAttendanceCount: lowAttendanceList.length,
      students: lowAttendanceList,
    };
  }
}

module.exports = new AttendanceCalculationService();
