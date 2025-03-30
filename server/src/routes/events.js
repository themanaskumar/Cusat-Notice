const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create event (faculty/admin only)
router.post('/', 
  auth,
  upload.array('attachments', 2), // Allow up to 2 files
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('type').isIn(['academic', 'cultural', 'sports', 'other']).withMessage('Invalid event type')
  ],
  eventController.createEvent
);

// Update event (faculty/admin only)
router.put('/:id', 
  auth,
  upload.array('attachments', 2), // Allow up to 2 files
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('type').isIn(['academic', 'cultural', 'sports', 'other']).withMessage('Invalid event type')
  ],
  eventController.updateEvent
);

// Delete event (admin only)
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router; 