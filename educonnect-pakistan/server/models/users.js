const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
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
    phone: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png'
    },
    role: {
        type: String,
        enum: ['student', 'tutor', 'admin'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { discriminatorKey: 'role' });


const User = mongoose.model('User', userSchema);


const studentSchema = new Schema({
    educationLevel: {
        type: String,
        enum: ['primary', 'secondary', 'college', 'university', 'other'],
        required: true
    },
    institution: {
        type: String
    },
    subjects: [{
        type: String
    }],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});


const tutorSchema = new Schema({
    bio: {
        type: String,
        default: true
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        document: String
    }],
    subjects: [{
        name: String,
        // level: {
        //     type: String,
        //     enum: ['primary', 'secondary', 'college', 'university', 'professional'],
        //     default: 'college'
        // }
    }],
    hourlyRate: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        city: String,
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    teachingPreference: {
        type: String,
        enum: ['online', 'in-person', 'both'],
        default: 'both'
    },
    availability: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        slots: [{
            startTime: String,
            endTime: String
        }]
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    bankDetails: {
        accountTitle: String,
        accountNumber: String,
        bankName: String
    }
});


const adminSchema = new Schema({
    permissions: {
        type: [String],
        enum: ['manage_users', 'manage_sessions', 'manage_reviews',
            'verify_tutors', 'view_reports', 'manage_payments', 'super_admin'],
        default: ['manage_users']
    },
    adminLevel: {
        type: String,
        enum: ['level1', 'level2', 'super_admin'],
        default: 'level1'
    }
});


const Student = User.discriminator('student', studentSchema);
const Tutor = User.discriminator('tutor', tutorSchema);
const Admin = User.discriminator('admin', adminSchema);

module.exports = { User, Student, Tutor, Admin };