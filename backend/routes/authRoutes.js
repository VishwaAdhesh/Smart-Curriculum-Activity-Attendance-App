/**
 * Auth Routes
 * Handles authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { 
    registerStudent, 
    registerTeacher, 
    login, 
    getMe, 
    updatePassword,
    logout,
    forgotPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authValidation } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register/student', authValidation.register, registerStudent);
router.post('/register/teacher', authValidation.register, registerTeacher);
router.post('/login', authValidation.login, login);
router.post('/forgotpassword', forgotPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/password', updatePassword);
router.post('/logout', logout);

module.exports = router;

