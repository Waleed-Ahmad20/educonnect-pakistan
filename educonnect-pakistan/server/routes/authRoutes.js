const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    register,
    login,
    getCurrentUser,
    changePassword
} = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user
router.get('/me', auth, getCurrentUser);

// Change password
router.put('/password', auth, changePassword);

module.exports = router;