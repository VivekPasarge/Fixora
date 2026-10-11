
const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const Booking = require("../models/Booking");

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const customerId = req.user._id || req.user.id;
    const numericRating = Number(rating);
    const reviewText = typeof review === "string" ? review.trim() : "";

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid booking ID is required",
      });
    }

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (!reviewText || reviewText.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review must contain 1 to 500 characters",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (String(booking.customer) !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to review this booking",
      });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be reviewed",
      });
    }

    if (booking.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Please complete the payment before submitting a review",
      });
    }

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message: "This booking does not have an assigned technician",
      });
    }

    const existingReview = await Review.findOne({
      booking: booking._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "A review has already been submitted for this booking",
      });
    }

    const newReview = await Review.create({
      booking: booking._id,
      customer: customerId,
      technician: booking.technician,
      rating: numericRating,
      review: reviewText,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A review has already been submitted for this booking",
      });
    }

    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

const getTechnicianReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician ID",
      });
    }

    const reviews = await Review.find({
      technician: req.params.id,
    })
      .populate("customer", "name")
      .populate("booking", "bookingId service")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get Technician Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician reviews",
    });
  }
};

const getTechnicianRating = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician ID",
      });
    }

    const result = await Review.aggregate([
      {
        $match: {
          technician: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const rating = result[0];

    return res.status(200).json({
      success: true,
      averageRating: rating
        ? Number(rating.averageRating.toFixed(1))
        : 0,
      totalReviews: rating ? rating.totalReviews : 0,
    });
  } catch (error) {
    console.error("Get Technician Rating Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician rating",
    });
  }
};

const checkReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const review = await Review.findOne({
      booking: req.params.bookingId,
      customer: req.user._id || req.user.id,
    })
      .select("_id rating review createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      reviewed: Boolean(review),
      review: review || null,
    });
  } catch (error) {
    console.error("Check Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check review status",
    });
  }
};

module.exports = {
  createReview,
  getTechnicianReviews,
  getTechnicianRating,
  checkReview,
};
