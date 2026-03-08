/**
 * Auth Controller
 * Handles authentication-related operations
 */

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/authMiddleware');

// Generate JWT Response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id, user.role);

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.rollNumber && { rollNumber: user.rollNumber }),
        ...(user.employeeId && { employeeId: user.employeeId }),
        ...(user.department && { department: user.department })
    };

    res.status(statusCode).json({
        status: 'success',
        token,
        user: userData
    });
};

// @desc    Register student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = asyncHandler(async (req, res, next) => {
    const { name, email, password, rollNumber, department, year, semester } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
        $or: [{ email }, { rollNumber }] 
    });

    if (existingStudent) {
        return next(new AppError('Student with this email or roll number already exists', 400));
    }

    // Create student
    const student = await Student.create({
        name,
        email,
        password,
        rollNumber,
        department,
        year,
        semester,
        role: 'student'
    });

    // Create welcome notification
    await Notification.createNotification({
        user: student._id,
        userModel: 'Student',
        title: 'Welcome to SHI',
        message: 'Welcome to Smart Curriculum Activity & Attendance App!',
        type: 'success'
    });

    sendTokenResponse(student, 201, res);
});

// @desc    Register teacher
// @route   POST /api/auth/register/teacher
// @access  Public (or Admin only in production)
const registerTeacher = asyncHandler(async (req, res, next) => {
    const { name, email, password, employeeId, department, designation } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ 
        $or: [{ email }, { employeeId }] 
    });

    if (existingTeacher) {
        return next(new AppError('Teacher with this email or employee ID already exists', 400));
    }

    // Create teacher
    const teacher = await Teacher.create({
        name,
        email,
        password,
        employeeId,
        department,
        designation,
        role: 'teacher'
    });

    // Create welcome notification
    await Notification.createNotification({
        user: teacher._id,
        userModel: 'Teacher',
        title: 'Welcome to SHI',
        message: 'Welcome to Smart Curriculum Activity & Attendance App!',
        type: 'success'
    });

    sendTokenResponse(teacher, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check for user in Student collection
    let user = await Student.findOne({ email }).select('+password');
    let role = 'student';

    // If not found, check Teacher collection
    if (!user) {
        user = await Teacher.findOne({ email }).select('+password');
        role = user ? user.role : null;
    }

    // Check if user exists
    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new AppError('Account is deactivated. Please contact administrator.', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
    let user;
    
    if (req.userRole === 'student') {
        user = await Student.findById(req.user._id).populate('courses');
    } else {
        user = await Teacher.findById(req.user._id).populate('courses');
    }

    res.status(200).json({
        status: 'success',
        user
    });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    let user;
    
    if (req.userRole === 'student') {
        user = await Student.findById(req.user._id).select('+password');
    } else {
        user = await Teacher.findById(req.user._id).select('+password');
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Check Student first
    let user = await Student.findOne({ email });
    let role = 'student';

    if (!user) {
        user = await Teacher.findOne({ email });
        role = 'teacher';
    }

    if (!user) {
        return next(new AppError('No user found with that email', 404));
    }

    // In production, send email with reset token
    // For now, just return success
    res.status(200).json({
        status: 'success',
        message: 'Password reset email sent (feature not implemented in demo)'
    });
});

module.exports = {
    registerStudent,
    registerTeacher,
    login,
    getMe,
    updatePassword,
    logout,
    forgotPassword
};

