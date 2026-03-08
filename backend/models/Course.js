/**
 * Course Model
 * Schema for storing course information
 */

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Course code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology']
    },
    credits: {
        type: Number,
        required: [true, 'Credits are required'],
        min: 1,
        max: 6
    },
    hoursPerWeek: {
        type: Number,
        min: 1,
        max: 10
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 8
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher is required']
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    syllabus: {
        type: String,
        trim: true
    },
    textbooks: [{
        type: String
    }],
    room: {
        type: String,
        trim: true
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        startTime: String,
        endTime: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for course info
courseSchema.virtual('fullInfo').get(function() {
    return `${this.code} - ${this.name} (${this.credits} credits)`;
});

// Index for better query performance
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1, year: 1, semester: 1 });
courseSchema.index({ teacher: 1 });

module.exports = mongoose.model('Course', courseSchema);

