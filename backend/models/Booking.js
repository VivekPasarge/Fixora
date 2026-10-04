const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // =====================================================
    // BOOKING ID
    // =====================================================

    bookingId: {
      type: String,
      unique: true,
    },

    // =====================================================
    // CUSTOMER
    // =====================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // TECHNICIAN
    // =====================================================

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // TECHNICIANS WHO DECLINED
    // =====================================================

    declinedTechnicians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =====================================================
    // PREVIOUS TECHNICIAN CANCELLATION
    // =====================================================

    technicianCancelled: {
      type: Boolean,
      default: false,
    },

    technicianCancellation: {
      technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        default: "",
      },
    },

    // =====================================================
    // CUSTOMER BOOKING HISTORY
    // =====================================================

    customerRemoved: {
      type: Boolean,
      default: false,
    },

    customerRemovedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // SERVICE
    // =====================================================

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // =====================================================
    // BOOKING DETAILS
    // =====================================================

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
      min: 0,
    },

    // =====================================================
    // BOOKING STATUS
    // =====================================================

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

    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    paymentMethod: {
      type: String,

      enum: [
        "Cash on Service",
        "UPI",
        "Card",
      ],

      default: "Cash on Service",
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    // IMPORTANT:
    // New bookings always start as Pending.
    //
    // Creating a Razorpay order also keeps this Pending.
    //
    // Only successful Razorpay verification changes
    // this value to Paid.

    paymentStatus: {
      type: String,

      enum: [
        "Pending",
        "Paid",
      ],

      default: "Pending",
    },

    // =====================================================
    // RAZORPAY ORDER ID
    // =====================================================

    // Created when backend creates a Razorpay order.

    razorpayOrderId: {
      type: String,
      default: null,
    },

    // =====================================================
    // RAZORPAY PAYMENT ID
    // =====================================================

    // Received after successful Razorpay payment.

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // =====================================================
    // RAZORPAY SIGNATURE
    // =====================================================

    // Used by backend to verify payment authenticity.

    razorpaySignature: {
      type: String,
      default: null,
    },

    // =====================================================
    // PAYMENT DATE
    // =====================================================

    // Set only after successful payment verification.

    paidAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // OTP VERIFICATION
    // =====================================================

    otp: {
      type: String,
      default: "",
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // LIVE TECHNICIAN TRACKING
    // =====================================================

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

    // =====================================================
    // TRACKING STATUS
    // =====================================================

    trackingActive: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

// =========================================================
// MODEL
// =========================================================

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);