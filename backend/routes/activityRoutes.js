/**
 * Activity Routes
 * Handles activity-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getAllActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    submitActivity,
    gradeActivity,
    getActivitiesByCourse,
    getStudentActivities
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { activityValidation } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// General activity routes
router.route('/')
    .get(getAllActivities)
    .post(authorize('admin', 'teacher'), activityValidation.create, createActivity);

// Single activity
router.route('/:id')
    .get(getActivity)
    .put(authorize('admin', 'teacher'), activityValidation.update, updateActivity)
    .delete(authorize('admin', 'teacher'), activityValidation.idParam, deleteActivity);

// Submit activity (student)
router.post('/:id/submit', authorize('student'), submitActivity);

// Grade activity (teacher)
router.post('/:id/grade', authorize('admin', 'teacher'), gradeActivity);

// Activities by course
router.get('/course/:courseId', getActivitiesByCourse);

// Student's activities
router.get('/student/:studentId', getStudentActivities);

module.exports = router;

