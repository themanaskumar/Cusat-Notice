const { validationResult } = require('express-validator');
const Notice = require('../models/Notice');
const { deleteFiles } = require('../utils/fileUtils');
const serverConfig = require('../config/server');

// Get all notices
exports.getAllNotices = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'fullName division post');

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notice by ID
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'fullName division post');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(notice);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create notice
exports.createNotice = async (req, res) => {
  try {
    console.log('CreateNotice request body:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is faculty or admin
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('User role not authorized:', req.user.role);
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, type, department } = req.body;
    console.log('Extracted fields:', { title, content, type, department });

    // Handle file uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          url: serverConfig.getFullUrl(`uploads/${file.filename}`)
        });
      }
      console.log('Processed attachments:', attachments);
    }

    const notice = new Notice({
      title,
      content,
      type,
      department,
      author: req.user.id,
      attachments
    });
    
    console.log('Notice object created:', notice);

    await notice.save();
    console.log('Notice saved successfully');

    res.status(201).json(notice);
  } catch (err) {
    console.error('Error in createNotice:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update notice
exports.updateNotice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is faculty or admin
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, type, department } = req.body;

    // Find notice
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user is author or admin
    if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Handle file updates
    if (req.files && req.files.length > 0) {
      // Process new attachments
      const newAttachments = req.files.map(file => ({
        filename: file.originalname,
        url: serverConfig.getFullUrl(`uploads/${file.filename}`)
      }));
      
      // Get existing attachments to keep (if specified in the request)
      const keepAttachments = req.body.keepAttachments 
        ? (Array.isArray(req.body.keepAttachments) 
            ? req.body.keepAttachments 
            : [req.body.keepAttachments]) 
        : [];
      
      // Delete files that aren't being kept
      const attachmentsToDelete = notice.attachments.filter(
        attachment => !keepAttachments.includes(attachment._id.toString())
      );
      
      await deleteFiles(attachmentsToDelete);
      
      // Filter out attachments that are not being kept
      const remainingAttachments = notice.attachments.filter(
        attachment => keepAttachments.includes(attachment._id.toString())
      );
      
      // Set new attachments array
      notice.attachments = [...remainingAttachments, ...newAttachments];
    }

    // Update notice fields
    notice.title = title;
    notice.content = content;
    notice.type = type;
    notice.department = department;

    await notice.save();

    res.json(notice);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notice
exports.deleteNotice = async (req, res) => {
  try {
    // Find notice
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user is author or admin
    if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated files
    await deleteFiles(notice.attachments);

    // ✅ Use deleteOne instead of remove
    await Notice.deleteOne({ _id: notice._id });

    res.json({ message: 'Notice removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
