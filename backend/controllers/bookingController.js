const Booking = require("../models/Booking");
const Service = require("../models/Service");

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

    // Check Service
    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Generate Booking ID
    const totalBookings =
      await Booking.countDocuments();
      const otp = Math.floor(
  1000 + Math.random() * 9000
).toString();

    const booking = await Booking.create({
  bookingId: `FXR-${new Date().getFullYear()}-${String(
    totalBookings + 1
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
// Get Single Booking
// ==========================================

const getBookingById = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id)
      .populate(
        "customer",
        "name phone email"
      )
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

    const allowedStatus = [
      "In Progress",
      "Completed",
    ];

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

// @desc    Mark Cash on Service Payment as Paid
// @route   PUT /api/bookings/:id/pay
// @access  Private (Customer)

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

    booking.paymentStatus = "Paid";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment Successful",
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Pending Bookings
// ==========================================

const getPendingBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      status: "Pending",
    })
      .populate("customer", "name phone")
      .populate("service", "name category price");

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
// Assigned Bookings
// ==========================================

const getAssignedBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      technician: req.user.id,
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
// Available Jobs
// ==========================================

const getAvailableJobs = async (req, res) => {
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
      message: "Server Error",
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
  acceptBooking,
  getPendingBookings,
  getAssignedBookings,
  updateBookingStatus,
  verifyBookingOTP,
  cancelBooking,
  getAvailableJobs,
  getBookingById,
  payForBooking,
};