const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Review = require("../models/reviewModel");
const User = require("../models/User");

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

    // ==========================================
    // Validate Required Fields
    // ==========================================

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

    // ==========================================
    // Validate Booking Date
    // ==========================================

    const selectedDate = new Date(bookingDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    /*
     * Fixora uses India time.
     *
     * Get today's date according to
     * Asia/Kolkata timezone.
     */
    const todayString = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(new Date());

    /*
     * bookingDate comes from the HTML date input
     * in YYYY-MM-DD format.
     *
     * Example:
     *
     * Today       = 2026-08-19
     * Yesterday   = 2026-08-18
     * Tomorrow    = 2026-08-20
     */

    if (bookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message:
          "Booking date cannot be in the past",
      });
    }

    // ==========================================
    // Validate Booking Time
    // ==========================================

    const validTimeSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "04:00 PM",
      "06:00 PM",
    ];

    if (!validTimeSlots.includes(bookingTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking time",
      });
    }

    // ==========================================
    // Prevent Past Time For Today's Booking
    // ==========================================

    if (bookingDate === todayString) {
      const now = new Date();

      let [timePart, modifier] =
        bookingTime.split(" ");

      let [hours, minutes] =
        timePart.split(":").map(Number);

      if (
        modifier === "PM" &&
        hours !== 12
      ) {
        hours += 12;
      }

      if (
        modifier === "AM" &&
        hours === 12
      ) {
        hours = 0;
      }

      const bookingMinutes =
        hours * 60 + minutes;

      /*
       * Convert current India time to minutes.
       *
       * Intl is used so the check does not depend
       * on the deployment server timezone.
       */
      const indiaTimeParts =
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        )
          .formatToParts(now)
          .reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
          }, {});

      const currentMinutes =
        Number(indiaTimeParts.hour) * 60 +
        Number(indiaTimeParts.minute);

      if (
        bookingMinutes <= currentMinutes
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected booking time has already passed. Please select a future time.",
        });
      }
    }

    // ==========================================
    // Find Service
    // ==========================================

    const serviceData =
      await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ==========================================
    // Generate Booking ID
    // ==========================================

    const lastBooking =
      await Booking.findOne().sort({
        createdAt: -1,
      });

    let bookingNumber = 1;

    if (
      lastBooking &&
      lastBooking.bookingId
    ) {
      bookingNumber =
        Number(
          lastBooking.bookingId.split("-")[2]
        ) + 1;
    }

    // ==========================================
    // Generate OTP
    // ==========================================

    const otp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    // ==========================================
    // Create Booking
    // ==========================================

    const booking =
      await Booking.create({
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

    // ==========================================
    // Success Response
    // ==========================================

    res.status(201).json({
      success: true,
      message:
        "Booking Created Successfully",
      booking,
      otp,
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

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
    const bookings =
      await Booking.find()
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "service",
          "name category price"
        )
        .populate(
          "technician",
          "name email"
        );

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
    const bookings =
      await Booking.find({
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
const getTechnicianStats = async (
  req,
  res
) => {
  try {
    const technicianId = req.user.id;

    const assignedJobs =
      await Booking.countDocuments({
        technician: technicianId,
      });

    const completedJobs =
      await Booking.countDocuments({
        technician: technicianId,
        status: "Completed",
      });

    const completedBookings =
      await Booking.find({
        technician: technicianId,
        status: "Completed",
        paymentStatus: "Paid",
      });

    const totalEarnings =
      completedBookings.reduce(
        (sum, booking) =>
          sum + booking.price,
        0
      );

    const reviews =
      await Review.find({
        technician: technicianId,
      });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating =
        reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        );

      averageRating =
        totalRating / reviews.length;
    }

    res.status(200).json({
      success: true,
      assignedJobs,
      completedJobs,
      totalEarnings,
      averageRating: Number(
        averageRating.toFixed(1)
      ),
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
const getTechnicianEarnings = async (
  req,
  res
) => {
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
            new Date(
              booking.updatedAt
            );

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
      bookings: completedBookings,
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
const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      )
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
const acceptBooking = async (
  req,
  res
) => {
  try {
    // ==========================================
    // Find Technician
    // ==========================================

    const technician =
      await User.findById(req.user.id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    // ==========================================
    // Check Technician Availability
    // ==========================================

    if (
      technician.availability !==
      "Available"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are offline. Please go Online before accepting a job.",
      });
    }

    // ==========================================
    // Find Booking
    // ==========================================

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Check Booking Status
    // ==========================================

    if (
      booking.status !== "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already accepted",
      });
    }

    // ==========================================
    // Assign Technician
    // ==========================================

    booking.technician =
      req.user.id;

    booking.status =
      "Accepted";

    await booking.save();

    // ==========================================
    // Success
    // ==========================================

    res.status(200).json({
      success: true,
      message:
        "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Accept Booking Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to accept booking",
    });
  }
};

// ==========================================
// Update Booking Status
//
// Flow:
//
// Pending
//    ↓
// Accepted
//    ↓
// On The Way
//    ↓
// OTP Verification
//    ↓
// In Progress
//    ↓
// Completed
// ==========================================
const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Check Technician
    // ==========================================

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message:
          "No technician assigned to this booking",
      });
    }

    if (
      booking.technician.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this booking",
      });
    }

    // ==========================================
    // Start Journey
    // Accepted → On The Way
    // ==========================================

    if (status === "On The Way") {
      if (booking.status !== "Accepted") {
        return res.status(400).json({
          success: false,
          message:
            "Only accepted bookings can start the journey",
        });
      }

      booking.status = "On The Way";
      booking.trackingActive = true;
    }

    // ==========================================
    // Start Service
    // OTP Verified → In Progress
    // ==========================================

    else if (
      status === "In Progress"
    ) {
      if (
        booking.status !==
        "On The Way"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Technician must start the journey first",
        });
      }

      if (!booking.otpVerified) {
        return res.status(400).json({
          success: false,
          message:
            "Customer OTP must be verified before starting the service",
        });
      }

      booking.status =
        "In Progress";

      booking.trackingActive = true;
    }

    // ==========================================
    // Complete Job
    // ==========================================

    else if (
      status === "Completed"
    ) {
      if (
        booking.status !==
        "In Progress"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only an in-progress booking can be completed",
        });
      }

      booking.status =
        "Completed";

      booking.trackingActive =
        false;
    }

    // ==========================================
    // Cancel
    // ==========================================

    else if (
      status === "Cancelled"
    ) {
      booking.status =
        "Cancelled";

      booking.trackingActive =
        false;
    }

    // ==========================================
    // Invalid Status
    // ==========================================

    else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status",
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        `Booking status updated to ${booking.status}`,
      booking,
    });
  } catch (error) {
    console.error(
      "Update Booking Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update booking status",
    });
  }
};

