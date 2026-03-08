/**
 * Attendance Routes
 * Handles attendance-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getAllAttendance,
    getAttendance,
    markAttendance,
    bulkMarkAttendance,
    updateAttendance,
    deleteAttendance,
    getStudentAttendance,
    getCourseAttendance,
    getTodayAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { attendanceValidation } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// General attendance routes
router.route('/')
    .get(getAllAttendance)
    .post(authorize('admin', 'teacher'), attendanceValidation.create, markAttendance);

// Bulk attendance
router.post('/bulk', authorize('admin', 'teacher'), attendanceValidation.bulkCreate, bulkMarkAttendance);

// Single attendance
router.route('/:id')
    .get(getAttendance)
    .put(authorize('admin', 'teacher'), updateAttendance)
    .delete(authorize('admin'), attendanceValidation.idParam, deleteAttendance);

// Student attendance
router.get('/student/:studentId', getStudentAttendance);

// Course attendance
router.get('/course/:courseId', authorize('admin', 'teacher'), getCourseAttendance);

// Today's attendance for a course
router.get('/today/:courseId', authorize('admin', 'teacher'), getTodayAttendance);

module.exports = router;

