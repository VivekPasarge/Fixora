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
    } = req.body;

    const customer = req.user.id;

    // VALIDATE REQUIRED FIELDS
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

    // VALIDATE BOOKING DATE
    const selectedDate = new Date(bookingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // GET TODAY'S DATE IN INDIA
    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // PREVENT PAST DATE
    if (bookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // ALLOW TODAY, TOMORROW, AND THE DAY AFTER TOMORROW
    const maxBookingDate = new Date(
      `${todayString}T00:00:00+05:30`
    );

    maxBookingDate.setDate(
      maxBookingDate.getDate() + 2
    );

    const maxBookingDateString =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(maxBookingDate);

    if (bookingDate > maxBookingDateString) {
      return res.status(400).json({
        success: false,
        message:
          "You can book a service only up to 2 days from today.",
      });
    }

    // VALIDATE 24-HOUR BOOKING TIME
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking time. Please select a valid 24-hour time.",
      });
    }

    // PREVENT PAST TIME FOR TODAY
    if (bookingDate === todayString) {
      const now = new Date();

      const [hours, minutes] = bookingTime
        .split(":")
        .map(Number);

      const bookingMinutes = hours * 60 + minutes;

      const indiaTimeParts =
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
          .formatToParts(now)
          .reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
          }, {});

      const currentMinutes =
        Number(indiaTimeParts.hour) * 60 +
        Number(indiaTimeParts.minute);

      if (bookingMinutes <= currentMinutes) {
        return res.status(400).json({
          success: false,
          message:
            "The selected booking time has already passed. Please select a future time.",
        });
      }
    }

    // FIND SERVICE
    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // GENERATE BOOKING ID
    const lastBooking = await Booking.findOne().sort({
      createdAt: -1,
    });

    let bookingNumber = 1;

    if (lastBooking && lastBooking.bookingId) {
      const parts = lastBooking.bookingId.split("-");
      const lastNumber = Number(parts[2]);

      if (!Number.isNaN(lastNumber)) {
        bookingNumber = lastNumber + 1;
      }
    }

    const bookingId =
      `FXR-${new Date().getFullYear()}-${String(
        bookingNumber
      ).padStart(6, "0")}`;

    // GENERATE OTP
    const otp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    // CREATE BOOKING
    const booking = await Booking.create({
      bookingId,
      customer,
      service,
      address,
      bookingDate,
      bookingTime,
      price: serviceData.price,

      paymentMethod:
        paymentMethod || "Cash on Service",

      // Every booking begins as unpaid.
      // Online payments must be verified by Razorpay.
      paymentStatus: "Pending",

      otp,
      declinedTechnicians: [],
      customerRemoved: false,
      customerRemovedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Booking Created Successfully",
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

// Continue with Part 2 below this line.
 // ==========================================================
 // GET ALL BOOKINGS — ADMIN
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
      message: error.message,
    });
  }
};

// ==========================================================
// GET MY BOOKINGS — CUSTOMER
// ==========================================================

const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

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
      .populate(
        "technician",
        "name phone profession profilePhoto"
      )
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
      message: error.message,
    });
  }
};

// ==========================================================
// REMOVE BOOKING FROM CUSTOMER'S MY BOOKINGS
// ==========================================================

const removeBookingFromMyBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
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

    if (
      booking.customer.toString() !==
      customerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to remove this booking.",
      });
    }

    if (booking.customerRemoved === true) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already in booking history.",
      });
    }

    booking.customerRemoved = true;
    booking.customerRemovedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking removed from My Bookings successfully.",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error(
      "Remove Booking From My Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove booking from My Bookings.",
      error: error.message,
    });
  }
};

// ==========================================================
// GET CUSTOMER BOOKING HISTORY
// ==========================================================

