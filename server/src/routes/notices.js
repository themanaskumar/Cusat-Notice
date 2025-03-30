const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const noticeController = require('../controllers/noticeController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Get all notices
router.get('/', noticeController.getAllNotices);

// Get notice by ID
router.get('/:id', noticeController.getNoticeById);

// Create notice (faculty/admin only)
router.post('/', 
  auth,
  upload.array('attachments', 2), // Allow up to 2 files
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').isIn(['general', 'academic', 'event']).withMessage('Invalid notice type'),
    body('department').notEmpty().withMessage('Department is required')
  ],
  noticeController.createNotice
);

// Update notice (faculty/admin only)
router.put('/:id', 
  auth,
  upload.array('attachments', 5), // Allow up to 5 files
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').isIn(['general', 'academic', 'event']).withMessage('Invalid notice type'),
    body('department').notEmpty().withMessage('Department is required')
  ],
  noticeController.updateNotice
);

// Delete notice (admin only)
router.delete('/:id', auth, noticeController.deleteNotice);

module.exports = router; 