/**
 * Activity Model
 * Schema for tracking curriculum activities
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Activity title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Activity type is required'],
        enum: ['exam', 'assignment', 'project', 'quiz', 'lab', 'seminar', 'workshop', 'event', 'other']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Creator is required']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    dueDate: {
        type: Date
    },
    submissionDate: {
        type: Date
    },
    maxMarks: {
        type: Number,
        min: 0,
        default: 100
    },
    weightage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    participants: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        marks: {
            type: Number,
            min: 0
        },
        submittedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'submitted', 'graded', 'rejected'],
            default: 'pending'
        },
        remarks: String
    }],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['academic', 'co-curricular', 'extra-curricular', 'sports', 'cultural'],
        default: 'academic'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better query performance
activitySchema.index({ course: 1, scheduledDate: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdBy: 1 });

// Virtual for checking if activity is overdue
activitySchema.virtual('isOverdue').get(function() {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== 'completed';
});

module.exports = mongoose.model('Activity', activitySchema);

