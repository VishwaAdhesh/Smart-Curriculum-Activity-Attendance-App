/**
 * Activity Controller
 * Handles curriculum activity-related operations
 */

const Activity = require('../models/Activity');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
const getAllActivities = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 20, 
        course, 
        type, 
        startDate, 
        endDate,
        upcoming 
    } = req.query;
    
    let query = {};
    
    if (course) query.course = course;
    if (type) query.type = type;
    if (upcoming === 'true') {
        query.scheduledDate = { $gte: new Date() };
        query.isActive = true;
    }
    
    if (startDate || endDate) {
        query.scheduledDate = {};
        if (startDate) query.scheduledDate.$gte = new Date(startDate);
        if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query)
        .populate('course', 'name code')
        .populate('createdBy', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ scheduledDate: -1 });

    const total = await Activity.countDocuments(query);

    res.status(200).json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: activities
    });
});

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
const getActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id)
        .populate('course', 'name code')
        .populate('createdBy', 'name')
        .populate('participants.student', 'name rollNumber email');

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: activity
    });
});

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private (Teacher)
const createActivity = asyncHandler(async (req, res, next) => {
    const { title, description, type, course, scheduledDate, dueDate, maxMarks, weightage, category } = req.body;

    // Check if course exists and teacher is assigned
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
        return next(new AppError('Course not found', 404));
    }

    // Check if teacher teaches this course
    if (courseDoc.teacher.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to create activity for this course', 403));
    }

    const activity = await Activity.create({
        title,
        description,
        type,
        course,
        createdBy: req.user._id,
        scheduledDate,
        dueDate,
        maxMarks,
        weightage,
        category
    });

    // Notify students enrolled in the course
    const students = courseDoc.students;
    const notifications = students.map(student => ({
        user: student,
        userModel: 'Student',
        title: `New ${type}: ${title}`,
        message: `A new ${type} has been created for ${courseDoc.name}. Due date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}`,
        type: 'activity',
        relatedEntity: {
            entityType: 'Activity',
            entityId: activity._id
        }
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
        status: 'success',
        data: activity
    });
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Teacher)
const updateActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    // Check if teacher created this activity
    if (activity.createdBy.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to update this activity', 403));
    }

    const allowedUpdates = ['title', 'description', 'scheduledDate', 'dueDate', 'maxMarks', 'weightage', 'isActive', 'category'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).populate('course', 'name code');

    // Notify students if dates changed
    if (req.body.scheduledDate || req.body.dueDate) {
        const course = await Course.findById(activity.course);
        const students = course.students;
        
        const notifications = students.map(student => ({
            user: student,
            userModel: 'Student',
            title: `Activity Updated: ${activity.title}`,
            message: `The activity "${activity.title}" has been updated.`,
            type: 'activity',
            relatedEntity: {
                entityType: 'Activity',
                entityId: activity._id
            }
        }));

        await Notification.insertMany(notifications);
    }

    res.status(200).json({
        status: 'success',
        data: updatedActivity
    });
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Teacher)
const deleteActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    // Check if teacher created this activity
    if (activity.createdBy.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to delete this activity', 403));
    }

    await activity.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Activity deleted successfully'
    });
});

// @desc    Submit activity (student)
// @route   POST /api/activities/:id/submit
// @access  Private (Student)
const submitActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    const studentId = req.user._id;

    // Check if student is in the course
    const course = await Course.findById(activity.course);
    if (!course.students.includes(studentId)) {
        return next(new AppError('You are not enrolled in this course', 403));
    }

    // Check if already submitted
    const existingSubmission = activity.participants.find(
        p => p.student.toString() === studentId.toString()
    );

    if (existingSubmission) {
        existingSubmission.submittedAt = new Date();
        existingSubmission.status = 'submitted';
    } else {
        activity.participants.push({
            student: studentId,
            submittedAt: new Date(),
            status: 'submitted'
        });
    }

    await activity.save();

    res.status(200).json({
        status: 'success',
        message: 'Activity submitted successfully'
    });
});

// @desc    Grade activity (teacher)
// @route   POST /api/activities/:id/grade
// @access  Private (Teacher)
const gradeActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    // Check if teacher created this activity
    if (activity.createdBy.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to grade this activity', 403));
    }

    const { studentId, marks, remarks } = req.body;

    const participant = activity.participants.find(
        p => p.student.toString() === studentId
    );

    if (!participant) {
        return next(new AppError('Student not found in activity participants', 404));
    }

    participant.marks = marks;
    participant.remarks = remarks;
    participant.status = 'graded';

    await activity.save();

    // Send notification to student
    await Notification.createNotification({
        user: studentId,
        userModel: 'Student',
        title: `Activity Graded: ${activity.title}`,
        message: `Your submission for "${activity.title}" has been graded. Marks: ${marks}/${activity.maxMarks}`,
        type: 'grade',
        relatedEntity: {
            entityType: 'Activity',
            entityId: activity._id
        }
    });

    res.status(200).json({
        status: 'success',
        message: 'Activity graded successfully'
    });
});

// @desc    Get activities by course
// @route   GET /api/activities/course/:courseId
// @access  Private
const getActivitiesByCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const { type, upcoming } = req.query;

    let query = { course: courseId };
    
    if (type) query.type = type;
    if (upcoming === 'true') {
        query.scheduledDate = { $gte: new Date() };
        query.isActive = true;
    }

    const activities = await Activity.find(query)
        .populate('createdBy', 'name')
        .sort({ scheduledDate: -1 });

    res.status(200).json({
        status: 'success',
        data: activities
    });
});

// @desc    Get student's activities
// @route   GET /api/activities/student/:studentId
// @access  Private (Student/Teacher/Admin)
const getStudentActivities = asyncHandler(async (req, res, next) => {
    const { studentId } = req.params;
    const { course } = req.query;

    // Check authorization
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
        return next(new AppError('Not authorized to view these activities', 403));
    }

    // Get student's courses
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    
    let courseQuery = { _id: { $in: student.courses } };
    if (course) courseQuery = { _id: course };

    const courses = await Course.find(courseQuery);
    
    let query = { course: { $in: courses.map(c => c._id) } };

    const activities = await Activity.find(query)
        .populate('course', 'name code')
        .sort({ scheduledDate: -1 });

    // Add student submission status
    const activitiesWithStatus = activities.map(activity => {
        const participant = activity.participants.find(
            p => p.student.toString() === studentId
        );
        return {
            ...activity.toObject(),
            submissionStatus: participant ? participant.status : 'pending',
            marks: participant ? participant.marks : null
        };
    });

    res.status(200).json({
        status: 'success',
        data: activitiesWithStatus
    });
});

module.exports = {
    getAllActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    submitActivity,
    gradeActivity,
    getActivitiesByCourse,
    getStudentActivities
};

