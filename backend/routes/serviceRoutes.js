const express = require("express");

const router = express.Router();

const {
  createService,
  getAllServices,
  getServiceById,
  getTechniciansForService,
  updateService,
  toggleServiceStatus,
  deleteService,
} = require("../controllers/serviceController");

// =========================================================
// Services
// =========================================================

// Get all services
router.get("/", getAllServices);

// Get technicians for a particular service
router.get(
  "/:id/technicians",
  getTechniciansForService
);

// Get single service
router.get(
  "/:id",
  getServiceById
);

// Create service
router.post(
  "/",
  createService
);

// Update service
router.put(
  "/:id",
  updateService
);

// Toggle service availability
router.patch(
  "/:id/toggle",
  toggleServiceStatus
);

// Delete service
router.delete(
  "/:id",
  deleteService
);

module.exports = router;