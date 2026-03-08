/**
 * Notification Controller
 * Handles notification-related operations
 */

const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, unread } = req.query;
    
    let query = { 
        $or: [
            { user: req.user._id },
            { userModel: req.userRole === 'student' ? 'Student' : 'Teacher' }
        ]
    };
    
    if (unread === 'true') {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false
    });

    res.status(200).json({
        status: 'success',
        total,
        unreadCount,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: notifications
    });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view this notification', 403));
    }

    res.status(200).json({
        status: 'success',
        data: notification
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to update this notification', 403));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
        status: 'success',
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { 
            user: req.user._id,
            isRead: false 
        },
        { 
            isRead: true,
            readAt: new Date()
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to delete this notification', 403));
    }

    await notification.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully'
    });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/cleanup
// @access  Private
const cleanupNotifications = asyncHandler(async (req, res, next) => {
    const result = await Notification.deleteMany({
        user: req.user._id,
        isRead: true
    });

    res.status(200).json({
        status: 'success',
        message: `${result.deletedCount} notifications deleted`
    });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await Notification.countDocuments({
        user: req.user._id,
        isRead: false
    });

    res.status(200).json({
        status: 'success',
        count
    });
});

module.exports = {
    getNotifications,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupNotifications,
    getUnreadCount
};

