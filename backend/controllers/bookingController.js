const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Review = require("../models/reviewModel");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

const {
  buildTechnicianQueue,
} = require("../services/technicianMatching");

// Move an expired offer to the next technician.
const advanceExpiredOffer = async (bookingId) => {
  const now = new Date();

  const booking = await Booking.findById(bookingId).select(
    "status technician matchingQueue matchingCurrentIndex currentOfferTechnician currentOfferExpiresAt"
  );

  if (
    !booking ||
    booking.status !== "Pending" ||
    booking.technician ||
    !booking.currentOfferTechnician ||
    !booking.currentOfferExpiresAt ||
    booking.currentOfferExpiresAt > now
  ) {
    return false;
  }

  const oldIndex = Number(booking.matchingCurrentIndex || 0);
  const oldTechnician = booking.currentOfferTechnician;

  const moved = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      status: "Pending",
      technician: null,
      matchingCurrentIndex: oldIndex,
      currentOfferTechnician: oldTechnician,
      currentOfferExpiresAt: { $lte: now },
    },
    {
      $set: {
        matchingCurrentIndex: oldIndex + 1,
        currentOfferTechnician: null,
        currentOfferExpiresAt: null,
        matchingLastUpdatedAt: now,
      },
    },
    { new: true }
  );

  if (!moved) return false;

  await assignNextTechnician(bookingId);

  return true;
};

