/**
 * Analytics Routes
 * Handles analytics and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getOverview,
    getCourseAttendanceAnalytics,
    getStudentPerformance,
    getTeacherAnalytics,
    getAttendanceTrends
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Overview - Admin only
router.get('/overview', authorize('admin'), getOverview);

// Attendance analytics by course
router.get('/attendance/:courseId', authorize('admin', 'teacher'), getCourseAttendanceAnalytics);

// Student performance
router.get('/performance/:studentId', getStudentPerformance);

// Teacher analytics
router.get('/teacher/:teacherId', authorize('admin', 'teacher'), getTeacherAnalytics);

// Attendance trends
router.get('/trends', authorize('admin'), getAttendanceTrends);

module.exports = router;

