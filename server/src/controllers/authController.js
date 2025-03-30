const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Student, Faculty } = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const VerificationRequest = require('../models/VerificationRequest');

// Register a new student
exports.registerStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, branch, yearOfAdmission } = req.body;

    // Check if user already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate email domain
    if (!email.endsWith('cusat.ac.in')) {
      return res.status(400).json({ message: 'Email must be a CUSAT email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Create new student
    student = new Student({
      email,
      password, // Store password as plain text
      firstName,
      lastName,
      branch,
      yearOfAdmission,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires
    });

    await student.save();

    // Send verification email with OTP
    const message = `Your OTP for email verification is: ${otp}. This OTP will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: student.email,
        subject: 'CUSAT Notice Board - Email Verification OTP',
        message
      });

      res.status(201).json({ message: 'User registered. Please check your email for OTP verification code.' });
    } catch (err) {
      student.emailVerificationOTP = undefined;
      student.emailVerificationOTPExpires = undefined;
      await student.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register a new faculty
exports.registerFaculty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, division, post } = req.body;

    // Check if user already exists
    let faculty = await Faculty.findOne({ email });
    if (faculty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate email domain
    if (!email.endsWith('cusat.ac.in')) {
      return res.status(400).json({ message: 'Email must be a CUSAT email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Create new faculty
    faculty = new Faculty({
      email,
      password, // Store password as plain text
      fullName,
      division,
      post,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires,
      isVerified: false // Explicitly set to false
    });

    await faculty.save();

    // Automatically create verification request
    const verificationRequest = new VerificationRequest({
      faculty: faculty._id,
      notes: `New faculty registration for ${fullName}`,
      status: 'pending'
    });
    await verificationRequest.save();

    // Send verification email with OTP
    const message = `Your OTP for email verification is: ${otp}. This OTP will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: faculty.email,
        subject: 'CUSAT Notice Board - Email Verification OTP',
        message
      });

      res.status(201).json({ message: 'User registered. Please check your email for OTP verification code.' });
    } catch (err) {
      faculty.emailVerificationOTP = undefined;
      faculty.emailVerificationOTPExpires = undefined;
      await faculty.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    let user = await Student.findOne({ email });
    let role = 'student';

    if (!user) {
      user = await Faculty.findOne({ email });
      role = 'faculty';

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Check if password matches (plain text comparison)
    const isMatch = user.password === password;
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    // Check if faculty is verified
    if (role === 'faculty' && !user.isVerified) {
      return res.status(400).json({ message: 'Your account is pending verification by admin' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role,
        isAdmin: user.isAdmin || false
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        
        // Create a user object with basic info
        const userData = { 
          id: user.id, 
          email: user.email, 
          role,
          isAdmin: user.isAdmin || false 
        };
        
        // Add role-specific fields
        if (role === 'faculty') {
          userData.fullName = user.fullName;
          userData.division = user.division;
          userData.post = user.post;
          userData.isVerified = user.isVerified;
        } else if (role === 'student') {
          userData.firstName = user.firstName;
          userData.lastName = user.lastName;
          userData.branch = user.branch;
          userData.yearOfAdmission = user.yearOfAdmission;
        }
        
        res.json({ 
          token, 
          user: userData
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if OTP exists in Student collection
    let user = await Student.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Check if OTP exists in Faculty collection
      user = await Faculty.findOne({
        email,
        emailVerificationOTP: otp,
        emailVerificationOTPExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // If user is faculty, create verification request
    if (user.constructor.modelName === 'Faculty') {
      // Check if verification request already exists
      const existingRequest = await VerificationRequest.findOne({ faculty: user._id });
      
      if (!existingRequest) {
        // Create new verification request
        const verificationRequest = new VerificationRequest({
          faculty: user._id,
          notes: `New faculty registration for ${user.fullName}`,
          status: 'pending'
        });
        await verificationRequest.save();
      }
    }

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend verification email with OTP
exports.resendVerificationEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    let user = await Student.findOne({ email });
    
    if (!user) {
      user = await Faculty.findOne({ email });
      
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = emailVerificationOTPExpires;
    await user.save();

    // Send verification email with OTP
    const message = `Your new OTP for email verification is: ${otp}. This OTP will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'CUSAT Notice Board - Email Verification OTP',
        message
      });

      res.json({ message: 'New OTP has been sent to your email' });
    } catch (err) {
      user.emailVerificationOTP = undefined;
      user.emailVerificationOTPExpires = undefined;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    let user = await Student.findOne({ email });
    
    if (!user) {
      user = await Faculty.findOne({ email });
      
      if (!user) {
        return res.status(400).json({ message: 'User with this email does not exist' });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordResetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = passwordResetOTPExpires;
    await user.save();

    // Send password reset email with OTP
    const message = `Your OTP for password reset is: ${otp}. This OTP will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'CUSAT Notice Board - Password Reset OTP',
        message
      });

      res.json({ message: 'OTP has been sent to your email' });
    } catch (err) {
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpires = undefined;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and reset password
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Check if OTP exists in Student collection
    let user = await Student.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Check if OTP exists in Faculty collection
      user = await Faculty.findOne({
        email,
        passwordResetOTP: otp,
        passwordResetOTPExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    }

    // Update user password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    console.log('changePassword - Request received');
    console.log('changePassword - User from token:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('changePassword - Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    console.log('changePassword - Passwords received (not showing actual values)');

    // Find user by id
    let user;
    if (req.user.role === 'student') {
      console.log('changePassword - Searching for student with ID:', req.user.id);
      user = await Student.findById(req.user.id);
    } else {
      console.log('changePassword - Searching for faculty with ID:', req.user.id);
      user = await Faculty.findById(req.user.id);
    }

    if (!user) {
      console.log('changePassword - User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('changePassword - User found:', { id: user._id, role: req.user.role });

    // Check if current password matches
    const isMatch = user.password === currentPassword;
    console.log('changePassword - Current password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();
    console.log('changePassword - Password updated successfully');

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword - Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 