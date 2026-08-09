const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Review = require("../models/reviewModel");

// ==========================================
// Create Booking
// ==========================================
const createBooking = async (req, res) => {
  try {
    const {
      service,
      address,
      bookingDate,
      bookingTime,
      paymentMethod,
    } = req.body;

    const customer = req.user.id;

    if (
      !customer ||
      !service ||
      !address ||
      !bookingDate ||
      !bookingTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    //const totalBookings = await Booking.countDocuments();

const lastBooking = await Booking
  .findOne()
  .sort({ createdAt: -1 });

let bookingNumber = 1;

if (lastBooking && lastBooking.bookingId) {

  bookingNumber =
    Number(
      lastBooking.bookingId.split("-")[2]
    ) + 1;

}

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Booking.create({
      // bookingId: `FXR-${new Date().getFullYear()}-${String(
      //   totalBookings + 1
      // ).padStart(6, "0")}`,

      bookingId: `FXR-${new Date().getFullYear()}-${String(
  bookingNumber
).padStart(6, "0")}`,

      customer,
      service,
      address,
      bookingDate,
      bookingTime,
      price: serviceData.price,
      paymentMethod,

      paymentStatus:
        paymentMethod === "Cash on Service"
          ? "Pending"
          : "Paid",

      otp,
    });

    res.status(201).json({
      success: true,
      message: "Booking Created Successfully",
      booking,
      otp,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Bookings
// ==========================================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("service", "name category price")
      .populate("technician", "name email");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Bookings
// ==========================================
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
      .populate("service")
      .populate("technician")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Technician Dashboard Statistics
// ==========================================
const getTechnicianStats = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const assignedJobs = await Booking.countDocuments({
      technician: technicianId,
    });

    const completedJobs = await Booking.countDocuments({
      technician: technicianId,
      status: "Completed",
    });

    const completedBookings = await Booking.find({
      technician: technicianId,
      status: "Completed",
      paymentStatus: "Paid",
    });

    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + booking.price,
      0
    );

    const reviews = await Review.find({
      technician: technicianId,
    });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      averageRating = totalRating / reviews.length;
    }

    res.status(200).json({
      success: true,
      assignedJobs,
      completedJobs,
      totalEarnings,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// Technician Earnings
// ==========================================

const getTechnicianEarnings = async (req, res) => {

  try {

    const technicianId = req.user.id;

    const completedBookings =
      await Booking.find({
        technician: technicianId,
        status: "Completed",
        paymentStatus: "Paid",
      })
      .populate("service", "name")
      .sort({ updatedAt: -1 });

    const totalEarnings =
      completedBookings.reduce(
        (sum, booking) =>
          sum + booking.price,
        0
      );

    const today = new Date();

    const todayEarnings =
      completedBookings
        .filter((booking) => {

          const date =
            new Date(booking.updatedAt);

          return (
            date.getDate() ===
              today.getDate() &&
            date.getMonth() ===
              today.getMonth() &&
            date.getFullYear() ===
              today.getFullYear()
          );

        })
        .reduce(
          (sum, booking) =>
            sum + booking.price,
          0
        );

    res.status(200).json({

      success: true,

      totalEarnings,

      todayEarnings,

      completedJobs:
        completedBookings.length,

      bookings:
        completedBookings,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// ==========================================
// Get Single Booking
// ==========================================
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate(
        "technician",
        "name phone profession profilePhoto"
      )
      .populate(
        "service",
        "name category price image"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Accept Booking
// ==========================================
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Booking is already accepted",
      });
    }

    booking.technician = req.user.id;
    booking.status = "Accepted";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Update Booking Status
// ==========================================
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message: "No technician assigned",
      });
    }

    if (booking.technician.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    const allowedStatus = ["In Progress", "Completed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    booking.status = status;

    if (
      status === "Completed" &&
      booking.paymentMethod !== "Cash on Service"
    ) {
      booking.paymentStatus = "Paid";
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Verify Booking OTP
// ==========================================
const verifyBookingOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message: "No technician assigned",
      });
    }

    if (booking.technician.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this booking",
      });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    booking.otpVerified = true;
    booking.status = "In Progress";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Pay For Booking
// ==========================================
const payForBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Service is not completed yet",
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed",
      });
    }

    booking.paymentStatus = "Paid";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment Successful",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Payment History
// ==========================================
const getPaymentHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
      .populate("service", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Pending Bookings (Admin)
// ==========================================
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "Pending",
    })
      .populate("customer", "name phone")
      .populate("service", "name category price image");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Assigned Bookings (Technician)
// ==========================================
const getAssignedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      technician: req.user.id,
    })
      .populate("customer", "name phone address")
      .populate("service", "name category price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Cancel Booking
// ==========================================
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Available Jobs (Technician)
// ==========================================
const getAvailableJobs = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "Pending",
    })
      .populate("customer", "name phone")
      .populate("service", "name category price image")
      .sort({ bookingDate: 1, bookingTime: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// Get Active Booking For Logged-In User
// GET /api/bookings/active
// =========================================================

const getActiveBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let booking;

    // ==========================================
    // CUSTOMER
    // ==========================================

    if (userRole === "customer") {
      booking = await Booking.findOne({
        customer: userId,
        status: {
          $in: ["Pending", "Accepted", "In Progress"],
        },
      })
        .populate("service")
        .populate("technician")
        .sort({ createdAt: -1 });
    }


    // ==========================================
    // TECHNICIAN
    // ==========================================

    else if (userRole === "technician") {
      booking = await Booking.findOne({
        technician: userId,
        status: {
          $in: ["Accepted", "In Progress"],
        },
      })
        .populate("service")
        .populate("customer")
        .sort({ createdAt: -1 });
    }


    // ==========================================
    // ADMIN
    // ==========================================

    else if (userRole === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Live tracking is not available for administrators",
      });
    }


    // ==========================================
    // UNKNOWN ROLE
    // ==========================================

    else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }


    // ==========================================
    // NO ACTIVE BOOKING
    // ==========================================

    if (!booking) {
      return res.status(200).json({
        success: true,
        active: false,
        booking: null,
        message:
          userRole === "technician"
            ? "You do not have an active job"
            : "You do not have an active service",
      });
    }


    // ==========================================
    // ACTIVE BOOKING FOUND
    // ==========================================

    res.status(200).json({
      success: true,
      active: true,
      booking,
    });

  } catch (error) {
    console.error(
      "Get Active Booking Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch active booking",
    });
  }
};

// ==========================================
// Exports
// ==========================================
module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getTechnicianStats,
  getBookingById,
  acceptBooking,
  updateBookingStatus,
  verifyBookingOTP,
  payForBooking,
  getPaymentHistory,
  getPendingBookings,
  getAssignedBookings,
  cancelBooking,
  getAvailableJobs,
  getTechnicianEarnings,
  getActiveBooking,
};