
const express = require("express");

const router = express.Router();

const {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// All routes below require an authenticated admin.

// ADMIN DASHBOARD
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboardStats
);

// GET CUSTOMERS AND TECHNICIANS
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAdminUsers
);

// BLOCK OR UNBLOCK USER
router.patch(
  "/users/:userId/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus
);

module.exports = router;
