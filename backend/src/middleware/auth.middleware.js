const { verifyToken } = require('../utils/auth.util');
const prisma = require('../config/prisma');

/**
 * Authentication Middleware
 * Extracts and verifies JWT token from Authorization header.
 * Attaches user details with active student/teacher profile to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'UNAUTHORIZED',
        error: { message: 'Authentication required. Please log in.', code: 'UNAUTHORIZED' },
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      const isExpired = jwtErr.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired
          ? 'Your session has expired. Please log in again.'
          : 'Invalid authentication session. Please log in again.',
        code: isExpired ? 'SESSION_EXPIRED' : 'UNAUTHORIZED',
        error: {
          message: isExpired
            ? 'Your session has expired. Please log in again.'
            : 'Invalid authentication session. Please log in again.',
          code: isExpired ? 'SESSION_EXPIRED' : 'UNAUTHORIZED',
        },
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
        code: 'UNAUTHORIZED',
        error: { message: 'Invalid or expired session. Please log in again.', code: 'UNAUTHORIZED' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists. Please register or log in again.',
        code: 'USER_NOT_FOUND',
        error: { message: 'User account no longer exists. Please register or log in again.', code: 'USER_NOT_FOUND' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
        code: 'ACCOUNT_DEACTIVATED',
        error: { message: 'Your account has been deactivated. Please contact the administrator.', code: 'ACCOUNT_DEACTIVATED' },
      });
    }

    // Attach sanitized user object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      student: user.student || null,
      teacher: user.teacher || null,
    };

    next();
  } catch (error) {
    // If database or unexpected error occurred, forward to centralized error handler
    next(error);
  }
}

/**
 * Role Authorization Middleware
 * Enforces backend permissions for specific user roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'UNAUTHORIZED',
        error: { message: 'Authentication required. Please log in.', code: 'UNAUTHORIZED' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        error: {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
        },
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
