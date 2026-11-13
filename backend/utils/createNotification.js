
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

// ==========================================
// CREATE AND SEND NOTIFICATION
// ==========================================
const createNotification = async ({
  userId,
  title,
  message,
  type = "GENERAL",
  bookingId = null,
  metadata = {},
}) => {
  try {
    if (!userId || !title || !message) {
      console.error("Notification requires userId, title and message");
      return null;
    }

    // Save notification in MongoDB
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      booking: bookingId,
      metadata,
    });

    // Prepare notification data
    const notificationData = notification.toObject();

    // Send notification through existing Socket.IO
    const io = getIO();

    if (io) {
      io.to(`user:${userId.toString()}`).emit(
        "new-notification",
        notificationData
      );
    }

    console.log(
      `Notification created for user ${userId}: ${title}`
    );

    return notification;
  } catch (error) {
    // Notification failure should not break booking/payment operations.
    console.error("Create Notification Error:", error.message);
    return null;
  }
};

module.exports = createNotification;
