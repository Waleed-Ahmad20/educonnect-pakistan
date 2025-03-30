const { User } = require('../models/users');
const Wishlist = require('../models/wishlists');
const Review = require('../models/reviews');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Wishlist controllers
const getWishlist = async (req, res) => {
    try {
        const studentId = req.user.id;

        let wishlist = await Wishlist.findOne({ student: studentId })
            .populate({
                path: 'tutors.tutor',
                select: 'firstName lastName email profilePicture bio subjects hourlyRate averageRating totalReviews'
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: { tutors: [] }
            });
        }

        const tutors = wishlist.tutors.map(item => ({
            ...item.tutor._doc,
            addedAt: item.addedAt,
            notes: item.notes
        }));

        return res.status(200).json({
            success: true,
            data: { tutors }
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching wishlist'
        });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { tutorId } = req.params;
        const { notes } = req.body;

        if (!ObjectId.isValid(tutorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tutor ID'
            });
        }

        const tutor = await User.findOne({ _id: tutorId, role: 'tutor', isActive: true });
        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found or inactive'
            });
        }

        let wishlist = await Wishlist.findOne({ student: studentId });
        if (!wishlist) {
            wishlist = new Wishlist({
                student: studentId,
                tutors: []
            });
        }

        const tutorIndex = wishlist.tutors.findIndex(item =>
            item.tutor.toString() === tutorId.toString()
        );

        if (tutorIndex !== -1) {
            wishlist.tutors[tutorIndex].addedAt = new Date();
            if (notes) wishlist.tutors[tutorIndex].notes = notes;
        } else {
            wishlist.tutors.push({
                tutor: tutorId,
                addedAt: new Date(),
                notes: notes || ''
            });
        }

        wishlist.updatedAt = new Date();
        await wishlist.save();

        await wishlist.populate({
            path: 'tutors.tutor',
            select: 'firstName lastName email profilePicture bio subjects hourlyRate averageRating totalReviews'
        });

        return res.status(200).json({
            success: true,
            data: { wishlist }
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while adding to wishlist'
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { tutorId } = req.params;

        if (!ObjectId.isValid(tutorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tutor ID'
            });
        }

        const wishlist = await Wishlist.findOne({ student: studentId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        const initialLength = wishlist.tutors.length;
        wishlist.tutors = wishlist.tutors.filter(item =>
            item.tutor.toString() !== tutorId.toString()
        );

        if (wishlist.tutors.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Tutor not found in wishlist'
            });
        }

        wishlist.updatedAt = new Date();
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: 'Tutor removed from wishlist successfully'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while removing from wishlist'
        });
    }
};

// Review controllers
const createReview = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { tutorId, sessionId, rating, reviewText } = req.body;

        if (!tutorId || !sessionId || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const existingReview = await Review.findOne({
            student: studentId,
            session: sessionId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review for this session already exists'
            });
        }

        const review = new Review({
            tutor: tutorId,
            student: studentId,
            session: sessionId,
            rating,
            reviewText,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await review.save();

        const tutor = await User.findById(tutorId);
        if (tutor) {
            const allReviews = await Review.find({ tutor: tutorId });
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / allReviews.length;

            tutor.averageRating = Number(averageRating.toFixed(1));
            tutor.totalReviews = allReviews.length;
            await tutor.save();
        }

        await review.populate([
            { path: 'tutor', select: 'firstName lastName' },
            { path: 'student', select: 'firstName lastName' }
        ]);

        return res.status(201).json({
            success: true,
            data: { review }
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting review'
        });
    }
};

const getStudentReviews = async (req, res) => {
    try {
        const studentId = req.user.id;

        const reviews = await Review.find({ student: studentId })
            .populate({
                path: 'tutor',
                select: 'firstName lastName profilePicture'
            })
            .populate({
                path: 'session',
                select: 'subject date duration'
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { reviewId } = req.params;
        const { rating, reviewText } = req.body;

        if (!rating && !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'No update fields provided'
            });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const review = await Review.findOne({
            _id: reviewId,
            student: studentId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized'
            });
        }

        if (rating) review.rating = rating;
        if (reviewText) review.reviewText = reviewText;
        review.updatedAt = new Date();

        await review.save();

        const tutorId = review.tutor;
        const allReviews = await Review.find({ tutor: tutorId });
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await User.findByIdAndUpdate(tutorId, {
            averageRating: Number(averageRating.toFixed(1))
        });

        await review.populate([
            { path: 'tutor', select: 'firstName lastName' },
            { path: 'student', select: 'firstName lastName' },
            { path: 'session', select: 'subject date duration' }
        ]);

        return res.status(200).json({
            success: true,
            data: { review }
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating review'
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { reviewId } = req.params;

        const review = await Review.findOne({
            _id: reviewId,
            student: studentId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized'
            });
        }

        const tutorId = review.tutor;

        await Review.deleteOne({ _id: reviewId });

        const allReviews = await Review.find({ tutor: tutorId });

        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / allReviews.length;

            await User.findByIdAndUpdate(tutorId, {
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews: allReviews.length
            });
        } else {
            await User.findByIdAndUpdate(tutorId, {
                averageRating: 0,
                totalReviews: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting review'
        });
    }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { educationLevel, institution, subjects } = req.body;

        // Input validation
        if (educationLevel && !['primary', 'middle', 'matric', 'intermediate', 'bachelors', 'masters', 'phd'].includes(educationLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid education level'
            });
        }

        // Find the student user and update
        const student = await User.findOne({ _id: studentId, role: 'student' });
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update fields if provided
        if (educationLevel !== undefined) student.educationLevel = educationLevel;
        if (institution !== undefined) student.institution = institution;
        if (subjects !== undefined) student.subjects = subjects;

        student.updatedAt = new Date();
        await student.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                educationLevel: student.educationLevel,
                institution: student.institution,
                subjects: student.subjects
            }
        });
    } catch (error) {
        console.error('Error updating student profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

module.exports = {
    // Wishlist controllers
    getWishlist,
    addToWishlist,
    removeFromWishlist,

    // Review controllers
    createReview,
    getStudentReviews,
    updateReview,
    deleteReview,

    // Update student profile
    updateStudentProfile
};