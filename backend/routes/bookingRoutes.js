const express = require("express");
const router = express.Router();

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  acceptBooking,
  getPendingBookings,
  getAssignedBookings,
  updateBookingStatus,
  verifyBookingOTP,
  cancelBooking,
  getAvailableJobs,
  getBookingById,
  payForBooking,
} = require("../controllers/bookingController");

// ==========================================
// Customer Routes
// ==========================================

// Create Booking
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createBooking
);

// My Bookings
router.get(
  "/my-bookings",
  protect,
  authorizeRoles("customer"),
  getMyBookings
);

// Cancel Booking
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer"),
  cancelBooking
);
router.put(
  "/:id/pay",
  protect,
  authorizeRoles("customer"),
  payForBooking
);

// ==========================================
// Technician Routes
// ==========================================

// Available Jobs
router.get(
  "/available",
  protect,
  authorizeRoles("technician"),
  getAvailableJobs
);

// Assigned Jobs
router.get(
  "/assigned",
  protect,
  authorizeRoles("technician"),
  getAssignedBookings
);

// Pending Jobs
router.get(
  "/pending",
  protect,
  authorizeRoles("technician"),
  getPendingBookings
);

// Accept Booking
router.put(
  "/:id/accept",
  protect,
  authorizeRoles("technician"),
  acceptBooking
);

// Update Booking Status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("technician"),
  updateBookingStatus
);

// Verify OTP
router.put(
  "/:id/verify-otp",
  protect,
  authorizeRoles("technician"),
  verifyBookingOTP
);

// ==========================================
// Common Routes
// ==========================================

// Get Single Booking
router.get(
  "/:id",
  protect,
  getBookingById
);

// Get All Bookings (Admin / Testing)
router.get(
  "/",
  getAllBookings
);

module.exports = router;