const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Review = require("../models/reviewModel");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

// ==========================================================
// CREATE BOOKING
// ==========================================================

const createBooking = async (req, res) => {
  try {
    const {
      service,
      address,
      bookingDate,
      bookingTime,
      paymentMethod,
      customerLocation,
    } = req.body;

    const customer = req.user?._id || req.user?.id;

    // Validate required fields
    if (!customer || !service || !address || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Validate service ID
    if (!mongoose.isValidObjectId(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // Validate address
    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid address",
      });
    }

    // ======================================================
    // VALIDATE AND NORMALIZE BOOKING DATE
    // Accept YYYY-MM-DD, DD-MM-YYYY, or DD/MM/YYYY
    // ======================================================

    const getIndiaDateString = (date = new Date()) => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(date);

      const values = {};

      parts.forEach(({ type, value }) => {
        values[type] = value;
      });

      return `${values.year}-${values.month}-${values.day}`;
    };

    let normalizedBookingDate = "";

    if (typeof bookingDate !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    const dateValue = bookingDate.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      normalizedBookingDate = dateValue;
    } else {
      const match = dateValue.match(
        /^(\d{2})[-/](\d{2})[-/](\d{4})$/
      );

      if (match) {
        const [, day, month, year] = match;

        normalizedBookingDate = `${year}-${month}-${day}`;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid booking date. Please select a date again.",
        });
      }
    }

    // Verify that the calendar date actually exists.
    const [year, month, day] = normalizedBookingDate
      .split("-")
      .map(Number);

    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // Get today's date in India.
    const todayString = getIndiaDateString();

    // Prevent past dates.
    if (normalizedBookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // Allow bookings up to two days ahead.
    const todayParts = todayString.split("-").map(Number);

    const maxDate = new Date(
      Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2])
    );

    maxDate.setUTCDate(maxDate.getUTCDate() + 2);

    const maxBookingDateString = [
      maxDate.getUTCFullYear(),
      String(maxDate.getUTCMonth() + 1).padStart(2, "0"),
      String(maxDate.getUTCDate()).padStart(2, "0"),
    ].join("-");

    if (normalizedBookingDate > maxBookingDateString) {
      return res.status(400).json({
        success: false,
        message: "You can book a service only up to 2 days from today.",
      });
    }

    // ======================================================
    // VALIDATE BOOKING TIME
    // ======================================================

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      typeof bookingTime !== "string" ||
      !timeRegex.test(bookingTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid booking time",
      });
    }

    // Prevent past times when booking for today.
    if (normalizedBookingDate === todayString) {
      const indiaTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      const [currentHour, currentMinute] = indiaTime
        .split(":")
        .map(Number);

      const [selectedHour, selectedMinute] = bookingTime
        .split(":")
        .map(Number);

      const currentMinutes = currentHour * 60 + currentMinute;
      const selectedMinutes = selectedHour * 60 + selectedMinute;

      if (selectedMinutes <= currentMinutes) {
        return res.status(400).json({
          success: false,
          message: "The selected booking time has already passed",
        });
      }
    }

    // ======================================================
    // VALIDATE CUSTOMER GPS COORDINATES
    // ======================================================

    let savedCustomerLocation;

    if (customerLocation != null) {
      if (
        customerLocation.latitude == null ||
        customerLocation.longitude == null ||
        customerLocation.latitude === "" ||
        customerLocation.longitude === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer location coordinates",
        });
      }

      const latitude = Number(customerLocation.latitude);
      const longitude = Number(customerLocation.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer location coordinates",
        });
      }

      savedCustomerLocation = {
        latitude,
        longitude,
      };
    }

    // ======================================================
    // FIND SERVICE
    // ======================================================

    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ======================================================
    // VALIDATE PAYMENT METHOD
    // ======================================================

    const allowedPaymentMethods = [
      "Cash on Service",
      "UPI",
      "Card",
    ];

    const selectedPaymentMethod =
      paymentMethod || "Cash on Service";

    if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ======================================================
    // GENERATE BOOKING ID
    // ======================================================

    const lastBooking = await Booking.findOne()
      .sort({ createdAt: -1, _id: -1 })
      .select("bookingId");

    let bookingNumber = 1;

    if (lastBooking?.bookingId) {
      const parts = lastBooking.bookingId.split("-");
      const lastNumber = Number(parts[2]);

      if (Number.isSafeInteger(lastNumber) && lastNumber > 0) {
        bookingNumber = lastNumber + 1;
      }
    }

    const bookingId = `FXR-${new Date().getFullYear()}-${String(
      bookingNumber
    ).padStart(6, "0")}`;

    // Generate four-digit customer OTP.
    const otp = String(
      Math.floor(1000 + Math.random() * 9000)
    );

    // ======================================================
    // CREATE BOOKING DATA
    // ======================================================

    const bookingData = {
      bookingId,
      customer,
      service,
      address: address.trim(),
      bookingDate: normalizedBookingDate,
      bookingTime,
      price: serviceData.price,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: "Pending",
      otp,
      declinedTechnicians: [],
      customerRemoved: false,
      customerRemovedAt: null,
      trackingActive: false,
    };

    if (savedCustomerLocation) {
      bookingData.customerLocation = savedCustomerLocation;
    }

    const booking = await Booking.create(bookingData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
      otp,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// ==========================================================
// GET ALL BOOKINGS - ADMIN
// ==========================================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("service", "name category price")
      .populate("technician", "name email");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ==========================================================
// GET MY BOOKINGS - CUSTOMER
// ==========================================================

const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const bookings = await Booking.find({
      customer: customerId,
      customerRemoved: { $ne: true },
    })
      .select(
        "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt paymentMethod razorpayOrderId razorpayPaymentId paidAt"
      )
      .populate("service", "name category price image")
      .populate("technician", "name phone profession profilePhoto")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
    });
  }
};

