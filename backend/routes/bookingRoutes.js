
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
  declineAvailableJob,
  removeCompletedJob,
  removeBookingFromMyBookings,
  getMyBookingHistory,
  getBookedTimeSlots,
  markCashReceived,
} = require("../controllers/bookingController");

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// Create booking
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createBooking
);

// Check booked time slots
router.get(
  "/availability",
  getBookedTimeSlots
);

// Customer's bookings
router.get(
  "/my-bookings",
  protect,
  authorizeRoles("customer"),
  getMyBookings
);

// Customer booking history
router.get(
  "/my-history",
  protect,
  authorizeRoles("customer"),
  getMyBookingHistory
);

// Remove booking from customer's list
router.put(
  "/:id/remove-from-my-bookings",
  protect,
  authorizeRoles("customer"),
  removeBookingFromMyBookings
);

// Customer cancels booking
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer"),
  cancelBooking
);

// Customer payment
router.put(
  "/:id/pay",
  protect,
  authorizeRoles("customer"),
  payForBooking
);

// Customer payment history
router.get(
  "/payment-history",
  protect,
  authorizeRoles("customer"),
  getPaymentHistory
);

// =====================================================
// TECHNICIAN ROUTES
// =====================================================

// Available jobs
router.get(
  "/available",
  protect,
  authorizeRoles("technician"),
  getAvailableJobs
);

// Technician declines a job before accepting
router.put(
  "/:id/decline",
  protect,
  authorizeRoles("technician"),
  declineAvailableJob
);

// Assigned jobs
router.get(
  "/technician/assigned",
  protect,
  authorizeRoles("technician"),
  getAssignedBookings
);

// Pending jobs
router.get(
  "/pending",
  protect,
  authorizeRoles("technician"),
  getPendingBookings
);

// Accept booking
router.put(
  "/:id/accept",
  protect,
  authorizeRoles("technician"),
  acceptBooking
);

// Update booking status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("technician"),
  updateBookingStatus
);

// Verify customer OTP
router.put(
  "/:id/verify-otp",
  protect,
  authorizeRoles("technician"),
  verifyBookingOTP
);

// Confirm COD cash collection
router.put(
  "/:id/cash-received",
  protect,
  authorizeRoles("technician"),
  markCashReceived
);

// Technician cancels an accepted job
router.put(
  "/:id/technician-cancel",
  protect,
  authorizeRoles("technician"),
  technicianCancelJob
);

// Remove completed job from technician's list
router.put(
  "/:id/remove-completed",
  protect,
  authorizeRoles("technician"),
  removeCompletedJob
);

// Technician statistics
router.get(
  "/technician/stats",
  protect,
  authorizeRoles("technician"),
  getTechnicianStats
);

// Technician earnings
router.get(
  "/technician/earnings",
  protect,
  authorizeRoles("technician"),
  getTechnicianEarnings
);

// Get technician availability
router.get(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  getTechnicianAvailability
);

// Update technician availability
router.put(
  "/technician/availability",
  protect,
  authorizeRoles("technician"),
  updateTechnicianAvailability
);

// =====================================================
// COMMON ROUTES
// =====================================================

// Active booking for the logged-in user
router.get(
  "/active",
  protect,
  getActiveBooking
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all bookings
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllBookings
);

// =====================================================
// SINGLE BOOKING
// Keep this route after specific GET routes.
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
