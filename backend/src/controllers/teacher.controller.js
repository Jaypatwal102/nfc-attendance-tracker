const prisma = require('../config/prisma');
const attendanceCalculationService = require('../services/attendanceCalculation.service');
const { sendLowAttendanceEmail } = require('../utils/email.util');

/**
 * Gets active teacher profile for the current request.
 */
function getTeacherProfile(req) {
  if (!req.user || !req.user.teacher) {
    const error = new Error('Authenticated user does not have an active Teacher profile.');
    error.status = 403;
    throw error;
  }
  return req.user.teacher;
}

// ==========================================
// Teacher Dashboard & Assignments
// ==========================================

async function getAssignedSubjects(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);

    const mappings = await prisma.teacherSubjectMapping.findMany({
      where: { teacherId: teacher.id },
      include: { subject: true },
    });

    // Unique subjects list
    const subjectsMap = new Map();
    mappings.forEach((m) => {
      if (m.subject && m.subject.isActive) {
        subjectsMap.set(m.subject.id, m.subject);
      }
    });

    return res.status(200).json({ data: Array.from(subjectsMap.values()) });
  } catch (error) {
    next(error);
  }
}

async function getAssignedBatches(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);

    const mappings = await prisma.teacherSubjectMapping.findMany({
      where: { teacherId: teacher.id },
      include: { batch: true },
    });

    const batchesMap = new Map();
    mappings.forEach((m) => {
      if (m.batch && m.batch.isActive) {
        batchesMap.set(m.batch.id, m.batch);
      }
    });

    return res.status(200).json({ data: Array.from(batchesMap.values()) });
  } catch (error) {
    next(error);
  }
}

async function getAssignments(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);

    const mappings = await prisma.teacherSubjectMapping.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: { select: { id: true, courseCode: true, name: true, isActive: true } },
        batch: { select: { id: true, name: true, program: true, semester: true, isActive: true } },
      },
    });

    const assignments = mappings
      .filter((m) => m.subject.isActive && m.batch.isActive)
      .map((m) => ({
        subject: {
          id: m.subject.id,
          course_code: m.subject.courseCode,
          name: m.subject.name,
        },
        batch: {
          id: m.batch.id,
          name: m.batch.name,
          program: m.batch.program,
          semester: m.batch.semester,
        },
      }));

    return res.status(200).json({ data: assignments });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Attendance Sessions
// ==========================================

async function createAttendanceSession(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id, start_time, end_time, session_date } = req.body;

    if (!subject_id || !batch_id || !start_time || !end_time) {
      return res.status(400).json({
        error: { message: 'Required fields: subject_id, batch_id, start_time, end_time' },
      });
    }

    // Verify teacher is assigned to subject + batch
    const assignment = await prisma.teacherSubjectMapping.findUnique({
      where: {
        teacherId_subjectId_batchId: {
          teacherId: teacher.id,
          subjectId: subject_id,
          batchId: batch_id,
        },
      },
    });

    if (!assignment) {
      return res.status(403).json({
        error: { message: 'Teacher is not assigned to this subject and batch combination.' },
      });
    }

    const sDate = session_date ? new Date(session_date) : new Date();
    const stTime = new Date(start_time);
    const edTime = new Date(end_time);

    // Create session and initialize attendance records for enrolled students in a transaction
    const sessionResult = await prisma.$transaction(async (tx) => {
      const session = await tx.attendanceSession.create({
        data: {
          subjectId: subject_id,
          teacherId: teacher.id,
          batchId: batch_id,
          sessionDate: sDate,
          startTime: stTime,
          endTime: edTime,
        },
        include: {
          subject: true,
          batch: true,
        },
      });

      // Find enrolled students
      const enrolledStudents = await tx.studentSubjectMapping.findMany({
        where: { subjectId: subject_id, batchId: batch_id },
      });

      // Create default ABSENT attendance records
      if (enrolledStudents.length > 0) {
        await tx.attendance.createMany({
          data: enrolledStudents.map((es) => ({
            sessionId: session.id,
            studentId: es.studentId,
            status: 'ABSENT',
          })),
          skipDuplicates: true,
        });
      }

      return session;
    });

    return res.status(201).json({ data: sessionResult });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceSessions(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id, date } = req.query;

    const where = { teacherId: teacher.id };
    if (subject_id) where.subjectId = subject_id;
    if (batch_id) where.batchId = batch_id;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      where.sessionDate = { gte: d, lt: nextDay };
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        subject: { select: { id: true, courseCode: true, name: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { sessionDate: 'desc' },
    });

    return res.status(200).json({ data: sessions });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceSessionById(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { id } = req.params;

    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        subject: true,
        batch: true,
        attendances: {
          include: {
            student: {
              select: { id: true, name: true, enrollmentNo: true, nfcId: true },
            },
          },
          orderBy: { student: { name: 'asc' } },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: { message: 'Attendance session not found.' } });
    }

    // Verify session ownership
    if (session.teacherId !== teacher.id) {
      return res.status(403).json({ error: { message: 'Access denied. Session belongs to another teacher.' } });
    }

    return res.status(200).json({ data: session });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Manual Attendance Updates & Reporting
// ==========================================

