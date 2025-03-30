const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getNotifications);
router.put('/:id/read', auth, notificationController.markNotificationAsRead);
router.put('/read-all', auth, notificationController.markAllNotificationsAsRead);

module.exports = router;
