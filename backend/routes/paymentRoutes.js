const express = require("express");

const router = express.Router();

// ==========================================
// Middleware
// ==========================================

const {
  protect,
} = require("../middleware/authMiddleware");

// ==========================================
// Controller
// ==========================================

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/payment/create-order
// ==========================================

router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payment/verify
// ==========================================

router.post(
  "/verify",
  protect,
  verifyRazorpayPayment
);

// ==========================================
// Export
// ==========================================

module.exports = router;