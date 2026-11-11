const prisma = require('../config/prisma');
const attendanceCalculationService = require('../services/attendanceCalculation.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger.util');

// In-memory cache for dynamic teacher-configured attendance thresholds per assignment
const teacherThresholdCache = new Map();

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

    const activeMappings = mappings.filter(
      (m) => m.subject && m.subject.isActive && m.batch && m.batch.isActive
    );

    const assignments = await Promise.all(
      activeMappings.map(async (m) => {
        // Fetch enrolled students for this subject & batch
        const studentMappings = await prisma.studentSubjectMapping.findMany({
          where: {
            subjectId: m.subject.id,
            batchId: m.batch.id,
          },
          include: {
            student: {
              include: {
                user: { select: { isActive: true } },
              },
            },
          },
          orderBy: {
            student: { name: 'asc' },
          },
        });

        let students = studentMappings
          .filter((sm) => sm.student && sm.student.user && sm.student.user.isActive)
          .map((sm) => ({
            student_id: sm.student.id,
            name: sm.student.name,
            enrollment_no: sm.student.enrollmentNo,
            nfc_id: sm.student.nfcId,
            batch_id: sm.student.batchId,
            email: sm.student.email,
            is_active: sm.student.user.isActive,
          }));

        // Fallback: If no explicit student_subject_mapping rows exist,
        // all active students in the batch are enrolled
        if (students.length === 0) {
          const batchStudents = await prisma.student.findMany({
            where: {
              batchId: m.batch.id,
              user: { isActive: true },
            },
            include: {
              user: { select: { isActive: true } },
            },
            orderBy: { name: 'asc' },
          });

          students = batchStudents.map((st) => ({
            student_id: st.id,
            name: st.name,
            enrollment_no: st.enrollmentNo,
            nfc_id: st.nfcId,
            batch_id: st.batchId,
            email: st.email,
            is_active: st.user?.isActive ?? true,
          }));
        }

        return {
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
          students,
        };
      })
    );

    return res.status(200).json({ data: assignments });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/teacher/students?subject_id={subjectId}&batch_id={batchId}
 * Returns enrolled students for a specific subject and batch assigned to the teacher.
 */
