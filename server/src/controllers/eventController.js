const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { deleteFiles } = require('../utils/fileUtils');
const serverConfig = require('../config/server');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    // Filter by date range if specified
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('organizer', 'fullName division post');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'organizer',
        model: 'User', 
        select: 'fullName division post' // Ensure all necessary fields are retrieved
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    console.log('CreateEvent request body:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('User role not authorized:', req.user.role);
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, date, startTime, endTime, location, type, department } = req.body;

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

    const event = new Event({
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      type,
      department,
      organizer: req.user.id,
      attachments
    });

    await event.save();
    console.log('Event saved successfully');

    res.status(201).json(event);
  } catch (err) {
    console.error('Error in createEvent:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    console.log('UpdateEvent request body:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('User role not authorized:', req.user.role);
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, date, startTime, endTime, location, type, department } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
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
      const attachmentsToDelete = event.attachments.filter(
        attachment => !keepAttachments.includes(attachment._id.toString())
      );
      
      await deleteFiles(attachmentsToDelete);
      
      // Filter out attachments that are not being kept
      const remainingAttachments = event.attachments.filter(
        attachment => keepAttachments.includes(attachment._id.toString())
      );
      
      // Set new attachments array
      event.attachments = [...remainingAttachments, ...newAttachments];
    }

    event.title = title;
    event.description = description;
    event.date = date;
    event.startTime = startTime;
    event.endTime = endTime;
    event.location = location;
    event.type = type;
    event.department = department;

    await event.save();
    console.log('Event updated successfully');

    res.json(event);
  } catch (err) {
    console.error('Error in updateEvent:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated files
    await deleteFiles(event.attachments);

    // Use deleteOne instead of remove
    await Event.deleteOne({ _id: event._id });
    
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
