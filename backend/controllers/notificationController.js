const Notification = require('../models/Notification');

// @desc  Get notifications for logged-in user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name')
            .populate('post', 'title')
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications', error: err.message });
    }
};

// @desc  Mark a single notification as read
// @route PUT /api/notifications/:id/read
const markRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
};

// Helper used by other controllers
const createNotification = async ({ recipient, sender, type, post, comment }) => {
    if (recipient.toString() === sender.toString()) return; // don't notify yourself
    await Notification.create({ recipient, sender, type, post, comment });
};

module.exports = { getNotifications, markRead, markAllRead, createNotification };
