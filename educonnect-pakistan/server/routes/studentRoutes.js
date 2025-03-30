const express = require('express');
const router = express.Router();
const { auth, studentAuth } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Wishlist routes
router.get('/wishlist', auth, studentAuth, studentController.getWishlist);
router.post('/wishlist/:tutorId', auth, studentAuth, studentController.addToWishlist);
router.delete('/wishlist/:tutorId', auth, studentAuth, studentController.removeFromWishlist);

// Review routes
router.post('/reviews', auth, studentAuth, studentController.createReview);
router.get('/reviews', auth, studentAuth, studentController.getStudentReviews);
router.put('/reviews/:reviewId', auth, studentAuth, studentController.updateReview);
router.delete('/reviews/:reviewId', auth, studentAuth, studentController.deleteReview);

// Profile routes
router.put('/profile', auth, studentAuth, studentController.updateStudentProfile);

module.exports = router;