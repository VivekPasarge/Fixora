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
  verifyResetOTP,
  resetPassword,
  googleLogin,
} = require("../controllers/authController");

// ==========================================
// TEST
// ==========================================

router.get("/test", testAuth);

// ==========================================
// AUTHENTICATION
// ==========================================

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// ==========================================
// FORGOT PASSWORD OTP
// ==========================================

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// ==========================================
// USER PROFILE
// ==========================================

router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;