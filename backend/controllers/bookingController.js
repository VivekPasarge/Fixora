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

    if (!customer || !service || !address || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!mongoose.isValidObjectId(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid address",
      });
    }

    // Today's date in India, always YYYY-MM-DD.
    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Accept DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD.
    // Convert the date to YYYY-MM-DD for reliable comparisons.
    let normalizedBookingDate = "";

    if (typeof bookingDate === "string") {
      const value = bookingDate.trim();

      let match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

      if (!match) {
        match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      }

      if (match) {
        const day = match[1];
        const month = match[2];
        const year = match[3];

        normalizedBookingDate = `${year}-${month}-${day}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        normalizedBookingDate = value;
      }
    }

    console.log("[FIXORA DATE DEBUG]", {
      receivedDate: bookingDate,
      normalizedDate: normalizedBookingDate,
      today: todayString,
    });

    if (!normalizedBookingDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date. Use DD-MM-YYYY format.",
        receivedDate: bookingDate,
      });
    }

    const [year, month, day] =
      normalizedBookingDate.split("-").map(Number);

    // Validate the actual calendar date.
    const calendarDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
        receivedDate: bookingDate,
      });
    }

    // Reject dates in the past.
    if (normalizedBookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // Permit booking today and up to two days ahead.
    const [todayYear, todayMonth, todayDay] =
      todayString.split("-").map(Number);

    const maxDate = new Date(
      Date.UTC(todayYear, todayMonth - 1, todayDay + 2)
    );

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

    // Validate time in HH:mm format.
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

    // Reject past times when booking for today.
    if (normalizedBookingDate === todayString) {
      const indiaTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      const [currentHour, currentMinute] =
        indiaTime.split(":").map(Number);

      const [selectedHour, selectedMinute] =
        bookingTime.split(":").map(Number);

      if (
        selectedHour * 60 + selectedMinute <=
        currentHour * 60 + currentMinute
      ) {
        return res.status(400).json({
          success: false,
          message: "The selected booking time has already passed",
        });
      }
    }

    // Validate customer location when supplied.
    let savedCustomerLocation;

    if (customerLocation != null) {
      if (
        customerLocation.latitude === "" ||
        customerLocation.longitude === "" ||
        customerLocation.latitude == null ||
        customerLocation.longitude == null
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

    // Find the service.
    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Validate payment method.
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

    // Generate booking ID using the existing format.
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

    const bookingId =
      `FXR-${new Date().getFullYear()}-` +
      String(bookingNumber).padStart(6, "0");

    const otp = String(
      Math.floor(1000 + Math.random() * 9000)
    );

    const bookingData = {
      bookingId,
      customer,
      service,
      address: address.trim(),

      // Store the normalized date to keep comparisons consistent.
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
        message: "Invalid booking ID",
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

    if (!["Completed", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Only completed or cancelled bookings can be removed",
      });
    }

    booking.customerRemoved = true;
    booking.customerRemovedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking removed from My Bookings",
      booking,
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
// GET MY BOOKING HISTORY - CUSTOMER
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
      $or: [
        { customerRemoved: true },
        { status: { $in: ["Completed", "Cancelled"] } },
      ],
    })
      .populate("service", "name category price image")
      .populate("technician", "name phone profession profilePhoto")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Booking History Error:", error);

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
      .reduce((sum, booking) => sum + Number(booking.price || 0), 0);

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
  .select("+otp")
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

    const technician = await User.findById(technicianId).select(
      "role isAvailable availability"
    );

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
      return res.status(403).json({
        success: false,
        message: "You are unavailable for new jobs",
      });
    }

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

// ==========================================================
// UPDATE BOOKING STATUS - TECHNICIAN
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

    if (["Cancelled", "Completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `${booking.status} booking cannot be updated`,
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

    if (status === "In Progress" && !booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify the customer OTP before starting the service",
      });
    }

    if (status === "Completed" && !booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify the customer OTP before completing this booking",
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

// ==========================================================
// VERIFY BOOKING OTP
// ==========================================================

// ==========================================================
// VERIFY BOOKING OTP - ASSIGNED TECHNICIAN
// ==========================================================

const verifyBookingOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const technicianId = req.user?._id || req.user?.id;

    // Ensure the user is a technician.
    if (req.user?.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only the assigned technician can verify the OTP.",
      });
    }

    // Validate booking ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Validate OTP input.
    if (!/^\d{4}$/.test(String(otp || ""))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 4-digit OTP.",
      });
    }

    // Explicitly select OTP because the schema has select: false.
    const booking = await Booking.findById(id).select("+otp");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Only the technician assigned to this booking may verify it.
    if (
      !booking.technician ||
      booking.technician.toString() !== technicianId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not the technician assigned to this booking.",
      });
    }

    // OTP verification is allowed only while the technician is on the way.
    if (booking.status !== "On The Way") {
      return res.status(400).json({
        success: false,
        message: "The booking must be On The Way before OTP verification.",
      });
    }

    if (booking.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP has already been verified.",
      });
    }

    if (!booking.otp || String(booking.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please ask the customer to confirm it.",
      });
    }

    // Mark OTP as verified and move the booking to In Progress.
    booking.otpVerified = true;
    booking.otpVerifiedAt = new Date();
    booking.status = "In Progress";
    booking.trackingActive = true;

    // Remove the OTP after successful verification.
    booking.otp = "";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Service is now In Progress.",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        otpVerified: booking.otpVerified,
        otpVerifiedAt: booking.otpVerifiedAt,
        trackingActive: booking.trackingActive,
      },
    });
  } catch (error) {
    console.error("Verify Booking OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
};

// ==========================================================
// PAY FOR BOOKING
// IMPORTANT: This endpoint must not mark an online payment
// as paid without verified payment-provider confirmation.
// ==========================================================

const payForBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?._id || req.user?.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
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
      return res.status(409).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    if (booking.paymentMethod === "Cash on Service") {
      return res.status(400).json({
        success: false,
        message: "This booking uses cash payment",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        "Online payment must be completed through the payment provider and verified by the backend.",
    });
  } catch (error) {
    console.error("Pay For Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
    });
  }
};

// ==========================================================
// GET PAYMENT HISTORY
// ==========================================================

const getPaymentHistory = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;

    const bookings = await Booking.find({
      customer: customerId,
    })
      .select(
        "bookingId service price paymentMethod paymentStatus razorpayOrderId razorpayPaymentId paidAt createdAt"
      )
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
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

// ==========================================================
// GET PENDING BOOKINGS
// ==========================================================

const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "Pending",
      technician: null,
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
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

// ==========================================================
// GET ASSIGNED BOOKINGS - TECHNICIAN
// ==========================================================

const getAssignedBookings = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const bookings = await Booking.find({
      technician: technicianId,
      status: { $nin: ["Cancelled"] },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

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

// ==========================================================
// CANCEL BOOKING - CUSTOMER
// ==========================================================

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?._id || req.user?.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
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

    if (["Completed", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
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

// ==========================================================
// TECHNICIAN CANCEL JOB
// ==========================================================

const technicianCancelJob = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user?._id || req.user?.id;

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

    if (["Completed", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
      });
    }

    booking.technicianCancelled = true;
    booking.technicianCancellation = {
      reason: req.body?.reason || "Cancelled by technician",
      cancelledAt: new Date(),
    };
    booking.technician = null;
    booking.status = "Pending";
    booking.trackingActive = false;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Job released successfully",
      booking,
    });
  } catch (error) {
    console.error("Technician Cancel Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to release job",
    });
  }
};

// ==========================================================
// DECLINE AVAILABLE JOB
// ==========================================================

const declineAvailableJob = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user?._id || req.user?.id;

    const booking = await Booking.findOne({
      _id: id,
      status: "Pending",
      technician: null,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Available booking not found",
      });
    }

    const declined = (booking.declinedTechnicians || []).some(
      (value) => value.toString() === technicianId.toString()
    );

    if (!declined) {
      booking.declinedTechnicians = [
        ...(booking.declinedTechnicians || []),
        technicianId,
      ];

      await booking.save();
    }

    return res.status(200).json({
      success: true,
      message: "Job declined successfully",
    });
  } catch (error) {
    console.error("Decline Available Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to decline job",
    });
  }
};

// ==========================================================
// GET AVAILABLE JOBS
// ==========================================================

const getAvailableJobs = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const bookings = await Booking.find({
      status: "Pending",
      technician: null,
      declinedTechnicians: { $ne: technicianId },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
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

// ==========================================================
// GET ACTIVE BOOKING
// ==========================================================

const getActiveBooking = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    const filter =
      role === "technician"
        ? { technician: userId }
        : { customer: userId };

    filter.status = {
      $in: ["Accepted", "On The Way", "In Progress"],
    };

    const booking = await Booking.findOne(filter)
      .populate("customer", "name phone")
      .populate("technician", "name phone")
      .populate("service", "name category price");

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get Active Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active booking",
    });
  }
};

// ==========================================================
// GET TECHNICIAN AVAILABILITY
// ==========================================================

const getTechnicianAvailability = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const technician = await User.findById(technicianId).select(
      "isAvailable availability"
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    return res.status(200).json({
      success: true,
      isAvailable:
        technician.isAvailable ?? technician.availability ?? true,
    });
  } catch (error) {
    console.error("Get Technician Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
    });
  }
};

// ==========================================================
// UPDATE TECHNICIAN AVAILABILITY
// ==========================================================

const updateTechnicianAvailability = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;
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
      message: "Availability updated successfully",
      isAvailable,
    });
  } catch (error) {
    console.error("Update Technician Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
};

// ==========================================================
// REMOVE COMPLETED JOB
// ==========================================================

const removeCompletedJob = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user?._id || req.user?.id;

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
      status: "Completed",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Completed job not found",
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

// ==========================================================
// GET BOOKED TIME SLOTS
// ==========================================================

const getBookedTimeSlots = async (req, res) => {
  try {
    const { date, service } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Booking date is required",
      });
    }

    const filter = {
      bookingDate: date,
      status: { $nin: ["Cancelled"] },
    };

    if (service && mongoose.isValidObjectId(service)) {
      filter.service = service;
    }

    const bookings = await Booking.find(filter).select(
      "bookingTime status"
    );

    return res.status(200).json({
      success: true,
      bookedTimeSlots: bookings.map((booking) => booking.bookingTime),
    });
  } catch (error) {
    console.error("Get Booked Time Slots Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booked time slots",
    });
  }
};

// ==========================================================
// MARK CASH RECEIVED
// ==========================================================

const markCashReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user?._id || req.user?.id;

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const booking = await Booking.findOne({
        _id: id,
        technician: technicianId,
      }).session(session);

      if (!booking) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.paymentMethod !== "Cash on Service") {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "This booking is not a cash payment",
        });
      }

      if (booking.status !== "Completed") {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Complete the service before confirming cash collection",
        });
      }

      if (booking.paymentStatus === "Paid") {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message: "Cash payment has already been recorded",
        });
      }

      booking.paymentStatus = "Paid";
      booking.paidAt = new Date();

      await booking.save({ session });

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
        message: "Cash collection recorded successfully",
        booking,
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Mark Cash Received Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A wallet transaction already exists for this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to record cash collection",
    });
  }
};

// ==========================================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================================

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