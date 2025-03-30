const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../../src/middleware/auth');
const { Student, Faculty } = require('../../src/models/User');
const VerificationRequest = require('../../src/models/VerificationRequest');
const { check, validationResult } = require('express-validator');

// @route   GET api/admin/users
// @desc    Get all users (students and faculty)
// @access  Private/Admin
router.get('/users', [auth, checkRole('admin')], async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' }).select('-password');
    const faculty = await Faculty.find().select('-password');
    
    res.json({ students, faculty });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/verification-requests
// @desc    Get all faculty verification requests
// @access  Private/Admin
router.get('/verification-requests', [auth, checkRole('admin')], async (req, res) => {
  try {
    console.log('Fetching verification requests...');
    
    // First, check if there are any verification requests at all
    const allRequests = await VerificationRequest.find();
    console.log('Total verification requests:', allRequests.length);
    
    // Then get pending requests
    const requests = await VerificationRequest.find({ status: 'pending' });
    console.log('Pending verification requests:', requests.length);
    
    // Try to populate faculty details
    const populatedRequests = await VerificationRequest.find({ status: 'pending' })
      .populate('faculty', ['fullName', 'email', 'division', 'post', 'isVerified', 'isEmailVerified'])
      .sort({ createdAt: -1 });
    
    console.log('Populated requests:', JSON.stringify(populatedRequests, null, 2));
    
    res.json(populatedRequests);
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/verification-requests/:id/approve
// @desc    Approve a faculty verification request
// @access  Private/Admin
router.put('/verification-requests/:id/approve', [auth, checkRole('admin')], async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Verification request not found' });
    }
    
    // Update faculty verification status
    await Faculty.findByIdAndUpdate(
      request.faculty,
      { isVerified: true },
      { new: true }
    );
    
    // Delete the verification request
    await VerificationRequest.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Faculty verification approved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/verification-requests/:id/reject
// @desc    Reject a faculty verification request
// @access  Private/Admin
router.put('/verification-requests/:id/reject', [auth, checkRole('admin')], async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Verification request not found' });
    }
    
    // Delete the verification request
    await VerificationRequest.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Faculty verification rejected successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update a user's role
// @access  Private/Admin
router.put('/users/:id/role', [
  auth,
  checkRole('admin'),
  [
    check('role', 'Role is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { role } = req.body;
  
  try {
    // Check if user exists in either User or Faculty collection
    let user = await Student.findById(req.params.id);
    let faculty = await Faculty.findById(req.params.id);
    
    if (!user && !faculty) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (role === 'admin') {
      // Set isAdmin flag to true
      if (user) {
        user.isAdmin = true;
        await user.save();
      } else if (faculty) {
        faculty.isAdmin = true;
        await faculty.save();
      }
      
      return res.json({ msg: 'User updated to admin successfully' });
    }
    
    if (role === 'student' && faculty) {
      // Convert faculty to student
      const newUser = new Student({
        _id: faculty._id,
        firstName: faculty.fullName.split(' ')[0],
        lastName: faculty.fullName.split(' ').slice(1).join(' '),
        email: faculty.email,
        password: faculty.password,
        isEmailVerified: faculty.isEmailVerified,
        isAdmin: faculty.isAdmin,
        role: 'student'
      });
      
      await newUser.save();
      await Faculty.findByIdAndDelete(faculty._id);
      
      return res.json({ msg: 'Faculty converted to student successfully' });
    }
    
    if (role === 'faculty' && user) {
      // Convert student to faculty
      const newFaculty = new Faculty({
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        password: user.password,
        isEmailVerified: user.isEmailVerified,
        isAdmin: user.isAdmin,
        isVerified: false
      });
      
      await newFaculty.save();
      await Student.findByIdAndDelete(user._id);
      
      return res.json({ msg: 'Student converted to faculty successfully' });
    }
    
    res.status(400).json({ msg: 'Invalid role change request' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Check if user exists in either User or Faculty collection
    let user = await Student.findById(req.params.id);
    let faculty = await Faculty.findById(req.params.id);
    
    if (!user && !faculty) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user) {
      await Student.findByIdAndDelete(req.params.id);
    } else if (faculty) {
      await Faculty.findByIdAndDelete(req.params.id);
      // Also delete any verification requests
      await VerificationRequest.deleteMany({ faculty: req.params.id });
    }
    
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 