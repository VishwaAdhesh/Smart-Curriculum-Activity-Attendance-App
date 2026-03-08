/**
 * Teacher Controller
 * Handles teacher-related operations
 */

const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin)
const getAllTeachers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, department, search } = req.query;
    
    let query = {};
    
    if (department) query.department = department;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const teachers = await Teacher.find(query)
        .select('-password')
        .populate('courses', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments(query);

    res.status(200).json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: teachers
    });
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private (Admin/Teacher own profile)
const getTeacher = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findById(req.params.id)
        .select('-password')
        .populate('courses');

    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: teacher
    });
});

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.create(req.body);

    res.status(201).json({
        status: 'success',
        data: teacher
    });
});

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin/Teacher own profile)
const updateTeacher = asyncHandler(async (req, res, next) => {
    // Don't allow password updates through this route
    const { password, ...updateData } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: teacher
    });
});

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Teacher deleted successfully'
    });
});

// @desc    Get teacher dashboard data
// @route   GET /api/teachers/:id/dashboard
// @access  Private (Teacher own profile)
const getTeacherDashboard = asyncHandler(async (req, res, next) => {
    const teacherId = req.params.id;

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId).populate('courses');
    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    // Get courses taught by teacher
    const courses = await Course.find({ teacher: teacherId });
    
    // Get total students
    const totalStudents = courses.reduce((acc, course) => acc + course.students.length, 0);

    // Get today's attendance marked
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({
        course: { $in: courses.map(c => c._id) },
        date: { $gte: today, $lt: tomorrow }
    });

    // Get upcoming activities
    const upcomingActivities = await Activity.find({
        course: { $in: courses.map(c => c._id) },
        scheduledDate: { $gte: new Date() },
        isActive: true
    })
    .populate('course', 'name code')
    .sort({ scheduledDate: 1 })
    .limit(5);

    // Get recent activities created
    const recentActivities = await Activity.find({
        createdBy: teacherId
    })
    .populate('course', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
        status: 'success',
        data: {
            teacher,
            totalCourses: courses.length,
            totalStudents,
            todayAttendance,
            upcomingActivities,
            recentActivities
        }
    });
});

// @desc    Get teacher courses
// @route   GET /api/teachers/:id/courses
// @access  Private (Teacher/Admin)
const getTeacherCourses = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findById(req.params.id)
        .populate({
            path: 'courses',
            populate: [
                { path: 'teacher', select: 'name email' },
                { path: 'students', select: 'name rollNumber email' }
            ]
        });

    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: teacher.courses
    });
});

// @desc    Assign course to teacher
// @route   POST /api/teachers/:id/courses/:courseId
// @access  Private (Admin)
const assignCourseToTeacher = asyncHandler(async (req, res, next) => {
    const { id, courseId } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check if course already assigned to another teacher
    if (course.teacher && course.teacher.toString() !== id) {
        return next(new AppError('Course already assigned to another teacher', 400));
    }

    // Add course to teacher
    if (!teacher.courses.includes(courseId)) {
        teacher.courses.push(courseId);
        await teacher.save();
    }

    // Assign teacher to course
    course.teacher = id;
    await course.save();

    res.status(200).json({
        status: 'success',
        message: 'Course assigned to teacher successfully',
        data: teacher
    });
});

// @desc    Get students in teacher's courses
// @route   GET /api/teachers/:id/students
// @access  Private (Teacher)
const getTeacherStudents = asyncHandler(async (req, res, next) => {
    const teacherId = req.params.id;
    const { courseId } = req.query;

    // Get teacher's courses
    const courses = await Course.find({ teacher: teacherId });
    
    let query = {};
    
    if (courseId) {
        // Get students for specific course
        const course = courses.find(c => c._id.toString() === courseId);
        if (!course) {
            return next(new AppError('Course not found for this teacher', 404));
        }
        query.courses = courseId;
    } else {
        // Get all students in teacher's courses
        query.courses = { $in: courses.map(c => c._id) };
    }

    const students = await Student.find(query)
        .select('name email rollNumber department year semester')
        .populate('courses', 'name code');

    res.status(200).json({
        status: 'success',
        data: students
    });
});

module.exports = {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherDashboard,
    getTeacherCourses,
    assignCourseToTeacher,
    getTeacherStudents
};

