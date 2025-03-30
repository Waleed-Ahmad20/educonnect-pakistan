const Notification = require('../models/notifications');

exports.getNotifications = async (req, res) => {
    try {
        const { unreadOnly, page = 1, limit = 10 } = req.query;

        const query = { recipient: req.user.id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const total = await Notification.countDocuments(query);
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const notifications = await Notification.find(query)
            .populate('sender', 'firstName lastName profilePicture role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.json({
            success: true,
            data: {
                notifications,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (!notification.isRead) {
            notification.isRead = true;
            await notification.save();
        }

        return res.json({
            success: true,
            data: { notification }
        });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        return res.json({
            success: true,
            message: `${result.nModified} notifications marked as read`
        });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