const getMyBookingHistory = async (req, res) => {
  try {
    const customerId = req.user.id;

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
      .populate(
        "technician",
        "name phone profession profilePhoto"
      )
      .sort({ customerRemovedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get Customer Booking History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// End of Part 2.
// Paste Part 3 after this section.
 // ==========================================================
// GET TECHNICIAN STATS
// ==========================================================

const getTechnicianStats = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

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
      (sum, booking) => sum + Number(booking.price || 0),
      0
    );

    const reviews = await Review.find({
      technician: technicianId,
    });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      );

      averageRating = totalRating / reviews.length;
    }

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
    const technicianId = req.user._id || req.user.id;

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

    const today = new Date();

    const todayEarnings = completedBookings
      .filter((booking) => {
        const date = new Date(booking.updatedAt);

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
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

// Continue with Part 4 below this line.
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("service", "name category price")
      .populate("technician", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    const isAdmin = role === "admin";
    const isCustomer =
      booking.customer &&
      booking.customer._id.toString() === userId.toString();
    const isTechnician =
      booking.technician &&
      booking.technician._id.toString() === userId.toString();

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

const acceptBooking = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        technician: null,
        declinedTechnicians: { $ne: technicianId },
      },
      {
        $set: {
          technician: technicianId,
          status: "Accepted",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name phone")
      .populate("service", "name category price")
      .populate("technician", "name phone");

    if (!booking) {
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (existingBooking.technician) {
        return res.status(409).json({
          success: false,
          message: "This booking has already been accepted",
        });
      }

      if (existingBooking.status !== "Pending") {
        return res.status(409).json({
          success: false,
          message: "This booking is no longer available",
        });
      }

      return res.status(409).json({
        success: false,
        message: "You have already declined this booking",
      });
    }

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
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const technicianId = req.user._id || req.user.id;

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

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not assigned to you",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be updated",
      });
    }

    const validTransitions = {
      Accepted: ["On The Way", "In Progress"],
      "On The Way": ["In Progress"],
      "In Progress": ["Completed"],
    };

    const permittedNextStatuses =
      validTransitions[booking.status] || [];

    if (!permittedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change booking status from ${booking.status} to ${status}`,
      });
    }

    if (status === "Completed" && !booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Verify the customer OTP before completing this booking",
      });
    }

    booking.status = status;

    if (status === "Completed") {
      booking.trackingActive = false;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
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

const verifyBookingOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const technicianId = req.user._id || req.user.id;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Please enter the customer OTP",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
    }).select("+otp");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not assigned to you",
      });
    }

    if (booking.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message:
          "OTP can only be verified while the service is in progress",
      });
    }

    if (booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP has already been verified",
      });
    }

    if (
      !booking.otp ||
      String(booking.otp) !== String(otp).trim()
    ) {
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
      message: "Customer OTP verified successfully",
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
const payForBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const customerId = req.user._id || req.user.id;

    const allowedMethods = ["Cash on Service", "UPI", "Card"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      customer: customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    if (paymentMethod !== "Cash on Service") {
      return res.status(400).json({
        success: false,
        message:
          "Online payments must be completed through the Razorpay payment flow",
      });
    }

    booking.paymentMethod = "Cash on Service";
    booking.paymentStatus = "Pending";

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Cash on Service selected. Payment remains pending until the technician confirms receipt.",
      booking,
    });
  } catch (error) {
    console.error("Pay For Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment method",
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    const filter =
      role === "technician"
        ? { technician: userId }
        : { customer: userId };

    const bookings = await Booking.find(filter)
      .select(
        "bookingId customer technician service price paymentMethod paymentStatus paidAt cashReceivedAt createdAt"
      )
      .populate("customer", "name email")
      .populate("technician", "name email")
      .populate("service", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      payments: bookings,
    });
  } catch (error) {
    console.error("Get Payment History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

const getBookedTimeSlots = async (req, res) => {
  try {
    const { date, service } = req.query;

    if (!date || !service) {
      return res.status(400).json({
        success: false,
        message: "Date and service are required",
      });
    }

    const bookings = await Booking.find({
      bookingDate: date,
      service,
      status: { $nin: ["Cancelled"] },
    }).select("bookingTime");

    return res.status(200).json({
      success: true,
      date,
      bookedSlots: bookings.map(
        (booking) => booking.bookingTime
      ),
    });
  } catch (error) {
    console.error("Get Booked Time Slots Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booked time slots",
    });
  }
};
const getPendingBookings = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const technician = await User.findById(technicianId).select(
      "isAvailable availability"
    );

    if (
      technician &&
      (technician.isAvailable === false ||
        technician.availability === false)
    ) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    const bookings = await Booking.find({
      status: "Pending",
      technician: null,
      declinedTechnicians: { $ne: technicianId },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Pending Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending bookings",
    });
  }
};

const getAssignedBookings = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const bookings = await Booking.find({
      technician: technicianId,
      status: {
        $in: [
          "Accepted",
          "On The Way",
          "In Progress",
          "Completed",
        ],
      },
    })
      .populate("customer", "name phone email")
      .populate("service", "name category price image")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Assigned Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned bookings",
    });
  }
};

const getAvailableJobs = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const technician = await User.findById(technicianId);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    if (
      technician.isAvailable === false ||
      technician.availability === false
    ) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
        message: "You are currently unavailable for new jobs",
      });
    }

    const bookings = await Booking.find({
      status: "Pending",
      technician: null,
      declinedTechnicians: { $ne: technicianId },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Available Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available jobs",
    });
  }
};
const getActiveBooking = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const booking = await Booking.findOne({
      technician: technicianId,
      status: {
        $in: ["Accepted", "On The Way", "In Progress"],
      },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      booking: booking || null,
    });
  } catch (error) {
    console.error("Get Active Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active booking",
    });
  }
};

const getTechnicianAvailability = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const technician = await User.findById(technicianId).select(
      "isAvailable availability"
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    const isAvailable =
      technician.isAvailable !== undefined
        ? technician.isAvailable
        : technician.availability !== false;

    return res.status(200).json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    console.error(
      "Get Technician Availability Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician availability",
    });
  }
};

const updateTechnicianAvailability = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const technician = await User.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          isAvailable,
          availability: isAvailable,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("isAvailable availability");

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isAvailable
        ? "You are now available for jobs"
        : "You are now unavailable for jobs",
      isAvailable,
    });
  } catch (error) {
    console.error(
      "Update Technician Availability Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update technician availability",
    });
  }
};

const declineAvailableJob = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        technician: null,
        declinedTechnicians: { $ne: technicianId },
      },
      {
        $addToSet: {
          declinedTechnicians: technicianId,
        },
      },
      {
        new: true,
      }
    );

    if (!booking) {
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (existingBooking.technician) {
        return res.status(409).json({
          success: false,
          message: "This booking has already been accepted",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This booking is no longer available or was already declined",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking declined successfully",
    });
  } catch (error) {
    console.error("Decline Available Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to decline booking",
    });
  }
};
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id || req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      customer: customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      ["Completed", "Cancelled"].includes(booking.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message:
          "This booking has already been paid. Please process a refund before cancelling.",
      });
    }

    booking.status = "Cancelled";
    booking.trackingActive = false;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

const technicianCancelJob = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user._id || req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Assigned booking not found",
      });
    }

    if (
      ["Completed", "Cancelled"].includes(booking.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message:
          "This booking has already been paid. Resolve the payment before cancelling.",
      });
    }

    booking.status = "Cancelled";
    booking.technicianCancelled = true;
    booking.trackingActive = false;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Job cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Technician Cancel Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel job",
    });
  }
};

const removeCompletedJob = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user._id || req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not assigned to you",
      });
    }

    if (booking.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed jobs can be removed from your list",
      });
    }

    booking.technicianRemoved = true;
    booking.technicianRemovedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Completed job removed successfully",
    });
  } catch (error) {
    console.error("Remove Completed Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove completed job",
    });
  }
};
const markCashReceived = async (req, res) => {
  let session;

  try {
    const technicianId = req.user._id || req.user.id;
    const bookingId = req.params.id;

    session = await Booking.startSession();
    session.startTransaction();

    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        technician: technicianId,
        status: "Completed",
        paymentMethod: "Cash on Service",
        paymentStatus: "Pending",
        cashReceivedAt: null,
      },
      {
        $set: {
          paymentStatus: "Paid",
          paidAt: new Date(),
          cashReceivedAt: new Date(),
          cashReceivedBy: technicianId,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!booking) {
      await session.abortTransaction();

      const existingBooking = await Booking.findById(bookingId);

      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (
        !existingBooking.technician ||
        existingBooking.technician.toString() !==
          technicianId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This booking is not assigned to you.",
        });
      }

      if (existingBooking.paymentStatus === "Paid") {
        return res.status(409).json({
          success: false,
          message: "This booking has already been paid.",
        });
      }

      if (existingBooking.paymentMethod !== "Cash on Service") {
        return res.status(400).json({
          success: false,
          message: "This booking is not a cash payment.",
        });
      }

      if (existingBooking.status !== "Completed") {
        return res.status(400).json({
          success: false,
          message:
            "Complete the service before confirming cash collection.",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Cash collection could not be confirmed. Refresh and try again.",
      });
    }

    await WalletTransaction.create(
      [
        {
          technician: technicianId,
          booking: booking._id,
          type: "EARNING",
          amount: Number(booking.price),
          direction: "CREDIT",
          status: "COMPLETED",
          description: `Earnings for booking ${booking.bookingId}`,
          reference: `booking:${booking._id}:earning`,
          processedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Cash collection recorded and wallet credited successfully.",
      booking,
    });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A wallet transaction already exists for this booking.",
      });
    }

    console.error("Mark Cash Received Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to record cash collection and wallet transaction.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  removeBookingFromMyBookings,
  getMyBookingHistory,
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
  technicianCancelJob,
  declineAvailableJob,
  getAvailableJobs,
  getTechnicianEarnings,
  getActiveBooking,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  removeCompletedJob,
  getBookedTimeSlots,
  markCashReceived,
};
