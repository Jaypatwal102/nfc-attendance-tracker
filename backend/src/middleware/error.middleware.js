const logger = require('../utils/logger.util');
const { AppError } = require('../utils/errors');

/**
 * Global Centralized Error Handling Middleware
 * Ensures every error returned to clients is clean, user-friendly, and secure.
 * Never exposes raw SQL queries, stack traces, or internal database metadata to the user.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Something went wrong. Please try again later.';
  let details = err.details || null;

  // 1. Prisma Client Initialization Error (e.g. database unreachable / connection failure)
  if (err.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database service is temporarily unavailable. Please try again shortly.';
  }

  // 2. Prisma Client Known Request Errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        code = 'CONFLICT';
        const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
        message = `A record with this ${target} already exists.`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        code = 'NOT_FOUND';
        message = 'The requested information could not be found.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        code = 'RELATION_ERROR';
        message = 'Cannot complete this operation because an associated record is required or currently in use.';
        break;
      }
      case 'P2024': {
        statusCode = 503;
        code = 'DATABASE_TIMEOUT';
        message = 'Database connection timed out. Please try again in a few moments.';
        break;
      }
      default: {
        statusCode = 500;
        code = 'DATABASE_ERROR';
        message = 'A database error occurred. Please try again later.';
        break;
      }
    }
  }

  // 3. Prisma Validation Errors
  else if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided. Please verify the submitted information.';
  }

  // 4. JWT Authentication Errors
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'SESSION_EXPIRED';
    message = 'Your session has expired. Please log in again.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token. Please log in again.';
  }

  // 5. JSON body parse syntax errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'MALFORMED_JSON';
    message = 'Malformed request syntax received.';
  }

  // 6. Generic/Unknown 500 Errors
  else if (!(err instanceof AppError) && statusCode >= 500) {
    message = 'Something went wrong. Please try again later.';
    code = 'INTERNAL_SERVER_ERROR';
  }

  // Log error on server with sanitized context
  logger.error(`${req.method} ${req.originalUrl} - [${statusCode}] ${code}: ${message}`, err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    errorCode: code,
    userId: req.user?.id,
  });

  // Send consistent, secure response to client
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    error: {
      message,
      code,
      details,
    },
  });
}

module.exports = {
  errorHandler,
};
