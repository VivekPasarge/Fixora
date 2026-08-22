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

  // NEW
  getBookedTimeSlots,

} = require("../controllers/bookingController");


// ==========================================
// CUSTOMER ROUTES
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
// Check Booked Time Slots
// ==========================================
//
// Customer selects:
//
// Service + Date
//
// Backend returns the time slots
// that are already booked.
//
// Example:
//
// {
//   success: true,
//   bookedSlots: [
//     "10:00 AM",
//     "02:00 PM"
//   ]
// }
//
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
//
// Shows bookings that the customer
// removed from My Bookings.
//
// IMPORTANT:
//
// These bookings are NOT deleted
// from MongoDB.
//
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
//
// CUSTOMER ONLY
//
// Allowed only for:
//
// - Completed
// - Cancelled
//
// This is a SOFT DELETE.
//
// The booking remains in MongoDB.
//
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


// ==========================================
// TECHNICIAN ROUTES
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
// Technician Pre-Acceptance Decline
// ==========================================
//
// Technician sees:
//
// [ Cancel Job ] [ Accept Job ]
//
// Cancel Job:
//
// - Booking remains Pending
// - Customer booking is NOT cancelled
// - Only this technician is removed
//   from the available job
// - Other technicians can still see it
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
// Technician Cancel After Accepting
// ==========================================
//
// This is different from /decline.
//
// /decline
//     ↓
// Before accepting
//
// /technician-cancel
//     ↓
// After accepting
//
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
//
// TECHNICIAN ONLY
//
// This is separate from customer
// booking history.
//
// ==========================================

router.put(
  "/:id/remove-completed",
  protect,
  authorizeRoles("technician"),
  removeCompletedJob
);


// ==========================================
// COMMON ROUTES
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
// TECHNICIAN AVAILABILITY
// ==========================================


// Get Online / Offline Status

router.get(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  getTechnicianAvailability
);


// Change Online / Offline Status

router.put(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  updateTechnicianAvailability
);


// ==========================================
// SINGLE BOOKING
// ==========================================
//
// Keep this route AFTER specific routes
// such as:
//
// /availability
// /my-history
// /my-bookings
//
// Otherwise those paths could be
// treated as a booking ID.
//
// ==========================================

router.get(
  "/:id",
  protect,
  getBookingById
);


// ==========================================
// ADMIN / TESTING
// ==========================================

router.get(
  "/",
  getAllBookings
);


// ==========================================
// CUSTOMER PAYMENT HISTORY
// ==========================================

router.get(
  "/payment-history",
  protect,
  authorizeRoles("customer"),
  getPaymentHistory
);


// ==========================================
// TECHNICIAN STATS
// ==========================================

router.get(
  "/technician/stats",
  protect,
  authorizeRoles("technician"),
  getTechnicianStats
);


// ==========================================
// TECHNICIAN EARNINGS
// ==========================================

router.get(
  "/technician/earnings",
  protect,
  authorizeRoles("technician"),
  getTechnicianEarnings
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;