const NotificationModel = require("../models/Notification");
const UserModel = require("../models/UserModel");

// Create a notification
const createNotification = async (recipientId, senderId, postId, type, message) => {
    try {
        // Don't create notification if user is liking/commenting on their own post
        if (recipientId.toString() === senderId.toString()) {
            return;
        }

        const notification = new NotificationModel({
            recipient: recipientId,
            sender: senderId,
            post: postId,
            type,
            message
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// Get notifications for a user
const getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const notifications = await NotificationModel.find({ recipient: userId })
            .populate('sender', 'username')
            .populate('post', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ 
            success: true, 
            notifications 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch notifications", 
            error: error.message 
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    try {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: "Notification not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Notification marked as read",
            notification 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to mark notification as read", 
            error: error.message 
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        await NotificationModel.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ 
            success: true, 
            message: "All notifications marked as read" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to mark notifications as read", 
            error: error.message 
        });
    }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
    const userId = req.user.id;

    try {
        const count = await NotificationModel.countDocuments({ 
            recipient: userId, 
            isRead: false 
        });

        res.status(200).json({ 
            success: true, 
            unreadCount: count 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to get unread count", 
            error: error.message 
        });
    }
};

module.exports = { 
    createNotification, 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount 
}; 