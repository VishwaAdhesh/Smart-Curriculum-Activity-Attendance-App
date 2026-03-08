/**
 * Analytics Controller
 * Handles analytics and reporting operations
 */

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get overall analytics overview
// @route   GET /api/analytics/overview
// @access  Private (Admin)
const getOverview = asyncHandler(async (req, res, next) => {
    // Get counts
    const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalAttendance
    ] = await Promise.all([
        Student.countDocuments({ isActive: true }),
        Teacher.countDocuments({ isActive: true }),
        Course.countDocuments({ isActive: true }),
        Attendance.countDocuments()
    ]);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow }
    });

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
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
                }
            }
        }
    ]);

    // Get recent activities
    const recentActivities = await Activity.find()
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

    // Get department-wise student distribution
    const departmentDistribution = await Student.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            totals: {
                students: totalStudents,
                teachers: totalTeachers,
                courses: totalCourses,
                attendanceRecords: totalAttendance
            },
            todayAttendance,
            attendanceStats: attendanceStats[0] || { total: 0, present: 0, absent: 0, late: 0 },
            recentActivities,
            departmentDistribution
        }
    });
});

// @desc    Get attendance analytics for a course
// @route   GET /api/analytics/attendance/:courseId
// @access  Private (Teacher/Admin)
const getCourseAttendanceAnalytics = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    let dateQuery = {};
    if (startDate || endDate) {
        if (startDate) dateQuery.$gte = new Date(startDate);
        if (endDate) dateQuery.$lte = new Date(endDate);
    } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateQuery.$gte = thirtyDaysAgo;
    }

    // Overall stats
    const overallStats = await Attendance.aggregate([
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
                    $sum: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
                },
                excused: {
                    $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] }
                }
            }
        }
    ]);

    // Daily attendance
    const dailyAttendance = await Attendance.aggregate([
        { 
            $match: { 
                course: course._id,
                ...(startDate || endDate ? { date: dateQuery } : {})
            } 
        },
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
        { $sort: { _id: 1 } }
    ]);

    // Student-wise attendance
    const studentAttendance = await Attendance.aggregate([
        { $match: { course: course._id } },
        {
            $group: {
                _id: '$student',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] }
                }
            }
        },
        {
            $addFields: {
                percentage: {
                    $multiply: [{ $divide: ['$present', '$total'] }, 100]
                }
            }
        },
        { $sort: { percentage: -1 } }
    ]);

    // Populate student details
    const studentIds = studentAttendance.map(s => s._id);
    const students = await Student.find({ _id: { $in: studentIds } })
        .select('name rollNumber');

    const studentMap = {};
    students.forEach(s => {
        studentMap[s._id.toString()] = s;
    });

    const studentAttendanceWithDetails = studentAttendance.map(s => ({
        student: studentMap[s._id.toString()],
        total: s.total,
        present: s.present,
        percentage: s.percentage.toFixed(2)
    }));

    res.status(200).json({
        status: 'success',
        data: {
            course: {
                _id: course._id,
                name: course.name,
                code: course.code
            },
            overallStats: overallStats[0] || { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
            dailyAttendance,
            studentAttendance: studentAttendanceWithDetails
        }
    });
});

