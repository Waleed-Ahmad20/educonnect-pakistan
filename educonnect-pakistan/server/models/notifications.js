const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['session_request', 'session_confirmed', 'session_cancelled',
            'payment_received', 'tutor_rate_change', 'review_received',
            'verification_status', 'system_message'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['Session', 'User', 'Review', 'VerificationRequest']
        },
        id: {
            type: Schema.Types.ObjectId
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);