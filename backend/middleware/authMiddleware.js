/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shi_secret_key_2024');
        
        // Find user based on token payload
        let user;
        if (decoded.role === 'student') {
            user = await Student.findById(decoded.id);
        } else if (decoded.role === 'teacher' || decoded.role === 'admin') {
            user = await Teacher.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found. Token may be invalid.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User account is deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route. Token may be invalid.'
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                status: 'error',
                message: `Role '${req.userRole}' is not authorized to access this route.`
            });
        }
        next();
    };
};

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || 'shi_secret_key_2024',
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shi_secret_key_2024');
            
            let user;
            if (decoded.role === 'student') {
                user = await Student.findById(decoded.id);
            } else if (decoded.role === 'teacher' || decoded.role === 'admin') {
                user = await Teacher.findById(decoded.id);
            }

            if (user && user.isActive) {
                req.user = user;
                req.userRole = decoded.role;
            }
        } catch (error) {
            // Token invalid, but continue without auth
        }
    }
    next();
};

module.exports = {
    protect,
    authorize,
    generateToken,
    optionalAuth
};

