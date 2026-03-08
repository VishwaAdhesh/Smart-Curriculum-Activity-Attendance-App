/**
 * Student Controller
 * Handles student-related operations
 */

const Student = require('../models/Student');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Teacher)
const getAllStudents = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, department, year, search } = req.query;
    
    let query = {};
    
    if (department) query.department = department;
    if (year) query.year = year;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const students = await Student.find(query)
        .select('-password')
        .populate('courses', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: students
    });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin/Teacher/Student own profile)
const getStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.id)
        .select('-password')
        .populate('courses');

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: student
    });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.create(req.body);

    res.status(201).json({
        status: 'success',
        data: student
    });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin/Student own profile)
const updateStudent = asyncHandler(async (req, res, next) => {
    // If student is updating their own profile, don't allow role changes
    if (req.userRole === 'student' && req.user._id.toString() !== req.params.id) {
        return next(new AppError('Not authorized to update this profile', 403));
    }

    // Don't allow password updates through this route
    const { password, ...updateData } = req.body;

    const student = await Student.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: student
    });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Student deleted successfully'
    });
});

// @desc    Get student dashboard data
// @route   GET /api/students/:id/dashboard
// @access  Private (Student own profile)
const getStudentDashboard = asyncHandler(async (req, res, next) => {
    const studentId = req.params.id;

    // Verify student exists
    const student = await Student.findById(studentId).populate('courses');
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
        { $match: { student: student._id } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                },
                absent: {
                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                },
                late: {
                    $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                },
                excused: {
                    $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get upcoming activities
    const upcomingActivities = await Activity.find({
        course: { $in: student.courses },
        scheduledDate: { $gte: new Date() },
        isActive: true
    })
    .populate('course', 'name code')
    .sort({ scheduledDate: 1 })
    .limit(5);

    // Get recent attendance
    const recentAttendance = await Attendance.find({ student: student._id })
        .populate('course', 'name code')
        .sort({ date: -1 })
        .limit(10);

    res.status(200).json({
        status: 'success',
        data: {
            student,
            attendanceStats: attendanceStats[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
            upcomingActivities,
            recentAttendance
        }
    });
});

// @desc    Get student courses
// @route   GET /api/students/:id/courses
// @access  Private (Student/Admin)
const getStudentCourses = asyncHandler(async (req, res, next) => {
    const student = await Student.findById(req.params.id)
        .populate({
            path: 'courses',
            populate: { path: 'teacher', select: 'name email' }
        });

    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: student.courses
    });
});

// @desc    Enroll student in course
// @route   POST /api/students/:id/courses/:courseId
// @access  Private (Admin/Teacher)
const enrollStudentInCourse = asyncHandler(async (req, res, next) => {
    const { id, courseId } = req.params;

    const student = await Student.findById(id);
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check if already enrolled
    if (student.courses.includes(courseId)) {
        return next(new AppError('Student already enrolled in this course', 400));
    }

    // Add course to student
    student.courses.push(courseId);
    await student.save();

    // Add student to course
    course.students.push(id);
    await course.save();

    res.status(200).json({
        status: 'success',
        message: 'Student enrolled in course successfully',
        data: student
    });
});

// @desc    Get student attendance by course
// @route   GET /api/students/:id/attendance/:courseId
// @access  Private (Student own profile/Admin/Teacher)
const getStudentAttendanceByCourse = asyncHandler(async (req, res, next) => {
    const { id, courseId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { student: id, course: courseId };
    
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
        .populate('course', 'name code')
        .sort({ date: -1 });

    // Calculate statistics
    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length
    };

    stats.percentage = stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(2) : 0;

    res.status(200).json({
        status: 'success',
        data: {
            attendance,
            statistics: stats
        }
    });
});

module.exports = {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDashboard,
    getStudentCourses,
    enrollStudentInCourse,
    getStudentAttendanceByCourse
};