// ==========================================
// Verify Booking OTP
// ==========================================
const verifyBookingOTP = async (
  req,
  res
) => {
  try {
    const { otp } = req.body;

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message:
          "No technician assigned",
      });
    }

    if (
      booking.technician.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this booking",
      });
    }

    // ==========================================
    // OTP ONLY AFTER TECHNICIAN IS ON THE WAY
    // ==========================================

    if (
      booking.status !==
      "On The Way"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Technician must be on the way before OTP verification",
      });
    }

    // ==========================================
    // VERIFY OTP
    // ==========================================

    if (booking.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    booking.otpVerified = true;

    // ==========================================
    // ON THE WAY → IN PROGRESS
    // ==========================================

    booking.status =
      "In Progress";

    booking.trackingActive = true;

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "OTP Verified Successfully. Service started.",
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
const payForBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.customer.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Service is not completed yet",
      });
    }

    if (
      booking.paymentStatus === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed",
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
const getPaymentHistory = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
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
// Pending Bookings
// ==========================================
const getPendingBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        status: "Pending",
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "service",
          "name category price image"
        );

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
const getAssignedBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        technician: req.user.id,
      })
        .populate(
          "customer",
          "name phone address"
        )
        .populate(
          "service",
          "name category price image"
        )
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
const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.customer.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this booking",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed booking cannot be cancelled",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    booking.status =
      "Cancelled";

    booking.trackingActive =
      false;

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
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
const getAvailableJobs = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        status: "Pending",
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "service",
          "name category price image"
        )
        .sort({
          bookingDate: 1,
          bookingTime: 1,
        });

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
// Get Active Booking
// GET /api/bookings/active
// ==========================================
const getActiveBooking = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let booking;

    // ==========================================
    // CUSTOMER
    // ==========================================

    if (userRole === "customer") {
      booking =
        await Booking.findOne({
          customer: userId,

          status: {
            $in: [
              "Pending",
              "Accepted",
              "On The Way",
              "In Progress",
            ],
          },
        })
          .populate("service")
          .populate("technician")
          .sort({ createdAt: -1 });
    }

    // ==========================================
    // TECHNICIAN
    // ==========================================

    else if (
      userRole === "technician"
    ) {
      booking =
        await Booking.findOne({
          technician: userId,

          status: {
            $in: [
              "Accepted",
              "On The Way",
              "In Progress",
            ],
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
        message:
          "Unauthorized role",
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
// Get Technician Availability
// GET /api/bookings/technician/availability
// ==========================================
const getTechnicianAvailability = async (
  req,
  res
) => {
  try {
    const technician =
      await User.findById(
        req.user.id
      ).select("availability");

    if (!technician) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found",
      });
    }

    res.status(200).json({
      success: true,

      availability:
        technician.availability,

      isOnline:
        technician.availability ===
        "Available",
    });
  } catch (error) {
    console.error(
      "Get Availability Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get availability",
    });
  }
};

