const express = require("express");

const router = express.Router();


// ==========================================
// Middleware
// ==========================================

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");


// ==========================================
// Controllers
// ==========================================

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
  getPaymentHistory,
  getTechnicianStats,
  getTechnicianEarnings,
  getActiveBooking,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  technicianCancelJob,

  // NEW
  declineAvailableJob,

  // Existing
  removeCompletedJob,

} = require("../controllers/bookingController");


// ==========================================
// Customer Routes
// ==========================================


// ==========================================
// Create Booking
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createBooking
);


// ==========================================
// My Bookings
// ==========================================

router.get(
  "/my-bookings",
  protect,
  authorizeRoles("customer"),
  getMyBookings
);


// ==========================================
// Customer Cancel Booking
// ==========================================

router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer"),
  cancelBooking
);


// ==========================================
// Customer Payment
// ==========================================

router.put(
  "/:id/pay",
  protect,
  authorizeRoles("customer"),
  payForBooking
);


// ==========================================
// Technician Routes
// ==========================================


// ==========================================
// Available Jobs
// ==========================================

router.get(
  "/available",
  protect,
  authorizeRoles("technician"),
  getAvailableJobs
);


// ==========================================
// PRE-ACCEPTANCE CANCEL / DECLINE
// ==========================================
//
// Technician sees:
//
// [ Cancel Job ] [ Accept Job ]
//
// This is NOT a customer cancellation.
//
// Booking remains:
//
// status = Pending
// technician = null
//
// Only this technician stops seeing
// the booking.
//
// Other technicians can still see it.
//
// ==========================================

router.put(
  "/:id/decline",
  protect,
  authorizeRoles("technician"),
  declineAvailableJob
);


// ==========================================
// Assigned Jobs
// ==========================================

router.get(
  "/technician/assigned",
  protect,
  authorizeRoles("technician"),
  getAssignedBookings
);


// ==========================================
// Pending Jobs
// ==========================================

router.get(
  "/pending",
  protect,
  authorizeRoles("technician"),
  getPendingBookings
);


// ==========================================
// Accept Booking
// ==========================================

router.put(
  "/:id/accept",
  protect,
  authorizeRoles("technician"),
  acceptBooking
);


// ==========================================
// Update Booking Status
// ==========================================

router.put(
  "/:id/status",
  protect,
  authorizeRoles("technician"),
  updateBookingStatus
);


// ==========================================
// Verify Customer OTP
// ==========================================

router.put(
  "/:id/verify-otp",
  protect,
  authorizeRoles("technician"),
  verifyBookingOTP
);


// ==========================================
// REMOVE COMPLETED JOB
// ==========================================
//
// This does NOT permanently delete
// the booking.
//
// It only removes it from the
// technician's assigned-jobs view.
//
// Customer history, admin records,
// payment and earnings remain safe.
//
// ==========================================

router.put(
  "/:id/remove-completed",
  protect,
  authorizeRoles("technician"),
  removeCompletedJob
);


// ==========================================
// TECHNICIAN CANCEL AFTER ACCEPTING
// ==========================================
//
// This is DIFFERENT from /decline.
//
// /decline
//     ↓
// Before accepting
//
// /technician-cancel
//     ↓
// After accepting
//
// Accepted / On The Way
//          ↓
// Technician cancels
//          ↓
// Booking returns to Pending
//          ↓
// Customer receives Socket.IO notification
//
// ==========================================

router.put(
  "/:id/technician-cancel",
  protect,
  authorizeRoles("technician"),
  technicianCancelJob
);


// ==========================================
// Common Routes
// ==========================================


// ==========================================
// Active Booking
// ==========================================

router.get(
  "/active",
  protect,
  getActiveBooking
);


// ==========================================
// Technician Availability
// ==========================================


// Get Online / Offline status

router.get(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  getTechnicianAvailability
);


// Change Online / Offline status

router.put(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  updateTechnicianAvailability
);


// ==========================================
// Single Booking
// ==========================================

router.get(
  "/:id",
  protect,
  getBookingById
);


// ==========================================
// Admin / Testing
// ==========================================

router.get(
  "/",
  getAllBookings
);


// ==========================================
// Customer Payment History
// ==========================================

router.get(
  "/payment-history",
  protect,
  authorizeRoles("customer"),
  getPaymentHistory
);


// ==========================================
// Technician Stats
// ==========================================

router.get(
  "/technician/stats",
  protect,
  authorizeRoles("technician"),
  getTechnicianStats
);


// ==========================================
// Technician Earnings
// ==========================================

router.get(
  "/technician/earnings",
  protect,
  authorizeRoles("technician"),
  getTechnicianEarnings
);


// ==========================================
// Export Router
// ==========================================

module.exports = router;