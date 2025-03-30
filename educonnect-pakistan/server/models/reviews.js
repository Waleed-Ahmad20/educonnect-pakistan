const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
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
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isReported: {
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


reviewSchema.index({ student: 1, session: 1 }, { unique: true });
reviewSchema.index({ tutor: 1 });

module.exports = mongoose.model('Review', reviewSchema);