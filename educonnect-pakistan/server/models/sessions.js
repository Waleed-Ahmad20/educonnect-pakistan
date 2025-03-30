const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        default: "Physics"
    },
    topic: {
        type: String
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
    duration: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['online', 'in-person'],
        required: true
    },
    location: {

        address: String,
        city: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    meetingLink: {

        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    price: {
        type: Number,
        required: true
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        method: {
            type: String,
            enum: ['credit_card', 'bank_transfer', 'wallet', 'other']
        },
        transactionId: String,
        paidAt: Date
    },
    notes: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isReviewed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

sessionSchema.index({ tutor: 1, date: 1, startTime: 1 }, { unique: true });
sessionSchema.index({ student: 1, date: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);