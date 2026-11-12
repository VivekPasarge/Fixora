
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  testAuth,
  register,
  login,
  profile,
  updateProfile,
  completeProfile,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  googleLogin,
} = require("../controllers/authController");

// ==========================================================
// RATE LIMITERS
// ==========================================================

// Login: maximum 10 failed attempts per IP in 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Registration: maximum 5 attempts per IP per hour.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

// Google login: maximum 10 attempts per IP in 15 minutes.
const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many Google login attempts. Please try again later.",
  },
});

// Forgot password: maximum 3 requests per IP in 15 minutes.
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
});

// OTP verification: maximum 5 requests per IP in 15 minutes.
const verifyOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again later.",
  },
});

// Password reset: maximum 5 requests per IP in 15 minutes.
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
});

// ==========================================================
// TEST
// ==========================================================

router.get("/test", testAuth);

// ==========================================================
// AUTHENTICATION
// ==========================================================

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/google", googleLimiter, googleLogin);

// ==========================================================
// FORGOT PASSWORD OTP
// ==========================================================

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyOTPLimiter,
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPassword
);

// ==========================================================
// USER PROFILE
// ==========================================================

router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;
