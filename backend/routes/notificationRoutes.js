
const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// All notification routes require login
router.use(protect);

// Get notifications
router.get("/", getMyNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadNotificationCount);

// Mark all notifications as read
router.put("/read-all", markAllNotificationsAsRead);

// Mark one notification as read
router.put("/:notificationId/read", markNotificationAsRead);

module.exports = router;
