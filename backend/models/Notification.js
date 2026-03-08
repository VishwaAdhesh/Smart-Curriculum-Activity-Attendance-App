/**
 * Notification Model
 * Schema for storing user notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User is required'],
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Student', 'Teacher']
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['attendance', 'activity', 'grade', 'announcement', 'reminder', 'system', 'success', 'warning', 'error'],
        default: 'system'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['Course', 'Activity', 'Attendance', 'Student', 'Teacher']
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    actionUrl: {
        type: String,
        trim: true
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
    return await this.create(data);
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