// Assign exactly one technician from the ranked queue.
const assignNextTechnician = async (bookingId) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const booking = await Booking.findById(bookingId).select(
      "status technician matchingQueue matchingCurrentIndex currentOfferTechnician declinedTechnicians"
    );

    if (!booking || booking.status !== "Pending" || booking.technician) {
      return;
    }

    if (booking.currentOfferTechnician) return;

    const queue = Array.isArray(booking.matchingQueue)
      ? booking.matchingQueue
      : [];

    let nextIndex = Number(booking.matchingCurrentIndex || 0);

    const declinedIds = new Set(
      (booking.declinedTechnicians || []).map((id) =>
        id.toString()
      )
    );

    while (
      nextIndex < queue.length &&
      declinedIds.has(queue[nextIndex].technician?.toString())
    ) {
      nextIndex += 1;
    }

    const now = new Date();

    if (nextIndex >= queue.length) {
      await Booking.updateOne(
        {
          _id: bookingId,
          status: "Pending",
          technician: null,
          matchingCurrentIndex: booking.matchingCurrentIndex,
          currentOfferTechnician: null,
        },
        {
          $set: {
            matchingCurrentIndex: nextIndex,
            matchingStatus: "No Technician",
            currentOfferTechnician: null,
            currentOfferExpiresAt: null,
            matchingLastUpdatedAt: now,
          },
        }
      );

      return;
    }

    const nextTechnician = queue[nextIndex]?.technician;

    if (!nextTechnician) {
      nextIndex += 1;

      await Booking.updateOne(
        {
          _id: bookingId,
          status: "Pending",
          technician: null,
          matchingCurrentIndex: booking.matchingCurrentIndex,
          currentOfferTechnician: null,
        },
        {
          $set: {
            matchingCurrentIndex: nextIndex,
          },
        }
      );

      continue;
    }

    const offered = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "Pending",
        technician: null,
        matchingCurrentIndex: booking.matchingCurrentIndex,
        currentOfferTechnician: null,
      },
      {
        $set: {
          matchingCurrentIndex: nextIndex,
          matchingStatus: "Offering",
          currentOfferTechnician: nextTechnician,
          currentOfferExpiresAt: new Date(
            now.getTime() + 30 * 1000
          ),
          matchingLastUpdatedAt: now,
        },
      },
      { new: true }
    );

    if (offered) return;
  }
};

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

    if (!mongoose.isValidObjectId(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid address",
      });
    }

    // Today's date in India (YYYY-MM-DD).
    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Accept DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD.
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

    if (!normalizedBookingDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date. Use DD-MM-YYYY format.",
      });
    }

    // Validate the actual calendar date.
    const [year, month, day] =
      normalizedBookingDate.split("-").map(Number);

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
      });
    }

    // Reject past dates.
    if (normalizedBookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past.",
      });
    }

    // Allow only today and tomorrow.
    const [todayYear, todayMonth, todayDay] =
      todayString.split("-").map(Number);

    const maxDate = new Date(
      Date.UTC(todayYear, todayMonth - 1, todayDay + 1)
    );

    const maxBookingDateString = [
      maxDate.getUTCFullYear(),
      String(maxDate.getUTCMonth() + 1).padStart(2, "0"),
      String(maxDate.getUTCDate()).padStart(2, "0"),
    ].join("-");
        if (normalizedBookingDate > maxBookingDateString) {
      return res.status(400).json({
        success: false,
        message: "Bookings are allowed only for today and tomorrow.",
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
        message: "Please select a valid booking time.",
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
          message: "The selected booking time has already passed.",
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

    // Generate booking ID.
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

    // SMART TECHNICIAN MATCHING
    const matchingQueue = await buildTechnicianQueue(
      booking,
      serviceData
    );

    booking.matchingQueue = matchingQueue;
    booking.matchingCurrentIndex = 0;
    booking.matchingLastUpdatedAt = new Date();

    if (matchingQueue.length > 0) {
      booking.matchingStatus = "Offering";
      booking.currentOfferTechnician =
        matchingQueue[0].technician;

      booking.currentOfferExpiresAt = new Date(
        Date.now() + 30 * 1000
      );
    } else {
      booking.matchingStatus = "No Technician";
      booking.currentOfferTechnician = null;
      booking.currentOfferExpiresAt = null;
    }

    await booking.save();

    return res.status(201).json({
      success: true,
      message:
        booking.matchingStatus === "Offering"
          ? "Booking created. A technician has received your request."
          : "Booking created. No eligible technician is currently available.",
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
      technician.availability === "Unavailable"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are unavailable for new jobs",
      });
    }

    const now = new Date();

    // Accept only if this technician has the active offer.
    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        technician: null,
        currentOfferTechnician: technicianId,
        currentOfferExpiresAt: { $gt: now },
      },
      {
        $set: {
          technician: technicianId,
          status: "Accepted",
          matchingStatus: "Assigned",
          currentOfferTechnician: null,
          currentOfferExpiresAt: null,
          matchingLastUpdatedAt: now,
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

      if (
        existingBooking.currentOfferTechnician?.toString() ===
          technicianId.toString() &&
        existingBooking.currentOfferExpiresAt &&
        existingBooking.currentOfferExpiresAt <= now
      ) {
        await advanceExpiredOffer(id);

        return res.status(409).json({
          success: false,
          message: "Your 30-second offer has expired. The next technician is being notified.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This booking is not currently offered to you.",
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
// VERIFY BOOKING OTP - ASSIGNED TECHNICIAN
// ==========================================================

const verifyBookingOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const technicianId = req.user?._id || req.user?.id;

    if (req.user?.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Only the assigned technician can verify the OTP.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!/^\d{4}$/.test(String(otp || ""))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 4-digit OTP.",
      });
    }

    const booking = await Booking.findById(id).select("+otp");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      !booking.technician ||
      booking.technician.toString() !== technicianId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not the technician assigned to this booking.",
      });
    }

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

    booking.otpVerified = true;
    booking.otpVerifiedAt = new Date();
    booking.status = "In Progress";
    booking.trackingActive = true;
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

    if (!technicianId) {
      return res.status(401).json({
        success: false,
        message: "Technician authentication required",
      });
    }

    const bookings = await Booking.find({
      technician: technicianId,
      status: { $ne: "Cancelled" },
      technicianRemoved: { $ne: true },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
      .sort({ createdAt: -1 })
      .lean();

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
    booking.matchingStatus = "Not Started";
    booking.currentOfferTechnician = null;
    booking.currentOfferExpiresAt = null;
    booking.matchingLastUpdatedAt = new Date();

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

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

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

    // Do not offer this job to the same technician again.
    const alreadyDeclined = (booking.declinedTechnicians || []).some(
      (value) => value.toString() === technicianId.toString()
    );

    if (!alreadyDeclined) {
      booking.declinedTechnicians.push(technicianId);
    }

    booking.technician = null;
    booking.status = "Pending";
    booking.trackingActive = false;
    booking.currentOfferTechnician = null;
    booking.currentOfferExpiresAt = null;
    booking.matchingStatus = "Searching";
    booking.matchingLastUpdatedAt = new Date();

    await booking.save();

    // Continue with the next eligible technician.
    await assignNextTechnician(booking._id);

    const updatedBooking = await Booking.findById(id);

    return res.status(200).json({
      success: true,
      message:
        updatedBooking?.matchingStatus === "Offering"
          ? "Job released and offered to the next technician"
          : "Job released. No more eligible technicians are available.",
      booking: updatedBooking,
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

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const now = new Date();

    // Only the technician currently receiving the offer can decline.
    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        technician: null,
        currentOfferTechnician: technicianId,
        currentOfferExpiresAt: { $gt: now },
      },
      {
        $addToSet: {
          declinedTechnicians: technicianId,
        },
        $set: {
          currentOfferTechnician: null,
          currentOfferExpiresAt: null,
          matchingStatus: "Searching",
          matchingLastUpdatedAt: now,
        },
      },
      { new: true }
    );

    if (!booking) {
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (
        existingBooking.currentOfferTechnician?.toString() ===
          technicianId.toString() &&
        existingBooking.currentOfferExpiresAt &&
        existingBooking.currentOfferExpiresAt <= now
      ) {
        await advanceExpiredOffer(id);

        return res.status(409).json({
          success: false,
          message: "Your 30-second offer has expired.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This booking is not currently offered to you.",
      });
    }

    await assignNextTechnician(id);

    return res.status(200).json({
      success: true,
      message: "Job declined. The next technician is being notified.",
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
// GET AVAILABLE JOBS - TECHNICIAN
// ==========================================================


// ==========================================================
// GET AVAILABLE JOBS
// ==========================================================

const getAvailableJobs = async (req, res) => {
  try {
    const technicianId = req.user?._id || req.user?.id;

    if (!technicianId) {
      return res.status(401).json({
        success: false,
        message: "Technician authentication required",
      });
    }

    console.log(
      "\n========== AVAILABLE JOBS DEBUG =========="
    );

    console.log(
      "Logged-in Technician ID:",
      technicianId.toString()
    );

    const now = new Date();

    // ==========================================
    // PROCESS EXPIRED OFFERS
    // ==========================================

    const expiredBookings = await Booking.find({
      status: "Pending",
      technician: null,
      currentOfferTechnician: { $ne: null },
      currentOfferExpiresAt: { $lte: now },
    }).select("_id bookingId");

    for (const expiredBooking of expiredBookings) {
      try {
        await advanceExpiredOffer(expiredBooking._id);
      } catch (error) {
        console.error(
          "Failed to advance expired offer:",
          expiredBooking.bookingId,
          error.message
        );
      }
    }

    // ==========================================
    // FETCH ONLY THIS TECHNICIAN'S OFFER
    // ==========================================

    const bookings = await Booking.find({
      status: "Pending",
      technician: null,
      currentOfferTechnician: technicianId,
      currentOfferExpiresAt: { $gt: new Date() },
    })
      .populate("customer", "name phone")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    // ==========================================
    // DEBUG INFORMATION
    // ==========================================

    console.log(
      "Bookings offered to this technician:",
      bookings.length
    );

    console.log(
      "Offer details:",
      bookings.map((booking) => ({
        bookingId: booking.bookingId,
        bookingMongoId: booking._id.toString(),
        currentOfferTechnician:
          booking.currentOfferTechnician?.toString(),
        currentOfferExpiresAt:
          booking.currentOfferExpiresAt,
        matchingStatus: booking.matchingStatus,
      }))
    );

    console.log(
      "==========================================\n"
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(
      "Get Available Jobs Error:",
      error
    );

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

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let filter;

    if (role === "technician") {
      filter = {
        technician: userId,
      };
    } else if (role === "customer") {
      filter = {
        customer: userId,
      };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    filter.status = {
      $in: [
        "Accepted",
        "On The Way",
        "In Progress",
      ],
    };

    const booking = await Booking.findOne(filter)
      .populate("customer", "name phone")
      .populate("technician", "name phone")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "Get Active Booking Error:",
      error
    );

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

    console.log("LOGGED-IN TECHNICIAN ID:", technicianId);

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
        technician.isAvailable ??
        (technician.availability === "Available"),
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

    if (!technicianId) {
      return res.status(401).json({
        success: false,
        message: "Technician authentication required",
      });
    }

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
          availability: isAvailable ? "Available" : "Unavailable",
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
      isAvailable: technician.isAvailable,
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

    if (!technicianId) {
      return res.status(401).json({
        success: false,
        message: "Technician authentication required.",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      technician: technicianId,
      status: "Completed",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Completed job not found or it does not belong to you.",
      });
    }

    booking.technicianRemoved = true;
    booking.technicianRemovedAt = new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Completed job removed from your dashboard.",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Remove Completed Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove completed job.",
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
      bookedTimeSlots: bookings.map(
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

// ==========================================================
// MARK CASH RECEIVED
// ==========================================================

const markCashReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user?._id || req.user?.id;

    if (!technicianId) {
      return res.status(401).json({
        success: false,
        message: "Technician authentication required",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

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
          message:
            "Complete the service before confirming cash collection",
        });
      }

      if (booking.paymentStatus === "Paid") {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message: "Cash payment has already been recorded",
        });
      }

      const cashCollectionTime = new Date();

      booking.paymentStatus = "Paid";
      booking.paidAt = cashCollectionTime;
      booking.cashReceivedAt = cashCollectionTime;
      booking.cashReceivedBy = technicianId;

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
            processedAt: cashCollectionTime,
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
        message:
          "A wallet transaction already exists for this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to record cash collection",
    });
  }
};
// ==========================================================
// PROCESS EXPIRED TECHNICIAN OFFERS
// ==========================================================

const processExpiredOffers = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const now = new Date();

  const expiredBookings = await Booking.find({
    status: "Pending",
    technician: null,
    currentOfferTechnician: { $ne: null },
    currentOfferExpiresAt: { $lte: now },
  })
    .select("_id")
    .limit(100);

  for (const booking of expiredBookings) {
    await advanceExpiredOffer(booking._id);
  }
};
// ==========================================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================================

module.exports = {
  // Keep all your existing exports.
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

  processExpiredOffers,
};