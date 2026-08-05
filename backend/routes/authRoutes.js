const express = require("express");
const router = express.Router();
//const protect = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  testAuth,
  register,
  login,
  profile,
  updateProfile,
  completeProfile,
} = require("../controllers/authController");

// Test Route
router.get("/test", testAuth);

// Register Route
router.post("/register", register);
//login
router.post("/login", login);

router.get("/profile", protect, profile);
router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/complete-profile",
  protect,
  completeProfile
);

module.exports = router;