// @desc    Get student performance analytics
// @route   GET /api/analytics/performance/:studentId
// @access  Private (Student own profile/Teacher/Admin)
const getStudentPerformance = asyncHandler(async (req, res, next) => {
    const { studentId } = req.params;

    // Check authorization
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
        return next(new AppError('Not authorized to view this performance', 403));
    }

    const student = await Student.findById(studentId);
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    // Get attendance by course
    const attendanceByCourse = await Attendance.aggregate([
        { $match: { student: student._id } },
        {
            $group: {
                _id: '$course',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] }
                },
                absent: {
                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                }
            }
        }
    ]);

    // Populate course details
    const courseIds = attendanceByCourse.map(a => a._id);
    const courses = await Course.find({ _id: { $in: courseIds } }).select('name code');
    
    const courseMap = {};
    courses.forEach(c => {
        courseMap[c._id.toString()] = c;
    });

    const attendanceWithCourse = attendanceByCourse.map(a => ({
        course: courseMap[a._id.toString()],
        total: a.total,
        present: a.present,
        percentage: a.total > 0 ? ((a.present / a.total) * 100).toFixed(2) : 0
    }));

    // Get activities and grades
    const activities = await Activity.find({
        course: { $in: student.courses }
    });

    const activitiesWithGrades = activities.map(activity => {
        const participant = activity.participants.find(
            p => p.student.toString() === studentId
        );
        return {
            _id: activity._id,
            title: activity.title,
            type: activity.type,
            course: courseMap[activity.course.toString()],
            maxMarks: activity.maxMarks,
            marks: participant ? participant.marks : null,
            status: participant ? participant.status : 'pending'
        };
    });

    // Calculate overall attendance percentage
    const totalAttendance = attendanceByCourse.reduce((acc, a) => acc + a.total, 0);
    const totalPresent = attendanceByCourse.reduce((acc, a) => acc + a.present, 0);
    const overallAttendance = totalAttendance > 0 ? ((totalPresent / totalAttendance) * 100).toFixed(2) : 0;

    // Calculate average grade
    const gradedActivities = activitiesWithGrades.filter(a => a.status === 'graded' && a.marks !== null);
    const averageGrade = gradedActivities.length > 0
        ? (gradedActivities.reduce((acc, a) => acc + (a.marks / a.maxMarks * 100), 0) / gradedActivities.length).toFixed(2)
        : 0;

    res.status(200).json({
        status: 'success',
        data: {
            student: {
                _id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                department: student.department
            },
            attendance: {
                overall: overallAttendance,
                byCourse: attendanceWithCourse
            },
            performance: {
                averageGrade,
                activities: activitiesWithGrades
            }
        }
    });
});

// @desc    Get teacher analytics
// @route   GET /api/analytics/teacher/:teacherId
// @access  Private (Teacher/Admin)
const getTeacherAnalytics = asyncHandler(async (req, res, next) => {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        return next(new AppError('Teacher not found', 404));
    }

    // Get courses taught
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map(c => c._id);

    // Get total students
    const totalStudents = courses.reduce((acc, c) => acc + c.students.length, 0);

    // Get attendance marked by teacher
    const attendanceMarked = await Attendance.countDocuments({
        markedBy: teacherId
    });

    // Get activities created
    const activitiesCreated = await Activity.countDocuments({
        createdBy: teacherId
    });

    // Get recent attendance marked
    const recentAttendance = await Attendance.find({ markedBy: teacherId })
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .limit(10);

    // Attendance by course
    const attendanceByCourse = await Attendance.aggregate([
        { $match: { course: { $in: courseIds } } },
        {
            $group: {
                _id: '$course',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                }
            }
        }
    ]);

    const courseAttendanceMap = {};
    attendanceByCourse.forEach(a => {
        courseAttendanceMap[a._id.toString()] = a;
    });

    const coursesWithAttendance = courses.map(c => ({
        _id: c._id,
        name: c.name,
        code: c.code,
        students: c.students.length,
        attendance: courseAttendanceMap[c._id.toString()] || { total: 0, present: 0 }
    }));

    res.status(200).json({
        status: 'success',
        data: {
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                department: teacher.department
            },
            courses: coursesWithAttendance,
            totalStudents,
            attendanceMarked,
            activitiesCreated,
            recentAttendance
        }
    });
});

// @desc    Get attendance trends
// @route   GET /api/analytics/trends
// @access  Private (Admin)
const getAttendanceTrends = asyncHandler(async (req, res, next) => {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await Attendance.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                present: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                },
                absent: {
                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                },
                late: {
                    $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                },
                total: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Calculate percentage for each day
    const trendsWithPercentage = trends.map(t => ({
        date: t._id,
        present: t.present,
        absent: t.absent,
        late: t.late,
        total: t.total,
        presentPercentage: t.total > 0 ? ((t.present / t.total) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
        status: 'success',
        data: trendsWithPercentage
    });
});

module.exports = {
    getOverview,
    getCourseAttendanceAnalytics,
    getStudentPerformance,
    getTeacherAnalytics,
    getAttendanceTrends
};

