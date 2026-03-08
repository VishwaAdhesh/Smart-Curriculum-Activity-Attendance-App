/**
 * Attendance Controller
 * Handles attendance-related operations
 */

const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
const getAllAttendance = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, course, student, startDate, endDate, status } = req.query;
    
    let query = {};
    
    if (course) query.course = course;
    if (student) query.student = student;
    if (status) query.status = status;
    
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
        .populate('student', 'name rollNumber email')
        .populate('course', 'name code')
        .populate('markedBy', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: attendance
    });
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
const getAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id)
        .populate('student', 'name rollNumber email')
        .populate('course', 'name code')
        .populate('markedBy', 'name');

    if (!attendance) {
        return next(new AppError('Attendance record not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: attendance
    });
});

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher)
const markAttendance = asyncHandler(async (req, res, next) => {
    const { student, course, date, status, remarks } = req.body;

    // Check if course exists and teacher is assigned
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
        return next(new AppError('Course not found', 404));
    }

    // Check if teacher teaches this course
    if (courseDoc.teacher.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to mark attendance for this course', 403));
    }

    // Check if student is enrolled in course
    if (!courseDoc.students.includes(student)) {
        return next(new AppError('Student is not enrolled in this course', 400));
    }

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({
        student,
        course,
        date: new Date(date).setHours(0, 0, 0, 0)
    });

    if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = status;
        existingAttendance.remarks = remarks;
        existingAttendance.markedBy = req.user._id;
        await existingAttendance.save();

        return res.status(200).json({
            status: 'success',
            message: 'Attendance updated successfully',
            data: existingAttendance
        });
    }

    // Create new attendance
    const attendance = await Attendance.create({
        student,
        course,
        date,
        status,
        remarks,
        markedBy: req.user._id
    });

    // Send notification to student if absent
    if (status === 'absent') {
        await Notification.createNotification({
            user: student,
            userModel: 'Student',
            title: 'Attendance Marked Absent',
            message: `You were marked absent for ${courseDoc.name} on ${new Date(date).toLocaleDateString()}`,
            type: 'attendance',
            relatedEntity: {
                entityType: 'Attendance',
                entityId: attendance._id
            }
        });
    }

    res.status(201).json({
        status: 'success',
        data: attendance
    });
});

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Teacher)
const bulkMarkAttendance = asyncHandler(async (req, res, next) => {
    const { course, date, attendance: attendanceList, session } = req.body;

    // Check if course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
        return next(new AppError('Course not found', 404));
    }

    // Check if teacher teaches this course
    if (courseDoc.teacher.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to mark attendance for this course', 403));
    }

    const attendanceRecords = [];
    const absentStudents = [];

    for (const item of attendanceList) {
        // Check if attendance already marked
        const existingAttendance = await Attendance.findOne({
            student: item.student,
            course,
            date: new Date(date).setHours(0, 0, 0, 0)
        });

        if (existingAttendance) {
            existingAttendance.status = item.status;
            existingAttendance.markedBy = req.user._id;
            await existingAttendance.save();
            attendanceRecords.push(existingAttendance);
        } else {
            const newAttendance = await Attendance.create({
                student: item.student,
                course,
                date,
                status: item.status,
                markedBy: req.user._id,
                isManual: false,
                session: session || 'morning'
            });
            attendanceRecords.push(newAttendance);

            if (item.status === 'absent') {
                absentStudents.push(item.student);
            }
        }
    }

    // Send notifications to absent students
    for (const studentId of absentStudents) {
        await Notification.createNotification({
            user: studentId,
            userModel: 'Student',
            title: 'Attendance Marked Absent',
            message: `You were marked absent for ${courseDoc.name} on ${new Date(date).toLocaleDateString()}`,
            type: 'attendance'
        });
    }

    res.status(201).json({
        status: 'success',
        message: `Attendance marked for ${attendanceRecords.length} students`,
        data: attendanceRecords
    });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher)
const updateAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id)
        .populate('course');

    if (!attendance) {
        return next(new AppError('Attendance record not found', 404));
    }

    // Check if teacher marked this attendance
    if (attendance.markedBy.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to update this attendance', 403));
    }

    const { status, remarks } = req.body;

    attendance.status = status || attendance.status;
    attendance.remarks = remarks || attendance.remarks;
    await attendance.save();

    res.status(200).json({
        status: 'success',
        data: attendance
    });
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
const deleteAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
        return next(new AppError('Attendance record not found', 404));
    }

    await attendance.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Attendance deleted successfully'
    });
});

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private (Student own profile/Teacher/Admin)
const getStudentAttendance = asyncHandler(async (req, res, next) => {
    const { studentId } = req.params;
    const { course, startDate, endDate } = req.query;

    // Check authorization
    if (req.userRole === 'student' && req.user._id.toString() !== studentId) {
        return next(new AppError('Not authorized to view this attendance', 403));
    }

    let query = { student: studentId };
    
    if (course) query.course = course;
    
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

    stats.percentage = stats.total > 0 
        ? ((stats.present + stats.late) / stats.total * 100).toFixed(2) 
        : 0;

    res.status(200).json({
        status: 'success',
        data: {
            attendance,
            statistics: stats
        }
    });
});

// @desc    Get course attendance
// @route   GET /api/attendance/course/:courseId
// @access  Private (Teacher/Admin)
const getCourseAttendance = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Check if teacher teaches this course
    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    if (course.teacher.toString() !== req.user._id.toString() && req.userRole !== 'admin') {
        return next(new AppError('Not authorized to view this course attendance', 403));
    }

    let query = { course: courseId };
    
    if (date) {
        query.date = new Date(date).setHours(0, 0, 0, 0);
    } else if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
        .populate('student', 'name rollNumber email')
        .sort({ date: -1 });

    // Get all students in course
    const students = await Student.find({ courses: courseId })
        .select('name rollNumber');

    // Map attendance to students
    const attendanceMap = {};
    attendance.forEach(a => {
        attendanceMap[a.student._id.toString()] = a;
    });

    const result = students.map(student => ({
        student,
        attendance: attendanceMap[student._id.toString()] || null
    }));

    res.status(200).json({
        status: 'success',
        data: result
    });
});

// @desc    Get today's attendance for a course
// @route   GET /api/attendance/today/:courseId
// @access  Private (Teacher)
const getTodayAttendance = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
        course: courseId,
        date: { $gte: today, $lt: tomorrow }
    }).populate('student', 'name rollNumber');

    res.status(200).json({
        status: 'success',
        data: attendance
    });
});

module.exports = {
    getAllAttendance,
    getAttendance,
    markAttendance,
    bulkMarkAttendance,
    updateAttendance,
    deleteAttendance,
    getStudentAttendance,
    getCourseAttendance,
    getTodayAttendance
};

