const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutors: [{
        tutor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

wishlistSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);