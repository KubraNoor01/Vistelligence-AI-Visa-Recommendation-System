const express = require("express");
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount 
} = require("../controllers/Notification");
const { middleWare } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// All notification routes require authentication
router.use(middleWare);

// Get user's notifications
router.get("/", getNotifications);

// Mark specific notification as read
router.put("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

module.exports = router; 