async function getEnrolledStudents(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id } = req.query;

    if (!subject_id || !batch_id) {
      return res.status(400).json({
        error: { message: 'Query parameters subject_id and batch_id are required.' },
      });
    }

    // Verify teacher is assigned to this subject and batch
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

    // Fetch enrolled students
    const mappings = await prisma.studentSubjectMapping.findMany({
      where: {
        subjectId: subject_id,
        batchId: batch_id,
      },
      include: {
        student: {
          include: {
            user: {
              select: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        student: { name: 'asc' },
      },
    });

    let students = mappings
      .filter((m) => m.student && m.student.user && m.student.user.isActive)
      .map((m) => ({
        student_id: m.student.id,
        name: m.student.name,
        enrollment_no: m.student.enrollmentNo,
        nfc_id: m.student.nfcId,
        batch_id: m.student.batchId,
        email: m.student.email,
        is_active: m.student.user.isActive,
      }));

    // Fallback: If no explicit student_subject_mapping rows exist,
    // all active students belonging to the assigned batch are considered enrolled.
    if (students.length === 0) {
      const batchStudents = await prisma.student.findMany({
        where: {
          batchId: batch_id,
          user: { isActive: true },
        },
        include: {
          user: { select: { isActive: true } },
        },
        orderBy: { name: 'asc' },
      });

      students = batchStudents.map((st) => ({
        student_id: st.id,
        name: st.name,
        enrollment_no: st.enrollmentNo,
        nfc_id: st.nfcId,
        batch_id: st.batchId,
        email: st.email,
        is_active: st.user?.isActive ?? true,
      }));
    }

    return res.status(200).json({ data: students });
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

      let enrolledStudentIds = enrolledStudents.map((es) => es.studentId);
      if (enrolledStudentIds.length === 0) {
        const batchStudents = await tx.student.findMany({
          where: { batchId: batch_id, user: { isActive: true } },
          select: { id: true },
        });
        enrolledStudentIds = batchStudents.map((s) => s.id);
      }

      // Create default ABSENT attendance records
      if (enrolledStudentIds.length > 0) {
        await tx.attendance.createMany({
          data: enrolledStudentIds.map((studentId) => ({
            sessionId: session.id,
            studentId,
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

    const parsedThreshold =
      threshold !== undefined && threshold !== null && threshold !== '' && !isNaN(Number(threshold))
        ? Number(threshold)
        : undefined;

    // Cache the teacher's active threshold for this assignment
    if (parsedThreshold !== undefined) {
      teacherThresholdCache.set(`${teacher.id}:${subject_id}:${batch_id}`, parsedThreshold);
    }

    const result = await attendanceCalculationService.getLowAttendanceStudents({
      batchId: batch_id,
      subjectId: subject_id,
      threshold: parsedThreshold,
    });

    return res.status(200).json({ data: result.students });
  } catch (error) {
    next(error);
  }
}

async function sendLowAttendanceEmailAction(req, res, next) {
  try {
    const teacher = getTeacherProfile(req);
    const { subject_id, batch_id, threshold } = req.body;

    if (!subject_id || !batch_id) {
      return res.status(400).json({ error: { message: 'Required body parameters: subject_id, batch_id' } });
    }

    // Verify teacher assignment & authorization
    const assignment = await prisma.teacherSubjectMapping.findUnique({
      where: {
        teacherId_subjectId_batchId: {
          teacherId: teacher.id,
          subjectId: subject_id,
          batchId: batch_id,
        },
      },
      include: {
        subject: true,
        batch: true,
        teacher: true,
      },
    });

    if (!assignment) {
      return res.status(403).json({ error: { message: 'Teacher is not assigned to this subject/batch.' } });
    }

    // Determine dynamic threshold:
    // 1. Explicitly provided in req.body.threshold
    // 2. OR provided in req.query.threshold
    // 3. OR remembered from the teacher's recent UI configuration for this assignment
    // 4. OR system-wide attendance setting default
    let effectiveThreshold;
    if (threshold !== undefined && threshold !== null && threshold !== '' && !isNaN(Number(threshold))) {
      effectiveThreshold = Number(threshold);
    } else if (req.query?.threshold !== undefined && req.query?.threshold !== '' && !isNaN(Number(req.query.threshold))) {
      effectiveThreshold = Number(req.query.threshold);
    } else if (teacherThresholdCache.has(`${teacher.id}:${subject_id}:${batch_id}`)) {
      effectiveThreshold = teacherThresholdCache.get(`${teacher.id}:${subject_id}:${batch_id}`);
    } else {
      effectiveThreshold = await attendanceCalculationService.getMinimumThreshold();
    }

    logger.info(`Teacher ${teacher.id} initiating low attendance emails for ${assignment.subject.name} (${assignment.batch.name}) with threshold ${effectiveThreshold}%`);

    // Retrieve eligible students (strictly attendancePercentage < effectiveThreshold)
    const lowAttData = await attendanceCalculationService.getLowAttendanceStudents({
      batchId: batch_id,
      subjectId: subject_id,
      threshold: effectiveThreshold,
    });

    // If no students are below the threshold, return cleanly
    if (!lowAttData.students || lowAttData.students.length === 0) {
      return res.status(200).json({
        data: {
          total_students_evaluated: lowAttData.totalStudentsEvaluated,
          total_low_attendance_students: 0,
          emails_sent: 0,
          emails_failed: 0,
          message: 'No students currently fall below the configured attendance threshold.',
        },
      });
    }

    // Dispatch emails via Resend service
    const dispatchSummary = await emailService.sendBatchLowAttendanceAlerts({
      students: lowAttData.students,
      subjectName: assignment.subject.name,
      subjectId: subject_id,
      threshold: effectiveThreshold,
      teacherName: assignment.teacher?.name,
    });

    return res.status(200).json({
      data: {
        total_students_evaluated: lowAttData.totalStudentsEvaluated,
        total_low_attendance_students: lowAttData.students.length,
        emails_sent: dispatchSummary.emailsSent,
        emails_failed: dispatchSummary.emailsFailed,
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
  getEnrolledStudents,
  createAttendanceSession,
  getAttendanceSessions,
  getAttendanceSessionById,
  updateAttendance,
  getAttendance,
  getAttendanceStatistics,
  getLowAttendance,
  sendLowAttendanceEmailAction,
};
