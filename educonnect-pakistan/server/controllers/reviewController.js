const Review = require('../models/reviews');
const Session = require('../models/sessions');
const { User } = require('../models/users');
const mongoose = require('mongoose');

// Get all reviews for a specific tutor
exports.getTutorReviews = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

        if (!mongoose.Types.ObjectId.isValid(tutorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tutor ID format'
            });
        }

        const tutor = await User.findOne({ _id: tutorId, role: 'tutor' });
        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found'
            });
        }

        let sort = {};
        if (sortBy === 'rating') {
            sort = { rating: -1 };
        } else {
            sort = { createdAt: -1 };
        }

        const total = await Review.countDocuments({
            tutor: tutorId,
            isPublic: true
        });

        const reviews = await Review.find({
            tutor: tutorId,
            isPublic: true
        })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('student', 'firstName lastName profilePicture')
            .populate('session', 'subject date')
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching tutor reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
};

// Get review for a specific session
exports.getSessionReview = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID format'
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            session.tutor.toString() !== req.user.id &&
            session.student.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this review'
            });
        }

        const review = await Review.findOne({ session: sessionId })
            .populate('student', 'firstName lastName profilePicture')
            .populate('tutor', 'firstName lastName profilePicture')
            .populate('session', 'subject date type');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found for this session'
            });
        }

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error fetching session review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching review'
        });
    }
};

// Report a review
exports.reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID format'
            });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reason for reporting is required'
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.tutor.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only report reviews about yourself'
            });
        }

        if (review.isReported) {
            return res.status(400).json({
                success: false,
                message: 'This review has already been reported'
            });
        }

        review.isReported = true;
        review.reportReason = reason;
        review.updatedAt = Date.now();
        await review.save();

        return res.status(200).json({
            success: true,
            message: 'Review has been reported successfully and will be reviewed by an administrator'
        });
    } catch (error) {
        console.error('Error reporting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while reporting review'
        });
    }
};