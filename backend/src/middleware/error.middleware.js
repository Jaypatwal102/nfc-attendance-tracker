/**
 * Global Error Handling Middleware
 * Catch-all handler for unhandled errors in Express controllers.
 * Ensures consistent response format: { "error": { "message": "..." } }
 * Hides stack traces in production.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : message,
    },
  });
}

module.exports = {
  errorHandler,
};
