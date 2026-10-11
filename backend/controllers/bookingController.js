
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

    // Use India-local calendar dates.
    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

   
const normalizedBookingDate =
  typeof bookingDate === "string"
    ? bookingDate.trim()
    : "";

const dateMatch = normalizedBookingDate.match(
  /^(\d{4})-(\d{2})-(\d{2})$/
);

if (!dateMatch) {
  console.log("Invalid bookingDate received:", bookingDate);

  return res.status(400).json({
    success: false,
    message: "Invalid booking date",
  });
}

const year = Number(dateMatch[1]);
const month = Number(dateMatch[2]);
const day = Number(dateMatch[3]);

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
    message: "Invalid booking date",
  });
}

const normalizedDate = normalizedBookingDate;


    const selectedDate = new Date(`${bookingDate}T00:00:00+05:30`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    if (bookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    const today = new Date(`${todayString}T00:00:00+05:30`);
    today.setUTCDate(today.getUTCDate() + 2);

    const maxBookingDateString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(today);

    if (bookingDate > maxBookingDateString) {
      return res.status(400).json({
        success: false,
        message: "You can book a service only up to 2 days from today.",
      });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (typeof bookingTime !== "string" || !timeRegex.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid booking time",
      });
    }

    if (bookingDate === todayString) {
      const indiaTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      const [currentHour, currentMinute] = indiaTime.split(":").map(Number);
      const [selectedHour, selectedMinute] = bookingTime.split(":").map(Number);

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

      savedCustomerLocation = { latitude, longitude };
    }

    const serviceData = await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const allowedPaymentMethods = ["Cash on Service", "UPI", "Card"];

    const selectedPaymentMethod = paymentMethod || "Cash on Service";

    if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // The existing sequential ID approach is retained for compatibility.
    // For high concurrency, replace this with an atomic counter collection.
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

    const otp = String(
      Math.floor(1000 + Math.random() * 9000)
    );

    const bookingData = {
      bookingId,
      customer,
      service,
      address: address.trim(),
      bookingDate,
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

    const today = new Date();

    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(today);

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

    const permittedNextStatuses = validTransitions[booking.status] || [];

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


const verifyBookingOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const technicianId = req.user?._id || req.user?.id;

    if (!otp || !/^\d{4}$/.test(String(otp).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter the valid four-digit customer OTP",
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

    // OTP must be verified after the technician reaches the customer.
    if (booking.status !== "On The Way") {
      return res.status(400).json({
        success: false,
        message:
          "Reach the customer and update the booking to On The Way before verifying OTP",
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


// ==========================================================
// SELECT PAYMENT METHOD FOR EXISTING BOOKING
// Online payments must use the Razorpay controller.
// ==========================================================

const payForBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const customerId = req.user?._id || req.user?.id;

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

// ==========================================================
// GET PAYMENT HISTORY
// ==========================================================

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

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

// ==========================================================
// GET BOOKED TIME SLOTS
// ==========================================================

const getBookedTimeSlots = async (req, res) => {
  try {
    const { date, service } = req.query;

    if (!date || !service) {
      return res.status(400).json({
        success: false,
        message: "Date and service are required",
      });
    }

    if (!mongoose.isValidObjectId(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const bookings = await Booking.find({
      bookingDate: date,
      service,
      status: { $ne: "Cancelled" },
    }).select("bookingTime");

    return res.status(200).json({
      success: true,
      date,
      bookedSlots: bookings.map((booking) => booking.bookingTime),
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
// GET PENDING BOOKINGS - TECHNICIAN
// ==========================================================

const getPendingBookings = async (req, res) => {
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

    if (
      technician.isAvailable === false ||
      technician.availability === false
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

// ==========================================================
// GET ASSIGNED BOOKINGS - TECHNICIAN
// ==========================================================

const getAssignedBookings = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const bookings = await Booking.find({
      technician: technicianId,
      technicianRemoved: { $ne: true },
      status: {
        $in: ["Accepted", "On The Way", "In Progress", "Completed"],
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

// ==========================================================
// GET AVAILABLE JOBS
// ==========================================================

const getAvailableJobs = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

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

// ==========================================================
// GET ACTIVE BOOKING
// ==========================================================

const getActiveBooking = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    const booking = await Booking.findOne({
      technician: technicianId,
      status: { $in: ["Accepted", "On The Way", "In Progress"] },
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

    const isAvailable =
      technician.isAvailable !== undefined
        ? technician.isAvailable
        : technician.availability !== false;

    return res.status(200).json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    console.error("Get Technician Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician availability",
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
      message: isAvailable
        ? "You are now available for jobs"
        : "You are now unavailable for jobs",
      isAvailable,
    });
  } catch (error) {
    console.error("Update Technician Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update technician availability",
    });
  }
};

// ==========================================================
// DECLINE AVAILABLE JOB
// ==========================================================

const declineAvailableJob = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;
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
        message: "This booking is no longer available or was already declined",
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

// ==========================================================
// CANCEL BOOKING - CUSTOMER
// ==========================================================

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?._id || req.user?.id;

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
        message: `Cannot cancel a ${booking.status.toLowerCase()} booking`,
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message:
          "This booking has already been paid. Process a refund before cancelling.",
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
// CANCEL JOB - TECHNICIAN
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

// ==========================================================
// REMOVE COMPLETED JOB - TECHNICIAN
// ==========================================================

const removeCompletedJob = async (req, res) => {
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

// ==========================================================
// MARK CASH RECEIVED - TECHNICIAN
// ==========================================================

const markCashReceived = async (req, res) => {
  let session;

  try {
    const technicianId = req.user?._id || req.user?.id;
    const bookingId = req.params.id;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const now = new Date();

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
          paidAt: now,
          cashReceivedAt: now,
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
          message: "Booking not found",
        });
      }

      if (
        !existingBooking.technician ||
        existingBooking.technician.toString() !== technicianId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This booking is not assigned to you",
        });
      }

      if (existingBooking.paymentStatus === "Paid") {
        return res.status(409).json({
          success: false,
          message: "This booking has already been paid",
        });
      }

      if (existingBooking.paymentMethod !== "Cash on Service") {
        return res.status(400).json({
          success: false,
          message: "This booking is not a cash payment",
        });
      }

      if (existingBooking.status !== "Completed") {
        return res.status(400).json({
          success: false,
          message: "Complete the service before confirming cash collection",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Cash collection could not be confirmed. Refresh and try again.",
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
          processedAt: now,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Cash collection recorded and wallet credited successfully",
      booking,
    });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A wallet transaction already exists for this booking",
      });
    }

    console.error("Mark Cash Received Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record cash collection and wallet transaction",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
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
