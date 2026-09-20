const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const admin = require('../controllers/admin.controller');

// Enforce ADMIN role on all admin routes
router.use(authenticate, requireRole('ADMIN'));

// Users
router.get('/users', admin.getUsers);
router.patch('/users/:id/role', admin.updateUserRole);
router.patch('/users/:id/status', admin.updateUserStatus);

// Teachers
router.post('/teachers', admin.createTeacher);
router.get('/teachers', admin.getTeachers);
router.get('/teachers/:id', admin.getTeacherById);

// Students
router.get('/students', admin.getStudents);
router.get('/students/:id', admin.getStudentById);
router.patch('/students/:id', admin.updateStudent);

// Batches
router.post('/batches', admin.createBatch);
router.get('/batches/:id', admin.getBatchById);
router.patch('/batches/:id', admin.updateBatch);

// Subjects
router.post('/subjects', admin.createSubject);
router.get('/subjects/:id', admin.getSubjectById);
router.patch('/subjects/:id', admin.updateSubject);
router.patch('/subjects/:id/status', admin.updateSubjectStatus);

// Mappings
router.post('/teacher-subject-mappings', admin.createTeacherSubjectMapping);
router.get('/teacher-subject-mappings', admin.getTeacherSubjectMappings);
router.delete('/teacher-subject-mappings/:id', admin.deleteTeacherSubjectMapping);

router.post('/student-subject-mappings', admin.createStudentSubjectMapping);
router.get('/student-subject-mappings', admin.getStudentSubjectMappings);
router.delete('/student-subject-mappings/:id', admin.deleteStudentSubjectMapping);

module.exports = router;
