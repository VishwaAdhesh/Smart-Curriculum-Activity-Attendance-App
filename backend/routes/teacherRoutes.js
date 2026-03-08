/**
 * Teacher Routes
 * Handles teacher-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherDashboard,
    getTeacherCourses,
    assignCourseToTeacher,
    getTeacherStudents
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { teacherValidation } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// Teacher CRUD - Admin only
router.route('/')
    .get(authorize('admin'), getAllTeachers)
    .post(authorize('admin'), teacherValidation.create, createTeacher);

// Teacher operations
router.route('/:id')
    .get(getTeacher)
    .put(authorize('admin', 'teacher'), teacherValidation.update, updateTeacher)
    .delete(authorize('admin'), teacherValidation.idParam, deleteTeacher);

// Dashboard
router.get('/:id/dashboard', getTeacherDashboard);

// Courses
router.get('/:id/courses', getTeacherCourses);
router.post('/:id/courses/:courseId', authorize('admin'), assignCourseToTeacher);

// Students
router.get('/:id/students', authorize('teacher', 'admin'), getTeacherStudents);

module.exports = router;

