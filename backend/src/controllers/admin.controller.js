const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/auth.util');

// ==========================================
// Users Management
// ==========================================

async function getUsers(req, res, next) {
  try {
    const { role, is_active, search } = req.query;

    const where = {};
    if (role) {
      where.role = role.toUpperCase();
    }
    if (is_active !== undefined) {
      where.isActive = is_active === 'true';
    }
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        teacher: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(role.toUpperCase())) {
      return res.status(400).json({
        error: { message: 'Valid role is required: STUDENT, TEACHER, or ADMIN' },
      });
    }

    const newRole = role.toUpperCase();

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: { teacher: true, student: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // If promoting to TEACHER, ensure corresponding Teacher profile exists
      if (newRole === 'TEACHER' && !user.teacher) {
        await tx.teacher.create({
          data: {
            userId: user.id,
            name: user.student?.name || user.email.split('@')[0],
            employeeId: `EMP_${Date.now().toString().slice(-6)}`,
            email: user.email,
          },
        });
      }

      return tx.user.update({
        where: { id },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          student: true,
          teacher: true,
        },
      });
    });

    return res.status(200).json({ data: updatedUser });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: { message: error.message } });
    }
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        error: { message: 'is_active must be a boolean (true or false).' },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: is_active },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({ data: updatedUser });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Teacher Management
// ==========================================

async function createTeacher(req, res, next) {
  try {
    const { name, email, password, employee_id } = req.body;

    if (!name || !email || !password || !employee_id) {
      return res.status(400).json({
        error: { message: 'Required fields: name, email, password, employee_id' },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: { message: 'Account with this email already exists.' } });
    }

    const existingEmp = await prisma.teacher.findUnique({ where: { employeeId: employee_id } });
    if (existingEmp) {
      return res.status(409).json({ error: { message: 'Teacher with this employee ID already exists.' } });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: 'TEACHER',
          isActive: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name,
          employeeId: employee_id,
          email,
        },
      });

      return { user, teacher };
    });

    return res.status(201).json({
      data: {
        id: result.teacher.id,
        userId: result.user.id,
        name: result.teacher.name,
        employeeId: result.teacher.employeeId,
        email: result.teacher.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getTeachers(req, res, next) {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ data: teachers });
  } catch (error) {
    next(error);
  }
}

async function getTeacherById(req, res, next) {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        teacherSubjects: { include: { subject: true, batch: true } },
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: { message: 'Teacher not found' } });
    }

    return res.status(200).json({ data: teacher });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Student Management
// ==========================================

async function getStudents(req, res, next) {
  try {
    const { batch_id, search, status } = req.query;

    const where = {};
    if (batch_id) where.batchId = batch_id;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { enrollmentNo: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status !== undefined) {
      where.user = { isActive: status === 'true' };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        batch: true,
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: students });
  } catch (error) {
    next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        batch: true,
        user: { select: { id: true, email: true, role: true, isActive: true } },
        studentSubjects: { include: { subject: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found' } });
    }

    return res.status(200).json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { name, nfc_id, batch_id } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (nfc_id !== undefined) data.nfcId = nfc_id || null;
    if (batch_id !== undefined) data.batchId = batch_id;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data,
      include: { batch: true },
    });

    return res.status(200).json({ data: updatedStudent });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Batch Management
// ==========================================

async function createBatch(req, res, next) {
  try {
    const { name, program, admission_year, semester, section } = req.body;

    if (!name || !program || !admission_year || !semester) {
      return res.status(400).json({
        error: { message: 'Required fields: name, program, admission_year, semester' },
      });
    }

    const existing = await prisma.batch.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: { message: 'Batch with this name already exists.' } });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        program,
        admissionYear: Number(admission_year),
        semester: Number(semester),
        section: section || null,
        isActive: true,
      },
    });

    return res.status(201).json({ data: batch });
  } catch (error) {
    next(error);
  }
}

async function getBatchById(req, res, next) {
  try {
    const { id } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        students: { select: { id: true, name: true, enrollmentNo: true } },
      },
    });
    if (!batch) {
      return res.status(404).json({ error: { message: 'Batch not found' } });
    }
    return res.status(200).json({ data: batch });
  } catch (error) {
    next(error);
  }
}

