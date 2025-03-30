const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Faculty } = require('./User'); // Import Faculty model to ensure it's registered

const VerificationRequestSchema = new Schema({
  faculty: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  documents: [{
    type: String // URLs to uploaded documents
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerificationRequest', VerificationRequestSchema); 