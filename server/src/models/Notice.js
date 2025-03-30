const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoticeSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'academic', 'event'],
        default: 'general'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    attachments: [{
        filename: String,
        url: String
    }],
}, {
    timestamps: true
});

// Update the updatedAt timestamp before saving
NoticeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Notice', NoticeSchema); 