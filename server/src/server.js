const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const serverConfig = require('./config/server');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a static file middleware to serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cusat-notice');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Please make sure MongoDB is running and accessible');
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Load models first to ensure schemas are registered
// This is important for refs to work properly
require('./models/User');
require('./models/VerificationRequest');
require('./models/Notice');
require('./models/Event');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('../routes/api/admin'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'CUSAT Notice Board API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = serverConfig.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server base URL: ${serverConfig.baseUrl}`);
}); 