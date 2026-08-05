const express = require("express");

const router = express.Router();

const {
  registerPartner,
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
} = require("../controllers/partnerController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Register Partner
router.post("/", registerPartner);

// Get All Partners (Admin)
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllPartners
);

// Get Single Partner (Admin)
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getPartnerById
);

// Approve / Reject Partner (Admin)
router.put(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updatePartnerStatus
);

module.exports = router;