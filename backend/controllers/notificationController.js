const Notification = require("../models/Notification");

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Create a notification manually (mostly used internally, but helpful for testing)
const createNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const notification = new Notification({
            user: req.user._id,
            title,
            message,
            type: type || 'info'
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const createInternalNotification = async (userId, title, message, type = 'info') => {
    try {
        const notification = new Notification({
            user: userId,
            title,
            message,
            type
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating internal notification:", error);
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    createInternalNotification
};
