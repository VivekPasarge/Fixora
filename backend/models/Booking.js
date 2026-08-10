const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    // ===============================
    // Customer
    // ===============================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // Technician
    // ===============================

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ===============================
    // Service
    // ===============================

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ===============================
    // Booking Details
    // ===============================

    address: {
      type: String,
      required: true,
      trim: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // ===============================
    // Booking Status
    // ===============================

    status: {
      type: String,

      enum: [
        "Pending",
        "Accepted",
        "On The Way",
        "In Progress",
        "Completed",
        "Cancelled",
      ],

      default: "Pending",
    },

    // ===============================
    // Payment
    // ===============================

    paymentMethod: {
      type: String,

      enum: [
        "Cash on Service",
        "UPI",
        "Card",
      ],

      default: "Cash on Service",
    },

    paymentStatus: {
      type: String,

      enum: [
        "Pending",
        "Paid",
      ],

      default: "Pending",
    },

    // ===============================
    // OTP Verification
    // ===============================

    otp: {
      type: String,
      default: "",
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // Live Technician Tracking
    // ===============================

    technicianLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    trackingActive: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);