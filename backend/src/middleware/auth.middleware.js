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
        error: { message: 'Authentication required. Please provide a valid Bearer token.' },
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: { message: 'Invalid or expired token.' },
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
        error: { message: 'User associated with token no longer exists.' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: { message: 'User account is deactivated.' },
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
    return res.status(401).json({
      error: { message: 'Invalid or expired token.' },
    });
  }
}

/**
 * Role Authorization Middleware
 * Enforces backend permissions for specific user roles (e.g. ADMIN, TEACHER, STUDENT).
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Authentication required.' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: `Access denied. Requires one of the following roles: [${roles.join(', ')}]`,
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
