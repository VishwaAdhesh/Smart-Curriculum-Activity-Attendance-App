/**
 * Attendance Model
 * Schema for tracking student attendance
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['present', 'absent', 'late', 'excused'],
        default: 'present'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher marking attendance is required']
    },
    remarks: {
        type: String,
        trim: true
    },
    session: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        default: 'morning'
    },
    isManual: {
        type: Boolean,
        default: false
    },
    qrCode: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for unique attendance per student per course per date
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
// Index for queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ markedBy: 1 });

// Virtual for attendance percentage calculation
attendanceSchema.virtual('isPresent').get(function() {
    return this.status === 'present' || this.status === 'late';
});

module.exports = mongoose.model('Attendance', attendanceSchema);

