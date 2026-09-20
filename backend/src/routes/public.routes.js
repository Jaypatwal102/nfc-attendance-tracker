const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/batches - List active batches
router.get('/batches', authenticate, async (req, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ data: batches });
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects - List active subjects
router.get('/subjects', authenticate, async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { courseCode: 'asc' },
    });
    return res.status(200).json({ data: subjects });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
