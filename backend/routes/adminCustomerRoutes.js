const express = require("express");

const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  getCustomerBookings,
  deleteCustomer,
} = require("../controllers/adminCustomerController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==========================================
// Admin Customer Routes
// ==========================================

// Get all customers
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllCustomers
);

// Get single customer
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getCustomerById
);

// Get customer's booking history
router.get(
  "/:id/bookings",
  protect,
  authorizeRoles("admin"),
  getCustomerBookings
);

// Delete customer
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCustomer
);

module.exports = router;