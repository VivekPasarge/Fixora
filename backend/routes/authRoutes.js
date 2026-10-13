
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
  googleLogin,
} = require("../controllers/authController");

router.get("/test", testAuth);

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;
