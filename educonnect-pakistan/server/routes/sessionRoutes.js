const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { auth, studentAuth, tutorAuth, adminAuth } = require('../middleware/auth');

// Create a new session
router.post('/', [auth, studentAuth], sessionController.createSession);

// Get all sessions
router.get('/', auth, sessionController.getSessions);

// Get sessions for the authenticated student
router.get('/student', [auth, studentAuth], sessionController.getStudentSessions);

// Get tutor session statistics
router.get('/tutor/stats', auth, tutorAuth, sessionController.getTutorSessionStats);

// Get student sessions pending reviews
router.get('/student/pending-reviews', [auth, studentAuth], sessionController.getStudentPendingReviews);

// Get calendar data
router.get('/calendar', auth, sessionController.getCalendarData);

// Get tutor availability
router.get('/tutor-availability/:tutorId', [auth, studentAuth], sessionController.getTutorAvailability);

// Get tutor sessions
router.get('/tutor', auth, tutorAuth, sessionController.getTutorSessions);

// Export sessions
router.get('/export/:format?', auth, sessionController.exportSessions);

// Get a specific session by ID
router.get('/:id', auth, sessionController.getSessionById);

// Update a session
router.put('/:id', auth, sessionController.updateSession);

// Update session status
router.put('/:id/status', auth, sessionController.updateSessionStatus);

// Delete/cancel a session
router.delete('/:id', auth, sessionController.deleteSession);

module.exports = router;