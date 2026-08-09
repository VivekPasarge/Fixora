const express = require("express");

const router = express.Router();


// =========================================================
// Controller
// =========================================================

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  toggleServiceStatus,
  deleteService,
} = require("../controllers/serviceController");


// =========================================================
// Routes
// =========================================================

// Create Service
router.post(
  "/",
  createService
);


// Get All Services
router.get(
  "/",
  getAllServices
);


// Get Single Service
router.get(
  "/:id",
  getServiceById
);


// Update Service
router.put(
  "/:id",
  updateService
);


// Toggle Active / Inactive
router.patch(
  "/:id/status",
  toggleServiceStatus
);


// Delete Service
router.delete(
  "/:id",
  deleteService
);


module.exports = router;