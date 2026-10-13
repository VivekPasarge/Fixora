
const express = require("express");
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
  resetPassword,
} = require("../controllers/authController");

// Test route
router.get("/test", testAuth);

// Authentication
router.post("/register", register);
router.post("/login", login);

// Forgot Password — temporary debugging logs
router.post("/forgot-password", (req, res, next) => {
  console.log("FORGOT PASSWORD ROUTE HIT");
  console.log("Request body:", req.body);
  next();
}, forgotPassword);

// Reset Password
router.post("/reset-password", resetPassword);

// Profile routes
router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;
