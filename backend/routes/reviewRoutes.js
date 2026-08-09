const express = require("express");
const router = express.Router();

const {
  createReview,
  getTechnicianReviews,
  getTechnicianRating,
  checkReview,
} = require("../controllers/reviewController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Customer submits a review
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createReview
);

// Get all reviews of a technician
router.get("/technician/:id", getTechnicianReviews);

// Get technician average rating
router.get("/technician/:id/rating", getTechnicianRating);
router.get(
  "/check/:bookingId",
  protect,
  authorizeRoles("customer"),
  checkReview
);



module.exports = router;