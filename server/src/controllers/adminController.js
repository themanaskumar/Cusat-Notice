const { validationResult } = require('express-validator');
const { Student, Faculty } = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const students = await Student.find().select('-password -emailVerificationToken -emailVerificationExpires');
    const faculty = await Faculty.find().select('-password -emailVerificationToken -emailVerificationExpires');

    res.json({
      students,
      faculty
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Try to find user in Student collection
    let user = await Student.findById(req.params.id).select('-password -emailVerificationToken -emailVerificationExpires');
    let role = 'student';

    // If not found, try Faculty collection
    if (!user) {
      user = await Faculty.findById(req.params.id).select('-password -emailVerificationToken -emailVerificationExpires');
      role = 'faculty';

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json({ user, role });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { role } = req.body;

    // Try to find user in Student collection
    let user = await Student.findById(req.params.id);
    let currentRole = 'student';

    // If not found, try Faculty collection
    if (!user) {
      user = await Faculty.findById(req.params.id);
      currentRole = 'faculty';

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // If role is the same, no need to update
    if (currentRole === role) {
      return res.status(400).json({ message: 'User already has this role' });
    }

    // Create new user with the new role
    let newUser;
    if (role === 'student') {
      newUser = new Student({
        email: user.email,
        password: user.password,
        firstName: user.fullName.split(' ')[0],
        lastName: user.fullName.split(' ').slice(1).join(' '),
        branch: user.division,
        yearOfAdmission: new Date().getFullYear(),
        isEmailVerified: user.isEmailVerified
      });
    } else if (role === 'faculty') {
      newUser = new Faculty({
        email: user.email,
        password: user.password,
        fullName: `${user.firstName} ${user.lastName}`,
        division: user.branch,
        post: 'Faculty',
        isEmailVerified: user.isEmailVerified,
        isVerified: true
      });
    } else if (role === 'admin') {
      // For admin, we just update the isAdmin flag
      user.isAdmin = true;
      await user.save();
      return res.json({ message: 'User updated to admin' });
    }

    // Save new user and delete old user
    await newUser.save();
    await user.remove();

    res.json({ message: 'User role updated' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Try to find user in Student collection
    let user = await Student.findById(req.params.id);

    // If not found, try Faculty collection
    if (!user) {
      user = await Faculty.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    await user.remove();

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all faculty verification requests
exports.getVerificationRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await VerificationRequest.find()
      .populate('faculty', 'fullName division post email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve faculty verification request
exports.approveVerificationRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = await VerificationRequest.findById(req.params.id)
      .populate('faculty');

    if (!request) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    // Update faculty
    const faculty = await Faculty.findById(request.faculty._id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    faculty.isVerified = true;
    await faculty.save();

    // Delete verification request
    await request.remove();

    res.json({ message: 'Faculty verified successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Verification request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject faculty verification request
exports.rejectVerificationRequest = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = await VerificationRequest.findById(req.params.id)
      .populate('faculty');

    if (!request) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    // Delete faculty
    const faculty = await Faculty.findById(request.faculty._id);
    if (faculty) {
      await faculty.remove();
    }

    // Delete verification request
    await request.remove();

    res.json({ message: 'Faculty verification rejected' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Verification request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}; 