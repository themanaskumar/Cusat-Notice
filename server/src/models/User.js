const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Base user schema
const userOptions = {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true
};

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return v.endsWith('cusat.ac.in');
            },
            message: 'Email must end with cusat.ac.in'
        }
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    }
}, userOptions);

// Compare password method
UserSchema.methods.comparePassword = function(candidatePassword) {
    return this.password === candidatePassword;
};

// Create the User model
const User = mongoose.model('User', UserSchema);

// Student schema
const StudentSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
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
            'Statistics'
        ]
    },
    yearOfAdmission: {
        type: Number,
        required: true
    }
});

// Faculty schema
const FacultySchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    division: {
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
            'Student Affairs'
        ]
    },
    post: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

// Create discriminator models
const Student = User.discriminator('student', StudentSchema);
const Faculty = User.discriminator('faculty', FacultySchema);

module.exports = {
    User,
    Student,
    Faculty
}; 