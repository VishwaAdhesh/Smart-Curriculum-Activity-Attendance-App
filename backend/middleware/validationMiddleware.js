/**
 * Validation Middleware
 * Input validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validation rules
const authValidation = {
    register: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
            .matches(/\d/)
            .withMessage('Password must contain a number'),
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ max: 100 })
            .withMessage('Name cannot exceed 100 characters'),
        validate
    ],
    login: [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        validate
    ]
};

// Student validation rules
const studentValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Student name is required')
            .isLength({ max: 100 }),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('rollNumber')
            .trim()
            .notEmpty()
            .withMessage('Roll number is required')
            .toUpperCase(),
        body('department')
            .notEmpty()
            .withMessage('Department is required'),
        body('year')
            .isInt({ min: 1, max: 4 })
            .withMessage('Year must be between 1 and 4'),
        body('semester')
            .isInt({ min: 1, max: 8 })
            .withMessage('Semester must be between 1 and 8'),
        validate
    ],
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 }),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail(),
        body('department')
            .optional(),
        body('year')
            .optional()
            .isInt({ min: 1, max: 4 }),
        body('semester')
            .optional()
            .isInt({ min: 1, max: 8 }),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid student ID'),
        validate
    ]
};

// Teacher validation rules
const teacherValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Teacher name is required')
            .isLength({ max: 100 }),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('employeeId')
            .trim()
            .notEmpty()
            .withMessage('Employee ID is required')
            .toUpperCase(),
        body('department')
            .notEmpty()
            .withMessage('Department is required'),
        body('designation')
            .notEmpty()
            .withMessage('Designation is required'),
        validate
    ],
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 }),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail(),
        body('designation')
            .optional(),
        body('department')
            .optional(),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid teacher ID'),
        validate
    ]
};

// Course validation rules
const courseValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Course name is required')
            .isLength({ max: 100 }),
        body('code')
            .trim()
            .notEmpty()
            .withMessage('Course code is required')
            .toUpperCase(),
        body('department')
            .notEmpty()
            .withMessage('Department is required'),
        body('credits')
            .isInt({ min: 1, max: 6 })
            .withMessage('Credits must be between 1 and 6'),
        body('year')
            .isInt({ min: 1, max: 4 })
            .withMessage('Year must be between 1 and 4'),
        body('semester')
            .isInt({ min: 1, max: 8 })
            .withMessage('Semester must be between 1 and 8'),
        body('teacher')
            .isMongoId()
            .withMessage('Invalid teacher ID'),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid course ID'),
        validate
    ]
};

// Attendance validation rules
const attendanceValidation = {
    create: [
        body('student')
            .isMongoId()
            .withMessage('Invalid student ID'),
        body('course')
            .isMongoId()
            .withMessage('Invalid course ID'),
        body('date')
            .isISO8601()
            .withMessage('Invalid date format'),
        body('status')
            .isIn(['present', 'absent', 'late', 'excused'])
            .withMessage('Invalid status'),
        validate
    ],
    bulkCreate: [
        body('attendance')
            .isArray({ min: 1 })
            .withMessage('Attendance array is required'),
        body('attendance.*.student')
            .isMongoId()
            .withMessage('Invalid student ID in attendance'),
        body('attendance.*.status')
            .isIn(['present', 'absent', 'late', 'excused'])
            .withMessage('Invalid status in attendance'),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid attendance ID'),
        validate
    ],
    query: [
        query('course')
            .optional()
            .isMongoId()
            .withMessage('Invalid course ID'),
        query('student')
            .optional()
            .isMongoId()
            .withMessage('Invalid student ID'),
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid start date'),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid end date'),
        validate
    ]
};

// Activity validation rules
const activityValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Activity title is required')
            .isLength({ max: 200 }),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required'),
        body('type')
            .isIn(['exam', 'assignment', 'project', 'quiz', 'lab', 'seminar', 'workshop', 'event', 'other'])
            .withMessage('Invalid activity type'),
        body('course')
            .isMongoId()
            .withMessage('Invalid course ID'),
        body('scheduledDate')
            .isISO8601()
            .withMessage('Invalid scheduled date'),
        body('maxMarks')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Max marks must be a positive number'),
        validate
    ],
    update: [
        body('title')
            .optional()
            .trim()
            .isLength({ max: 200 }),
        body('status')
            .optional()
            .isIn(['active', 'completed', 'cancelled']),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid activity ID'),
        validate
    ]
};

// Notification validation rules
const notificationValidation = {
    create: [
        body('user')
            .isMongoId()
            .withMessage('Invalid user ID'),
        body('userModel')
            .isIn(['Student', 'Teacher'])
            .withMessage('Invalid user model'),
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Notification title is required')
            .isLength({ max: 100 }),
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required'),
        body('type')
            .optional()
            .isIn(['attendance', 'activity', 'grade', 'announcement', 'reminder', 'system']),
        validate
    ],
    idParam: [
        param('id')
            .isMongoId()
            .withMessage('Invalid notification ID'),
        validate
    ]
};

module.exports = {
    validate,
    authValidation,
    studentValidation,
    teacherValidation,
    courseValidation,
    attendanceValidation,
    activityValidation,
    notificationValidation
};

