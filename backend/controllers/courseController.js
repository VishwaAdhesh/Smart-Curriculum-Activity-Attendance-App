/**
 * Course Controller
 * Handles course-related operations
 */

const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getAllCourses = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, department, year, semester, search, teacherId } = req.query;
    
    let query = {};
    
    if (department) query.department = department;
    if (year) query.year = year;
    if (semester) query.semester = semester;
    if (teacherId) query.teacher = teacherId;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
        ];
    }

    const courses = await Course.find(query)
        .populate('teacher', 'name email employeeId')
        .populate('students', 'name rollNumber email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ code: 1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: courses
    });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
        .populate('teacher', 'name email employeeId designation')
        .populate('students', 'name rollNumber email department year');

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: course
    });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.create(req.body);

    // If teacher is specified, add course to teacher's courses
    if (course.teacher) {
        await Teacher.findByIdAndUpdate(course.teacher, {
            $push: { courses: course._id }
        });
    }

    res.status(201).json({
        status: 'success',
        data: course
    });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = asyncHandler(async (req, res, next) => {
    const { teacher, ...updateData } = req.body;

    // If changing teacher, update old and new teacher
    const oldCourse = await Course.findById(req.params.id);
    if (!oldCourse) {
        return next(new AppError('Course not found', 404));
    }

    if (teacher && teacher !== oldCourse.teacher?.toString()) {
        // Remove from old teacher
        if (oldCourse.teacher) {
            await Teacher.findByIdAndUpdate(oldCourse.teacher, {
                $pull: { courses: oldCourse._id }
            });
        }
        // Add to new teacher
        await Teacher.findByIdAndUpdate(teacher, {
            $push: { courses: oldCourse._id }
        });
    }

    const course = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('teacher', 'name email');

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: course
    });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Remove course from teachers
    if (course.teacher) {
        await Teacher.findByIdAndUpdate(course.teacher, {
            $pull: { courses: course._id }
        });
    }

    // Remove course from students
    await Student.updateMany(
        { courses: course._id },
        { $pull: { courses: course._id } }
    );

    await course.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Course deleted successfully'
    });
});

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Teacher/Admin)
const getCourseStudents = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
        .populate('students', 'name rollNumber email department year semester');

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: course.students
    });
});

// @desc    Enroll students in course
// @route   POST /api/courses/:id/students
// @access  Private (Admin)
const enrollStudentsInCourse = asyncHandler(async (req, res, next) => {
    const { studentIds } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Add students to course
    const newStudents = studentIds.filter(id => !course.students.includes(id));
    course.students.push(...newStudents);
    await course.save();

    // Add course to students
    await Student.updateMany(
        { _id: { $in: newStudents } },
        { $push: { courses: course._id } }
    );

    res.status(200).json({
        status: 'success',
        message: 'Students enrolled successfully',
        data: course
    });
});

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private (Admin)
const removeStudentFromCourse = asyncHandler(async (req, res, next) => {
    const { id, studentId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Remove from course
    course.students = course.students.filter(s => s.toString() !== studentId);
    await course.save();

    // Remove course from student
    await Student.findByIdAndUpdate(studentId, {
        $pull: { courses: course._id }
    });

    res.status(200).json({
        status: 'success',
        message: 'Student removed from course',
        data: course
    });
});

// @desc    Get course analytics
// @route   GET /api/courses/:id/analytics
// @access  Private (Teacher/Admin)
const getCourseAnalytics = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
        .populate('teacher', 'name')
        .populate('students', 'name rollNumber');

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Get attendance analytics
    const attendanceStats = await Attendance.aggregate([
        { $match: { course: course._id } },
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

    // Get attendance by date
    const attendanceByDate = await Attendance.aggregate([
        { $match: { course: course._id } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                },
                absent: {
                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
    ]);

    // Get activities
    const activities = await Activity.find({ course: course._id })
        .sort({ scheduledDate: -1 });

    res.status(200).json({
        status: 'success',
        data: {
            course,
            attendanceStats: attendanceStats[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
            attendanceByDate,
            totalActivities: activities.length
        }
    });
});

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStudents,
    enrollStudentsInCourse,
    removeStudentFromCourse,
    getCourseAnalytics
};

