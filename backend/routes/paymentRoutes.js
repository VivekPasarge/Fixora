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
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

router.post(
  "/create-order",
  protect,
  authorizeRoles("customer"),
  createRazorpayOrder
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

router.post(
  "/verify",
  protect,
  authorizeRoles("customer"),
  verifyRazorpayPayment
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;