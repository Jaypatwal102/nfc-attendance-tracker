const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger.util');

// Route modules
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and parser middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Register API route groups
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', publicRoutes);

// Global 404 handler for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource '${req.originalUrl}' not found.`,
    code: 'NOT_FOUND',
    error: {
      message: `Resource '${req.originalUrl}' not found.`,
      code: 'NOT_FOUND',
    },
  });
});

// Global centralized error handling middleware
app.use(errorHandler);

// Process-level unhandled rejection / uncaught exception safety handlers
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection caught at process level', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception caught at process level', err);
});

// Start server if not imported by test runner
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
