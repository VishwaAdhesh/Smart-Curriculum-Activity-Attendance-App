/**
 * Course Routes
 * Handles course-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStudents,
    enrollStudentsInCourse,
    removeStudentFromCourse,
    getCourseAnalytics
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { courseValidation } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// Course CRUD
router.route('/')
    .get(getAllCourses)
    .post(authorize('admin'), courseValidation.create, createCourse);

// Course operations
router.route('/:id')
    .get(getCourse)
    .put(authorize('admin'), updateCourse)
    .delete(authorize('admin'), deleteCourse);

// Course students
router.get('/:id/students', getCourseStudents);
router.post('/:id/students', authorize('admin'), enrollStudentsInCourse);
router.delete('/:id/students/:studentId', authorize('admin'), removeStudentFromCourse);

// Analytics
router.get('/:id/analytics', authorize('admin', 'teacher'), getCourseAnalytics);

module.exports = router;