// ==========================================================
// REMOVE BOOKING FROM CUSTOMER'S MY BOOKINGS
// ==========================================================

const removeBookingFromMyBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?._id || req.user?.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove this booking",
      });
    }

    if (booking.customerRemoved === true) {
      return res.status(400).json({
        success: false,
        message: "Booking is already in booking history",
      });
    }

    booking.customerRemoved = true;
    booking.customerRemovedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking moved to booking history successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Remove Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove booking",
    });
  }
};

// ==========================================================
// GET CUSTOMER BOOKING HISTORY
// ==========================================================

const getMyBookingHistory = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const bookings = await Booking.find({
      customer: customerId,
      customerRemoved: true,
    })
      .select(
        "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt updatedAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt paymentMethod razorpayOrderId razorpayPaymentId paidAt"
      )
      .populate("service", "name category price image")
      .populate("technician", "name phone profession profilePhoto")
      .sort({ customerRemovedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Customer Booking History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
    });
  }
};

// ==========================================================
// GET TECHNICIAN STATS
// ==========================================================

const getTechnicianStats = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

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
    }).select("price");

    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + Number(booking.price || 0),
      0
    );

    const reviews = await Review.find({
      technician: technicianId,
    }).select("rating");

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      assignedJobs,
      completedJobs,
      totalEarnings,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get Technician Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician statistics",
    });
  }
};
// ==========================================================
// GET TECHNICIAN EARNINGS
// ==========================================================

const getTechnicianEarnings = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const completedBookings = await Booking.find({
      technician: technicianId,
      status: "Completed",
      paymentStatus: "Paid",
    })
      .populate("service", "name")
      .sort({ updatedAt: -1 });

    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + Number(booking.price || 0),
      0
    );

    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const todayEarnings = completedBookings
      .filter((booking) => {
        const date = booking.updatedAt || booking.paidAt;
        if (!date) return false;

        return (
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(date)) === todayString
        );
      })
      .reduce(
        (sum, booking) => sum + Number(booking.price || 0),
        0
      );

    return res.status(200).json({
      success: true,
      totalEarnings,
      todayEarnings,
      completedJobs: completedBookings.length,
      bookings: completedBookings,
    });
  } catch (error) {
    console.error("Get Technician Earnings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician earnings",
    });
  }
};

