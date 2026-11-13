
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "BOOKING_CREATED",
        "BOOKING_ACCEPTED",
        "BOOKING_CANCELLED",
        "TECHNICIAN_ASSIGNED",
        "TECHNICIAN_ON_THE_WAY",
        "SERVICE_STARTED",
        "SERVICE_COMPLETED",
        "PAYMENT_SUCCESS",
        "PAYMENT_RECEIVED",
        "NEW_JOB",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