// ==========================================
// Update Technician Availability
// PUT /api/bookings/technician/availability
// ==========================================
const updateTechnicianAvailability = async (
  req,
  res
) => {
  try {
    const { isOnline } =
      req.body;

    // ==========================================
    // Validate
    // ==========================================

    if (
      typeof isOnline !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isOnline must be true or false",
      });
    }

    // ==========================================
    // Find Technician
    // ==========================================

    const technician =
      await User.findById(
        req.user.id
      );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found",
      });
    }

    // ==========================================
    // Update Availability
    // ==========================================

    technician.availability =
      isOnline
        ? "Available"
        : "Unavailable";

    await technician.save();

    // ==========================================
    // Response
    // ==========================================

    res.status(200).json({
      success: true,

      message: isOnline
        ? "You are now Online"
        : "You are now Offline",

      availability:
        technician.availability,

      isOnline:
        technician.availability ===
        "Available",
    });
  } catch (error) {
    console.error(
      "Update Availability Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update availability",
    });
  }
};

// ==========================================
// Remove Completed Job
// ==========================================
//
// This removes the completed job from the
// technician's Assigned Jobs list.
//
// It does NOT delete the booking permanently.
// Customer history, admin history and earnings
// remain available.
//

const removeCompletedJob = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    // ==========================================
    // Booking Not Found
    // ==========================================

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Check Technician Assignment
    // ==========================================

    if (!booking.technician) {
      return res.status(400).json({
        success: false,
        message:
          "No technician is assigned to this booking",
      });
    }

    if (
      booking.technician.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to remove this job",
      });
    }

    // ==========================================
    // Only Completed Jobs Can Be Removed
    // ==========================================

    if (
      booking.status !== "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only completed jobs can be removed",
      });
    }

    // ==========================================
    // Remove From Technician
    // ==========================================

    booking.technician = null;

    // ==========================================
    // Stop Live Tracking
    // ==========================================

    booking.trackingActive = false;

    booking.technicianLocation = {
      latitude: null,
      longitude: null,
      updatedAt: null,
    };

    await booking.save();

    // ==========================================
    // Success
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Completed job removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove Completed Job Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove completed job",
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

  getTechnicianAvailability,
  updateTechnicianAvailability,

  removeCompletedJob,
};