// ==========================================================
// GET BOOKING BY ID
// ==========================================================

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate("customer", "name email phone")
      .populate("service", "name category price")
      .populate("technician", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    const isAdmin = role === "admin";

    const isCustomer =
      booking.customer &&
      booking.customer._id.toString() === userId?.toString();

    const isTechnician =
      booking.technician &&
      booking.technician._id.toString() === userId?.toString();

    if (!isAdmin && !isCustomer && !isTechnician) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get Booking By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// ==========================================================
// ACCEPT BOOKING - TECHNICIAN
// ==========================================================

const acceptBooking = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This booking is no longer available",
      });
    }

    if (
      Array.isArray(booking.declinedTechnicians) &&
      booking.declinedTechnicians.some(
        (item) => item.toString() === technicianId.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You previously declined this booking",
      });
    }

    booking.technician = technicianId;
    booking.status = "Accepted";
    booking.trackingActive = false;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error("Accept Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept booking",
    });
  }
};

// ==========================================================
// UPDATE BOOKING STATUS
// ==========================================================

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const technicianId = req.user?._id || req.user?.id;

    const allowedStatuses = [
      "On The Way",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      !booking.technician ||
      booking.technician.toString() !== technicianId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This booking is not assigned to you",
      });
    }

    if (status === "On The Way") {
      if (booking.status !== "Accepted") {
        return res.status(400).json({
          success: false,
          message: "Only accepted bookings can be marked On The Way",
        });
      }

      booking.status = "On The Way";
      booking.trackingActive = true;
    }

    if (status === "In Progress") {
      if (booking.status !== "On The Way") {
        return res.status(400).json({
          success: false,
          message: "Mark the booking On The Way before starting service",
        });
      }

      if (!booking.otpVerified) {
        return res.status(400).json({
          success: false,
          message: "Verify the customer OTP before starting the service",
        });
      }

      booking.status = "In Progress";
    }

    if (status === "Completed") {
      if (booking.status !== "In Progress") {
        return res.status(400).json({
          success: false,
          message: "Only in-progress bookings can be completed",
        });
      }

      if (!booking.otpVerified) {
        return res.status(400).json({
          success: false,
          message: "Verify the customer OTP before completing the service",
        });
      }

      booking.status = "Completed";
      booking.trackingActive = false;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${booking.status}`,
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

// ==========================================================
// VERIFY CUSTOMER OTP
// ==========================================================

const verifyBookingOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const technicianId = req.user?._id || req.user?.id;

    if (!otp || !/^\d{4}$/.test(String(otp).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid four-digit customer OTP",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id).select("+otp");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      !booking.technician ||
      booking.technician.toString() !== technicianId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This booking is not assigned to you",
      });
    }

    if (booking.status !== "On The Way") {
      return res.status(400).json({
        success: false,
        message: "OTP can only be verified while the booking is On The Way",
      });
    }

    if (booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP has already been verified",
      });
    }

    if (!booking.otp || String(booking.otp) !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }

    booking.otpVerified = true;
    booking.otpVerifiedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Customer OTP verified successfully. You can now start the service.",
      booking,
    });
  } catch (error) {
    console.error("Verify Booking OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify booking OTP",
    });
  }
};

const getTechnicianEarnings = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const completedBookings = await Booking.find({
      technician: technicianId,
      status: "Completed",
      paymentStatus: "Paid",
    })
      .populate("service", "name")
      .sort({ updatedAt: -1 });

    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + Number(booking.price || 0),
      0
    );

    return res.status(200).json({
      success: true,
      totalEarnings,
      completedJobs: completedBookings.length,
      bookings: completedBookings,
    });
  } catch (error) {
    console.error("Get Technician Earnings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician earnings",
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  removeBookingFromMyBookings,
  getMyBookingHistory,
  getTechnicianStats,
  getTechnicianEarnings,
  getBookingById,
  acceptBooking,
  updateBookingStatus,
  verifyBookingOTP,
  payForBooking,
  getPaymentHistory,
  getBookedTimeSlots,
  getPendingBookings,
  getAssignedBookings,
  getAvailableJobs,
  getActiveBooking,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  declineAvailableJob,
  cancelBooking,
  technicianCancelJob,
  removeCompletedJob,
  markCashReceived,
};