async function updateBatch(req, res, next) {
  try {
    const { id } = req.params;
    const { name, program, admission_year, semester, section, is_active } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (program !== undefined) data.program = program;
    if (admission_year !== undefined) data.admissionYear = Number(admission_year);
    if (semester !== undefined) data.semester = Number(semester);
    if (section !== undefined) data.section = section;
    if (is_active !== undefined) data.isActive = is_active;

    const batch = await prisma.batch.update({
      where: { id },
      data,
    });

    return res.status(200).json({ data: batch });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Subject Management
// ==========================================

async function createSubject(req, res, next) {
  try {
    const { course_code, name, description } = req.body;

    if (!course_code || !name) {
      return res.status(400).json({
        error: { message: 'Required fields: course_code, name' },
      });
    }

    const existing = await prisma.subject.findUnique({ where: { courseCode: course_code } });
    if (existing) {
      return res.status(409).json({ error: { message: 'Subject with this course code already exists.' } });
    }

    const subject = await prisma.subject.create({
      data: {
        courseCode: course_code,
        name,
        description: description || null,
        isActive: true,
      },
    });

    return res.status(201).json({ data: subject });
  } catch (error) {
    next(error);
  }
}

async function getSubjectById(req, res, next) {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      return res.status(404).json({ error: { message: 'Subject not found' } });
    }
    return res.status(200).json({ data: subject });
  } catch (error) {
    next(error);
  }
}

async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { course_code, name, description, is_active } = req.body;

    const data = {};
    if (course_code !== undefined) data.courseCode = course_code;
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (is_active !== undefined) data.isActive = is_active;

    const subject = await prisma.subject.update({
      where: { id },
      data,
    });

    return res.status(200).json({ data: subject });
  } catch (error) {
    next(error);
  }
}

async function updateSubjectStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const subject = await prisma.subject.update({
      where: { id },
      data: { isActive: !!is_active },
    });

    return res.status(200).json({ data: subject });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Mappings Management
// ==========================================

async function createTeacherSubjectMapping(req, res, next) {
  try {
    const { teacher_id, subject_id, batch_id } = req.body;

    if (!teacher_id || !subject_id || !batch_id) {
      return res.status(400).json({
        error: { message: 'Required fields: teacher_id, subject_id, batch_id' },
      });
    }

    const mapping = await prisma.teacherSubjectMapping.create({
      data: { teacherId: teacher_id, subjectId: subject_id, batchId: batch_id },
      include: { teacher: true, subject: true, batch: true },
    });

    return res.status(201).json({ data: mapping });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: { message: 'Mapping already exists for this teacher, subject, and batch.' } });
    }
    next(error);
  }
}

async function getTeacherSubjectMappings(req, res, next) {
  try {
    const { teacher_id, subject_id, batch_id } = req.query;

    const where = {};
    if (teacher_id) where.teacherId = teacher_id;
    if (subject_id) where.subjectId = subject_id;
    if (batch_id) where.batchId = batch_id;

    const mappings = await prisma.teacherSubjectMapping.findMany({
      where,
      include: { teacher: true, subject: true, batch: true },
    });

    return res.status(200).json({ data: mappings });
  } catch (error) {
    next(error);
  }
}

async function deleteTeacherSubjectMapping(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.teacherSubjectMapping.delete({ where: { id } });
    return res.status(200).json({ data: { message: 'Teacher mapping deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

async function createStudentSubjectMapping(req, res, next) {
  try {
    const { student_id, subject_id, batch_id } = req.body;

    if (!student_id || !subject_id || !batch_id) {
      return res.status(400).json({
        error: { message: 'Required fields: student_id, subject_id, batch_id' },
      });
    }

    // Verify student belongs to specified batch
    const student = await prisma.student.findUnique({ where: { id: student_id } });
    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found.' } });
    }
    if (student.batchId !== batch_id) {
      return res.status(400).json({ error: { message: 'Student does not belong to the specified batch.' } });
    }

    const mapping = await prisma.studentSubjectMapping.create({
      data: { studentId: student_id, subjectId: subject_id, batchId: batch_id },
      include: { student: true, subject: true, batch: true },
    });

    return res.status(201).json({ data: mapping });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: { message: 'Student is already enrolled in this subject for this batch.' } });
    }
    next(error);
  }
}

async function getStudentSubjectMappings(req, res, next) {
  try {
    const { student_id, subject_id, batch_id } = req.query;

    const where = {};
    if (student_id) where.studentId = student_id;
    if (subject_id) where.subjectId = subject_id;
    if (batch_id) where.batchId = batch_id;

    const mappings = await prisma.studentSubjectMapping.findMany({
      where,
      include: { student: true, subject: true, batch: true },
    });

    return res.status(200).json({ data: mappings });
  } catch (error) {
    next(error);
  }
}

async function deleteStudentSubjectMapping(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.studentSubjectMapping.delete({ where: { id } });
    return res.status(200).json({ data: { message: 'Student mapping deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus,
  createTeacher,
  getTeachers,
  getTeacherById,
  getStudents,
  getStudentById,
  updateStudent,
  createBatch,
  getBatchById,
  updateBatch,
  createSubject,
  getSubjectById,
  updateSubject,
  updateSubjectStatus,
  createTeacherSubjectMapping,
  getTeacherSubjectMappings,
  deleteTeacherSubjectMapping,
  createStudentSubjectMapping,
  getStudentSubjectMappings,
  deleteStudentSubjectMapping,
};
