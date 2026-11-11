
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
    // SMART TECHNICIAN MATCHING
    // =====================================================

    matchingStatus: {
      type: String,
      enum: [
        "Not Started",
        "Searching",
        "Offering",
        "Assigned",
        "No Technician",
      ],
      default: "Not Started",
    },

    matchingQueue: [
      {
        technician: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: {
          type: Number,
          default: 0,
        },
        distanceKm: {
          type: Number,
          default: null,
        },
      },
    ],

    matchingCurrentIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentOfferTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    currentOfferExpiresAt: {
      type: Date,
      default: null,
    },

    matchingLastUpdatedAt: {
      type: Date,
      default: null,
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
    // CUSTOMER LOCATION
    // =====================================================

    customerLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null,
      },
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
    // TECHNICIAN BOOKING HISTORY
    // =====================================================

    technicianRemoved: {
      type: Boolean,
      default: false,
    },

    technicianRemovedAt: {
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
      enum: ["Cash on Service", "UPI", "Card"],
      default: "Cash on Service",
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    // =====================================================
    // RAZORPAY ORDER ID
    // =====================================================

    razorpayOrderId: {
      type: String,
      default: null,
    },

    // =====================================================
    // RAZORPAY PAYMENT ID
    // =====================================================

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // =====================================================
    // RAZORPAY SIGNATURE
    // =====================================================

    razorpaySignature: {
      type: String,
      default: null,
    },

    // =====================================================
    // PAYMENT DATE
    // =====================================================

    paidAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // COD CASH COLLECTION AUDIT
    // =====================================================

    cashReceivedAt: {
      type: Date,
      default: null,
    },

    cashReceivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // OTP VERIFICATION
    // =====================================================

    otp: {
      type: String,
      default: "",
      select: false,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    otpVerifiedAt: {
      type: Date,
      default: null,
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

// =====================================================
// MATCHING INDEX
// =====================================================

bookingSchema.index({
  status: 1,
  matchingStatus: 1,
  currentOfferExpiresAt: 1,
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model("Booking", bookingSchema);
