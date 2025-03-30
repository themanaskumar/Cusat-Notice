const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: {
        type: String,
        required: true,
        enum: [
            'Computer Science',
            'Information Technology',
            'Electronics & Communication',
            'Civil',
            'Mechanical',
            'Electrical',
            'Chemical',
            'Aerospace',
            'Marine',
            'Architecture',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Statistics',
            'Exam Cell',
            'Administrative Office',
            'Library',
            'Hostel Office',
            'Placement Cell',
            'Research & Development',
            'International Relations',
            'Student Affairs',
            'All Departments'
        ]
    },
    type: {
        type: String,
        enum: ['academic', 'cultural', 'sports', 'other'],
        default: 'academic'
    },
    attachments: [{
        filename: String,
        url: String
    }],
}, {
    timestamps: true
});

// Update the updatedAt timestamp before saving
EventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', EventSchema); 