async function updateAttendance(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!status || !['PRESENT', 'ABSENT'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: { message: 'Valid status required: PRESENT or ABSENT' } });
    }

    const attendanceRecord = await prisma.attendance.findUnique({
      where: { id },
      include: { session: true },
    });

    if (!attendanceRecord) {
      return res.status(404).json({ error: { message: 'Attendance record not found.' } });
    }

    // Verify teacher owns the session
    if (attendanceRecord.session.teacherId !== teacher.id) {
      return res.status(403).json({ error: { message: 'Forbidden. You do not own this attendance session.' } });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        remark: remark !== undefined ? remark : attendanceRecord.remark,
        markedAt: new Date(),
      },
      include: {
        student: { select: { id: true, name: true, enrollmentNo: true } },
      },
    });

    return res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
}

async function getAttendance(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id, student_id, date_from, date_to, status } = req.query;

    const sessionWhere = { teacherId: teacher.id };
    if (subject_id) sessionWhere.subjectId = subject_id;
    if (batch_id) sessionWhere.batchId = batch_id;
    if (date_from || date_to) {
      sessionWhere.sessionDate = {};
      if (date_from) sessionWhere.sessionDate.gte = new Date(date_from);
      if (date_to) sessionWhere.sessionDate.lte = new Date(date_to);
    }

    const where = { session: sessionWhere };
    if (student_id) where.studentId = student_id;
    if (status) where.status = status.toUpperCase();

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, enrollmentNo: true } },
        session: {
          select: {
            id: true,
            sessionDate: true,
            subject: { select: { id: true, name: true, courseCode: true } },
            batch: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { markedAt: 'desc' },
    });

    return res.status(200).json({ data: records });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceStatistics(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id } = req.query;

    if (!subject_id || !batch_id) {
      return res.status(400).json({ error: { message: 'Query parameters subject_id and batch_id are required.' } });
    }

    // Verify teacher assignment
    const assignment = await prisma.teacherSubjectMapping.findUnique({
      where: {
        teacherId_subjectId_batchId: {
          teacherId: teacher.id,
          subjectId: subject_id,
          batchId: batch_id,
        },
      },
    });

    if (!assignment) {
      return res.status(403).json({ error: { message: 'Teacher is not assigned to this subject/batch.' } });
    }

    const totalStudents = await prisma.studentSubjectMapping.count({
      where: { subjectId: subject_id, batchId: batch_id },
    });

    const totalSessions = await prisma.attendanceSession.count({
      where: { teacherId: teacher.id, subjectId: subject_id, batchId: batch_id },
    });

    const presentCount = await prisma.attendance.count({
      where: {
        status: 'PRESENT',
        session: { teacherId: teacher.id, subjectId: subject_id, batchId: batch_id },
      },
    });

    const absentCount = await prisma.attendance.count({
      where: {
        status: 'ABSENT',
        session: { teacherId: teacher.id, subjectId: subject_id, batchId: batch_id },
      },
    });

    const totalAttendanceRecords = presentCount + absentCount;
    const attendancePercentage = totalAttendanceRecords > 0
      ? Number(((presentCount / totalAttendanceRecords) * 100).toFixed(2))
      : 0.0;

    return res.status(200).json({
      data: {
        total_students: totalStudents,
        total_sessions: totalSessions,
        present_count: presentCount,
        absent_count: absentCount,
        attendance_percentage: attendancePercentage,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getLowAttendance(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id, threshold } = req.query;

    if (!subject_id || !batch_id) {
      return res.status(400).json({ error: { message: 'Query parameters subject_id and batch_id are required.' } });
    }

    const result = await attendanceCalculationService.getLowAttendanceStudents({
      batchId: batch_id,
      subjectId: subject_id,
      threshold: threshold ? Number(threshold) : undefined,
    });

    return res.status(200).json({ data: result.students });
  } catch (error) {
    next(error);
  }
}

async function sendLowAttendanceEmailAction(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id } = req.body;

    if (!subject_id || !batch_id) {
      return res.status(400).json({ error: { message: 'Required body parameters: subject_id, batch_id' } });
    }

    // Verify teacher assignment
    const assignment = await prisma.teacherSubjectMapping.findUnique({
      where: {
        teacherId_subjectId_batchId: {
          teacherId: teacher.id,
          subjectId: subject_id,
          batchId: batch_id,
        },
      },
      include: { subject: true },
    });

    if (!assignment) {
      return res.status(403).json({ error: { message: 'Teacher is not assigned to this subject/batch.' } });
    }

    const lowAttData = await attendanceCalculationService.getLowAttendanceStudents({
      batchId: batch_id,
      subjectId: subject_id,
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const student of lowAttData.students) {
      const dispatch = await sendLowAttendanceEmail({
        to: student.email,
        studentName: student.studentName,
        subjectName: assignment.subject.name,
        percentage: student.attendancePercentage,
        threshold: lowAttData.threshold,
        studentId: student.studentId,
        subjectId: subject_id,
      });

      if (dispatch.success) {
        emailsSent++;
      } else {
        emailsFailed++;
      }
    }

    return res.status(200).json({
      data: {
        total_low_attendance_students: lowAttData.students.length,
        emails_sent: emailsSent,
        emails_failed: emailsFailed,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAssignedSubjects,
  getAssignedBatches,
  getAssignments,
  createAttendanceSession,
  getAttendanceSessions,
  getAttendanceSessionById,
  updateAttendance,
  getAttendance,
  getAttendanceStatistics,
  getLowAttendance,
  sendLowAttendanceEmailAction,
};
