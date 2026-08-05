const Review = require("../models/reviewModel");
const Booking = require("../models/Booking");

// @desc    Create Review
// @route   POST /api/reviews
// @access  Private (Customer)

const createReview = async (req, res) => {
  try {

    const { bookingId, rating, review } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customer.toString() !== req.user.id) {
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

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const newReview = await Review.create({
      booking: booking._id,
      customer: booking.customer,
      technician: booking.technician,
      rating,
      review,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc    Get Technician Reviews
// @route   GET /api/reviews/technician/:id
// @access  Public

const getTechnicianReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      technician: req.params.id,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// @desc    Get Technician Average Rating
// @route   GET /api/reviews/technician/:id/rating
// @access  Public

const getTechnicianRating = async (req, res) => {
  try {

    const reviews = await Review.find({
      technician: req.params.id,
    });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating = totalRating / reviews.length;

    res.status(200).json({
      success: true,
      averageRating: Number(
        averageRating.toFixed(1)
      ),
      totalReviews: reviews.length,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  createReview,
  getTechnicianReviews,
  getTechnicianRating,
};