const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, tutorAuth } = require('../middleware/auth');
const tutorController = require('../controllers/tutorController');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tutor-documents');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'));
        }
    }
});

// SPECIFIC ROUTES FIRST - before the /:id route!
// Get verification status
router.get('/verification-status', auth, tutorAuth, tutorController.getVerificationStatus);

// Get tutor earnings
router.get('/earnings', auth, tutorAuth, tutorController.getTutorEarnings);

// Upload verification documents
router.post(
    '/documents',
    auth,
    tutorAuth,
    upload.array('documents', 5),
    tutorController.uploadDocuments
);

// Update tutor profile
router.post('/profile', auth, tutorAuth, tutorController.updateTutorProfile);

// Update tutor availability
router.put('/availability', auth, tutorAuth, tutorController.updateAvailability);

// Update hourly rate
router.put('/hourlyRate', auth, tutorAuth, tutorController.updateHourlyRate);

// GENERAL ROUTES LAST
// Get all tutors with filtering
router.get('/', tutorController.getAllTutors);

// Get single tutor by ID - This should be last!
router.get('/:id', tutorController.getTutorById);

module.exports = router;