const prisma = require('../config/prisma');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth.util');

/**
 * Registers a new normal user as a STUDENT.
 * Rule: Role must always be STUDENT. Frontend cannot specify role.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, enrollment_no, batch_id, nfc_id } = req.body;

    if (!name || !email || !password || !enrollment_no || !batch_id) {
      return res.status(400).json({
        error: { message: 'Required fields: name, email, password, enrollment_no, batch_id' },
      });
    }

    // Explicitly reject or ignore client-supplied role
    if (req.body.role && req.body.role !== 'STUDENT') {
      return res.status(403).json({
        error: { message: 'Self-assignment of role during registration is not allowed. All new accounts receive STUDENT role.' },
      });
    }

    // Check existing user email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: { message: 'An account with this email already exists.' },
      });
    }

    // Check existing student enrollment_no
    const existingEnrollment = await prisma.student.findUnique({ where: { enrollmentNo: enrollment_no } });
    if (existingEnrollment) {
      return res.status(409).json({
        error: { message: 'A student with this enrollment number already exists.' },
      });
    }

    // Verify batch existence
    const batch = await prisma.batch.findUnique({ where: { id: batch_id } });
    if (!batch) {
      return res.status(404).json({
        error: { message: `Batch with ID '${batch_id}' not found.` },
      });
    }

    const hashedPassword = await hashPassword(password);

    // Create User and Student profile in database transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: 'STUDENT',
          isActive: true,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          name,
          enrollmentNo: enrollment_no,
          nfcId: nfc_id || null,
          email,
          batchId: batch_id,
        },
        include: { batch: true },
      });

      return { user, student };
    });

    const token = generateToken({ userId: result.user.id, role: result.user.role });

    return res.status(201).json({
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          isActive: result.user.isActive,
          student: {
            id: result.student.id,
            name: result.student.name,
            enrollmentNo: result.student.enrollmentNo,
            nfcId: result.student.nfcId,
            batch: result.student.batch,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in authenticated user.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email and password are required.' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: { include: { batch: true } },
        teacher: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid email or password.' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: { message: 'Account is deactivated. Please contact administrator.' },
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: { message: 'Invalid email or password.' },
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          student: user.student || undefined,
          teacher: user.teacher || undefined,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns basic profile of the currently authenticated user.
 */
async function getMe(req, res) {
  return res.status(200).json({
    data: {
      user: req.user,
    },
  });
}

module.exports = {
  register,
  login,
  getMe,
};
