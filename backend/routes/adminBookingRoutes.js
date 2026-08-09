const express = require("express");

const router = express.Router();

const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/adminBookingController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==========================================
// Get All Bookings
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllBookings
);

// ==========================================
// Get Single Booking
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getBookingById
);

// ==========================================
// Update Booking Status
// ==========================================

router.put(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateBookingStatus
);

// ==========================================
// Delete Booking
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteBooking
);

module.exports = router;