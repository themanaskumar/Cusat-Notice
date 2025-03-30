const jwt = require('jsonwebtoken');
const { Student, Faculty } = require('../models/User');

// Middleware to check if user is authenticated
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        console.log('Auth middleware - Token provided:', !!token);
        
        // Check if no token
        if (!token) {
            console.log('Auth middleware - No token provided in headers');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Auth middleware - Token decoded successfully, user ID:', decoded.user.id);

            // Add user from payload
            req.user = decoded.user;

            // Find user in database
            let user;
            if (req.user.role === 'student') {
                user = await Student.findById(req.user.id);
            } else {
                user = await Faculty.findById(req.user.id);
            }

            if (!user) {
                console.log('Auth middleware - User not found in database');
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.isEmailVerified) {
                console.log('Auth middleware - Email not verified');
                return res.status(401).json({ message: 'Please verify your email first' });
            }

            if (req.user.role === 'faculty' && !user.isVerified) {
                console.log('Auth middleware - Faculty account not verified');
                return res.status(401).json({ message: 'Your faculty account is pending verification' });
            }

            // Make sure isAdmin is correctly set in req.user
            req.user.isAdmin = user.isAdmin || false;

            req.token = token;
            console.log('Auth middleware - Authentication successful');
            next();
        } catch (jwtError) {
            console.log('Auth middleware - JWT verification error:', jwtError.message);
            return res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (err) {
        console.error('Auth middleware - Unexpected error:', err.message);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// Middleware to check user role
const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 