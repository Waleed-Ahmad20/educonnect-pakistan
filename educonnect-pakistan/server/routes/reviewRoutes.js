const express = require('express');
const router = express.Router();
const { auth, tutorAuth, studentAuth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const studentController = require('../controllers/studentController');

// Get all reviews for a specific tutor
router.get('/tutor/:tutorId', reviewController.getTutorReviews);

// Get review for a specific session
router.get('/session/:sessionId', auth, reviewController.getSessionReview);

// Get reviews for the authenticated student
router.get('/student', [auth, studentAuth], studentController.getStudentReviews);

// Report a review
router.post('/report/:reviewId', auth, tutorAuth, reviewController.reportReview);

module.exports = router;