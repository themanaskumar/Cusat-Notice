const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { Student, Faculty } = require('../models/User');

// Register routes
router.post('/register/student', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('yearOfAdmission').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid year of admission')
], authController.registerStudent);

router.post('/register/faculty', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('division').notEmpty().withMessage('Division is required'),
    body('post').notEmpty().withMessage('Post is required')
], authController.registerFaculty);

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        let user;
        if (req.user.role === 'student') {
            user = await Student.findById(req.user.id).select('-password');
        } else {
            user = await Faculty.findById(req.user.id).select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userObject = user.toObject();
        res.json({
            ...userObject,
            role: req.user.role,
            isAdmin: userObject.isAdmin || false // Ensure isAdmin is always included
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Email verification routes
router.post('/verify-email', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], authController.verifyEmail);

router.post('/resend-verification', [
    body('email').isEmail().withMessage('Please enter a valid email')
], authController.resendVerificationEmail);

// Password management routes
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email')
], authController.forgotPassword);

router.post('/reset-password', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.verifyOTPAndResetPassword);

router.post('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], authController.changePassword);

module.exports = router; 