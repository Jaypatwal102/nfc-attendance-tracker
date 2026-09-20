const prisma = require('../config/prisma');

/**
 * Gets student profile from authenticated request.
 */
function getStudentProfile(req) {
  if (!req.user || !req.user.student) {
    const error = new Error('Authenticated user does not have a Student profile.');
    error.status = 403;
    throw error;
  }
  return req.user.student;
}

/**
 * Returns currently authenticated student's profile information.
 */
async function getProfile(req, res, next) {
  try {
    const studentProfile = getStudentProfile(req);

    const student = await prisma.student.findUnique({
      where: { id: studentProfile.id },
      include: {
        batch: { select: { id: true, name: true, program: true, semester: true, section: true } },
      },
    });

    return res.status(200).json({
      data: {
        id: student.id,
        name: student.name,
        enrollment_no: student.enrollmentNo,
        nfc_id: student.nfcId,
        email: student.email,
        batch: student.batch,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns detailed attendance history for the authenticated student.
 */
async function getAttendanceHistory(req, res, next) {
  try {
    const student = getStudentProfile(req);
    const { subject_id, date_from, date_to, status } = req.query;

    const sessionWhere = {};
    if (subject_id) sessionWhere.subjectId = subject_id;
    if (date_from || date_to) {
      sessionWhere.sessionDate = {};
      if (date_from) sessionWhere.sessionDate.gte = new Date(date_from);
      if (date_to) sessionWhere.sessionDate.lte = new Date(date_to);
    }

    const where = { studentId: student.id, session: sessionWhere };
    if (status) where.status = status.toUpperCase();

    const records = await prisma.attendance.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
            subject: { select: { id: true, courseCode: true, name: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { session: { sessionDate: 'desc' } },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      session_id: r.sessionId,
      subject_code: r.session.subject.courseCode,
      subject_name: r.session.subject.name,
      teacher_name: r.session.teacher.name,
      date: r.session.sessionDate,
      start_time: r.session.startTime,
      end_time: r.session.endTime,
      status: r.status,
      remark: r.remark,
      marked_at: r.markedAt,
    }));

    return res.status(200).json({ data: formatted });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculates overall & subject-wise attendance summary for the authenticated student.
 */
async function getAttendanceSummary(req, res, next) {
  try {
    const student = getStudentProfile(req);

    // Get subjects student is enrolled in
    const enrolledMappings = await prisma.studentSubjectMapping.findMany({
      where: { studentId: student.id },
      include: { subject: true },
    });

    const subjectSummaries = [];
    let totalOverallClasses = 0;
    let totalOverallPresent = 0;

    for (const mapping of enrolledMappings) {
      const subject = mapping.subject;

      // Total sessions for this subject and student's batch
      const totalSessions = await prisma.attendanceSession.count({
        where: {
          subjectId: subject.id,
          batchId: student.batchId,
        },
      });

      // Present sessions for this student
      const presentCount = await prisma.attendance.count({
        where: {
          studentId: student.id,
          status: 'PRESENT',
          session: {
            subjectId: subject.id,
            batchId: student.batchId,
          },
        },
      });

      const percentage = totalSessions > 0
        ? Number(((presentCount / totalSessions) * 100).toFixed(2))
        : 0.0;

      totalOverallClasses += totalSessions;
      totalOverallPresent += presentCount;

      subjectSummaries.push({
        subject_id: subject.id,
        course_code: subject.courseCode,
        subject_name: subject.name,
        total_sessions: totalSessions,
        present: presentCount,
        absent: totalSessions - presentCount,
        percentage,
      });
    }

    const totalOverallAbsent = totalOverallClasses - totalOverallPresent;
    const overallPercentage = totalOverallClasses > 0
      ? Number(((totalOverallPresent / totalOverallClasses) * 100).toFixed(2))
      : 0.0;

    return res.status(200).json({
      data: {
        overall_percentage: overallPercentage,
        total_classes: totalOverallClasses,
        present: totalOverallPresent,
        absent: totalOverallAbsent,
        subjects: subjectSummaries,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  getAttendanceHistory,
  getAttendanceSummary,
};
