/**
 * Student Routes
 * Handles student-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDashboard,
    getStudentCourses,
    enrollStudentInCourse,
    getStudentAttendanceByCourse
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { studentValidation } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// Student CRUD - Admin only
router.route('/')
    .get(authorize('admin', 'teacher'), getAllStudents)
    .post(authorize('admin'), studentValidation.create, createStudent);

// Student operations
router.route('/:id')
    .get(getStudent)
    .put(authorize('admin', 'student'), studentValidation.update, updateStudent)
    .delete(authorize('admin'), studentValidation.idParam, deleteStudent);

// Dashboard
router.get('/:id/dashboard', getStudentDashboard);

// Courses
router.get('/:id/courses', getStudentCourses);
router.post('/:id/courses/:courseId', authorize('admin', 'teacher'), enrollStudentInCourse);

// Attendance
router.get('/:id/attendance/:courseId', getStudentAttendanceByCourse);

module.exports = router;

