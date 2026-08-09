const express = require("express");

const router = express.Router();

const {
  getAdminDashboardStats,
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==========================================
// Admin Dashboard Statistics
// ==========================================

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboardStats
);

module.exports = router;