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

  // Technician cancellation
  technicianCancelJob,

  // Technician pre-acceptance decline
  declineAvailableJob,

  // Technician completed job removal
  removeCompletedJob,

  // Customer booking history
  removeBookingFromMyBookings,
  getMyBookingHistory,

  // Booking availability
  getBookedTimeSlots,
} = require("../controllers/bookingController");

// =====================================================
// CUSTOMER ROUTES
// =====================================================

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
// Check Booked Time Slots
// ==========================================

router.get(
  "/availability",
  getBookedTimeSlots
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
// Customer Booking History
// ==========================================

router.get(
  "/my-history",
  protect,
  authorizeRoles("customer"),
  getMyBookingHistory
);

// ==========================================
// Remove Booking From My Bookings
// ==========================================

router.put(
  "/:id/remove-from-my-bookings",
  protect,
  authorizeRoles("customer"),
  removeBookingFromMyBookings
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

// =====================================================
// TECHNICIAN ROUTES
// =====================================================

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
// Technician Pre-Acceptance Decline
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
// Technician Cancel After Accepting
// ==========================================

router.put(
  "/:id/technician-cancel",
  protect,
  authorizeRoles("technician"),
  technicianCancelJob
);

// ==========================================
// Remove Completed Job
// ==========================================

router.put(
  "/:id/remove-completed",
  protect,
  authorizeRoles("technician"),
  removeCompletedJob
);

// =====================================================
// COMMON ROUTES
// =====================================================

// ==========================================
// Active Booking
// ==========================================

router.get(
  "/active",
  protect,
  getActiveBooking
);

// =====================================================
// TECHNICIAN AVAILABILITY
// =====================================================

// ==========================================
// Get Online / Offline Status
// ==========================================

router.get(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  getTechnicianAvailability
);

// ==========================================
// Change Online / Offline Status
// ==========================================

router.put(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  updateTechnicianAvailability
);

// =====================================================
// PAYMENT HISTORY
// =====================================================

// ==========================================
// Customer Payment History
// ==========================================

router.get(
  "/payment-history",
  protect,
  authorizeRoles("customer"),
  getPaymentHistory
);

// =====================================================
// TECHNICIAN STATISTICS
// =====================================================

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

// =====================================================
// ADMIN ROUTES
// =====================================================

// ==========================================
// Get All Bookings
// ==========================================
//
// ADMIN ONLY
//
// This route is protected so normal customers
// and technicians cannot access all bookings.
//
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllBookings
);

// =====================================================
// SINGLE BOOKING
// =====================================================
//
// IMPORTANT:
// Keep /:id AFTER all specific GET routes.
//
// Otherwise:
// /payment-history
// /technician/stats
// /technician/earnings
// /active
//
// could potentially be interpreted as :id.
//
// =====================================================

router.get(
  "/:id",
  protect,
  getBookingById
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;