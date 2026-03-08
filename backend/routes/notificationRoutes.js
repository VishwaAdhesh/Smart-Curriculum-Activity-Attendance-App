/**
 * Notification Routes
 * Handles notification-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupNotifications,
    getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get single notification
router.get('/:id', getNotification);

// Mark as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Cleanup read notifications
router.delete('/cleanup', cleanupNotifications);

module.exports = router;

