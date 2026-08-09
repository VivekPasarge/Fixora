const express = require("express");

const router = express.Router();

const {
  getAllTechnicians,
  getTechnicianById,
  getTechnicianBookings,
  deleteTechnician,
} = require("../controllers/adminTechnicianController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ==========================================
// Get All Technicians
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllTechnicians
);

// ==========================================
// Get Single Technician
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getTechnicianById
);

// ==========================================
// Get Technician Booking History
// ==========================================

router.get(
  "/:id/bookings",
  protect,
  authorizeRoles("admin"),
  getTechnicianBookings
);

// ==========================================
// Delete Technician
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteTechnician
);

module.exports = router;