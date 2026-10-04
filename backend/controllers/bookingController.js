const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Review = require("../models/reviewModel");
const User = require("../models/User");

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

    // ======================================================
    // VALIDATE REQUIRED FIELDS
    // ======================================================

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

    // ======================================================
    // VALIDATE BOOKING DATE
    // ======================================================

    const selectedDate = new Date(bookingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // ======================================================
    // GET TODAY'S DATE IN INDIA
    // ======================================================

    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // ======================================================
    // PREVENT PAST DATE
    // ======================================================

    if (bookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // ======================================================
    // MAXIMUM 2-DAY BOOKING WINDOW
    //
    // Today              ✅
    // Tomorrow           ✅
    // Day after tomorrow ✅
    // After 2 days       ❌
    // ======================================================

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

    // ======================================================
    // PREVENT BOOKING MORE THAN 2 DAYS AHEAD
    // ======================================================

    if (bookingDate > maxBookingDateString) {
      return res.status(400).json({
        success: false,
        message:
          "You can book a service only up to 2 days from today.",
      });
    }

    // ======================================================
    // VALIDATE 24-HOUR BOOKING TIME
    //
    // Examples:
    // 00:00
    // 09:00
    // 12:00
    // 14:00
    // 18:00
    // 23:00
    // ======================================================

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking time. Please select a valid 24-hour time.",
      });
    }

    // ======================================================
    // PREVENT PAST TIME FOR TODAY
    // ======================================================

    if (bookingDate === todayString) {
      const now = new Date();

      const [hours, minutes] = bookingTime
        .split(":")
        .map(Number);

      const bookingMinutes =
        hours * 60 + minutes;

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

    // ======================================================
    // FIND SERVICE
    // ======================================================

    const serviceData =
      await Service.findById(service);

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ======================================================
    // GENERATE BOOKING ID
    // ======================================================

    const lastBooking =
      await Booking.findOne()
        .sort({
          createdAt: -1,
        });

    let bookingNumber = 1;

    if (
      lastBooking &&
      lastBooking.bookingId
    ) {
      const parts =
        lastBooking.bookingId.split("-");

      const lastNumber =
        Number(parts[2]);

      if (!Number.isNaN(lastNumber)) {
        bookingNumber =
          lastNumber + 1;
      }
    }

    const bookingId =
      `FXR-${new Date().getFullYear()}-${String(
        bookingNumber
      ).padStart(6, "0")}`;

    // ======================================================
    // GENERATE OTP
    // ======================================================

    const otp =
      Math.floor(
        1000 + Math.random() * 9000
      ).toString();

    // ======================================================
    // CREATE BOOKING
    // ======================================================

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

      // IMPORTANT:
      // Every new booking starts as Pending.
      // Razorpay verification will change it to Paid.
      paymentStatus: "Pending",

      otp,

      declinedTechnicians: [],

      // ==================================================
      // CUSTOMER HISTORY
      // ==================================================

      customerRemoved: false,

      customerRemovedAt: null,
    });

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return res.status(201).json({
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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// GET ALL BOOKINGS
// ==========================================================

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

    return res.status(200).json({
      success: true,

      count: bookings.length,

      bookings,
    });
  } catch (error) {
    console.error(
      "Get All Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// GET MY BOOKINGS
// ==========================================================

const getMyBookings = async (req, res) => {
  try {
    const customerId =
      req.user.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required",
      });
    }

    const bookings =
      await Booking.find({
        customer: customerId,

        customerRemoved: {
          $ne: true,
        },
      })
        .select(
          "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt paymentMethod razorpayOrderId razorpayPaymentId paidAt"
        )
        .populate(
          "service",
          "name category price image"
        )
        .populate(
          "technician",
          "name phone profession profilePhoto"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      count: bookings.length,

      bookings,
    });
  } catch (error) {
    console.error(
      "Get My Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// REMOVE BOOKING FROM CUSTOMER'S MY BOOKINGS
// ==========================================================

const removeBookingFromMyBookings =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Booking ID is required",
        });
      }

      const customerId =
        req.user.id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          message:
            "Customer authentication required",
        });
      }

      const booking =
        await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
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

      if (
        booking.customerRemoved === true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking is already in booking history.",
        });
      }

      booking.customerRemoved = true;

      booking.customerRemovedAt =
        new Date();

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

const getMyBookingHistory =
  async (req, res) => {
    try {
      const customerId =
        req.user.id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          message:
            "Customer authentication required",
        });
      }

      const bookings =
        await Booking.find({
          customer: customerId,

          customerRemoved: true,
        })
          .select(
            "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt updatedAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt paymentMethod razorpayOrderId razorpayPaymentId paidAt"
          )
          .populate(
            "service",
            "name category price image"
          )
          .populate(
            "technician",
            "name phone profession profilePhoto"
          )
          .sort({
            customerRemovedAt: -1,
          })
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

        message:
          "Failed to fetch booking history",

        error: error.message,
      });
    }
  };

// ==========================================================
// TECHNICIAN DASHBOARD STATISTICS
// ==========================================================

const getTechnicianStats =
  async (req, res) => {
    try {
      const technicianId =
        req.user.id;

      const assignedJobs =
        await Booking.countDocuments({
          technician:
            technicianId,
        });

      const completedJobs =
        await Booking.countDocuments({
          technician:
            technicianId,

          status:
            "Completed",
        });

      const completedBookings =
        await Booking.find({
          technician:
            technicianId,

          status:
            "Completed",

          paymentStatus:
            "Paid",
        });

      const totalEarnings =
        completedBookings.reduce(
          (sum, booking) =>
            sum + booking.price,
          0
        );

      const reviews =
        await Review.find({
          technician:
            technicianId,
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
          totalRating /
          reviews.length;
      }

      return res.status(200).json({
        success: true,

        assignedJobs,

        completedJobs,

        totalEarnings,

        averageRating:
          Number(
            averageRating.toFixed(1)
          ),
      });
    } catch (error) {
      console.error(
        "Get Technician Stats Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  // ==========================================================
// GET TECHNICIAN EARNINGS
// ==========================================================

const getTechnicianEarnings =
  async (req, res) => {
    try {
      const technicianId =
        req.user.id;

      const completedBookings =
        await Booking.find({
          technician:
            technicianId,

          status:
            "Completed",

          paymentStatus:
            "Paid",
        })
          .populate(
            "service",
            "name"
          )
          .sort({
            updatedAt: -1,
          });

      // ====================================================
      // TOTAL EARNINGS
      // ====================================================

      const totalEarnings =
        completedBookings.reduce(
          (sum, booking) =>
            sum + booking.price,
          0
        );

      // ====================================================
      // TODAY'S EARNINGS
      // ====================================================

      const today =
        new Date();

      const todayEarnings =
        completedBookings
          .filter(
            (booking) => {
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
            }
          )
          .reduce(
            (sum, booking) =>
              sum + booking.price,
            0
          );

      return res.status(200).json({
        success: true,

        totalEarnings,

        todayEarnings,

        completedJobs:
          completedBookings.length,

        bookings:
          completedBookings,
      });
    } catch (error) {
      console.error(
        "Get Technician Earnings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


// ==========================================================
// GET SINGLE BOOKING
// ==========================================================

const getBookingById =
  async (req, res) => {
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
          message:
            "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,

        booking,
      });
    } catch (error) {
      console.error(
        "Get Booking By ID Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


// ==========================================================
// ACCEPT BOOKING
// ==========================================================

const acceptBooking =
  async (req, res) => {
    try {
      // ====================================================
      // FIND TECHNICIAN
      // ====================================================

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

      // ====================================================
      // TECHNICIAN MUST BE ONLINE
      // ====================================================

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

      // ====================================================
      // FIND BOOKING
      // ====================================================

      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // BOOKING MUST BE PENDING
      // ====================================================

      if (
        booking.status !==
        "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking is already accepted or unavailable.",
        });
      }

      // ====================================================
      // CHECK IF TECHNICIAN ALREADY DECLINED
      // ====================================================

      const alreadyDeclined =
        booking.declinedTechnicians?.some(
          (id) =>
            id.toString() ===
            req.user.id.toString()
        );

      if (alreadyDeclined) {
        return res.status(403).json({
          success: false,
          message:
            "You have already declined this job.",
        });
      }

      // ====================================================
      // VALIDATE BOOKING DATE
      // ====================================================

      if (!booking.bookingDate) {
        return res.status(400).json({
          success: false,
          message:
            "Booking date is missing.",
        });
      }

      const bookingDate =
        new Date(
          booking.bookingDate
        );

      if (
        Number.isNaN(
          bookingDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking date.",
        });
      }

      // ====================================================
      // TODAY IN INDIA
      // ====================================================

      const todayString =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              "Asia/Kolkata",

            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        ).format(new Date());

      const today =
        new Date(
          `${todayString}T00:00:00`
        );

      // ====================================================
      // NORMALIZE BOOKING DATE
      // ====================================================

      bookingDate.setHours(
        0,
        0,
        0,
        0
      );

      // ====================================================
      // CALCULATE DAYS
      // ====================================================

      const differenceInMilliseconds =
        bookingDate.getTime() -
        today.getTime();

      const differenceInDays =
        Math.round(
          differenceInMilliseconds /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      // ====================================================
      // PREVENT PAST BOOKING
      // ====================================================

      if (
        differenceInDays < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This booking date has already passed.",
        });
      }

      // ====================================================
      // BOOKING ACCEPTANCE WINDOW
      //
      // Since customer booking is now limited
      // to 2 days, technician can accept
      // bookings immediately.
      // ====================================================

      if (
        differenceInDays > 2
      ) {
        return res.status(403).json({
          success: false,

          acceptanceBlocked:
            true,

          message:
            "This booking is outside the allowed 2-day booking window.",

          bookingDate:
            bookingDate.toISOString(),
        });
      }

      // ====================================================
      // ASSIGN TECHNICIAN
      // ====================================================

      booking.technician =
        req.user.id;

      // ====================================================
      // UPDATE STATUS
      // ====================================================

      booking.status =
        "Accepted";

      // ====================================================
      // REMOVE TECHNICIAN FROM DECLINED LIST
      // ====================================================

      booking.declinedTechnicians =
        (
          booking.declinedTechnicians ||
          []
        ).filter(
          (id) =>
            id.toString() !==
            req.user.id.toString()
        );

      // ====================================================
      // RESET TECHNICIAN CANCELLATION
      // ====================================================

      booking.technicianCancelled =
        false;

      booking.technicianCancellation =
        {
          technician: null,

          cancelledAt: null,

          reason: "",
        };

      await booking.save();

      return res.status(200).json({
        success: true,

        message:
          "Booking accepted successfully.",

        booking,
      });
    } catch (error) {
      console.error(
        "Accept Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to accept booking.",

        error: error.message,
      });
    }
  };


// ==========================================================
// UPDATE BOOKING STATUS
// ==========================================================

const updateBookingStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body;

      // ====================================================
      // FIND BOOKING
      // ====================================================

      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // CHECK TECHNICIAN
      // ====================================================

      if (
        !booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No technician assigned to this booking",
        });
      }

      // ====================================================
      // ONLY ASSIGNED TECHNICIAN
      // ====================================================

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

      // ====================================================
      // ON THE WAY
      // ====================================================

      if (
        status ===
        "On The Way"
      ) {
        if (
          booking.status !==
          "Accepted"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Only accepted bookings can start the journey",
          });
        }

        booking.status =
          "On The Way";

        booking.trackingActive =
          true;
      }

      // ====================================================
      // IN PROGRESS
      // ====================================================

      else if (
        status ===
        "In Progress"
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

        if (
          !booking.otpVerified
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Customer OTP must be verified before starting the service",
          });
        }

        booking.status =
          "In Progress";

        booking.trackingActive =
          true;
      }

      // ====================================================
      // COMPLETED
      // ====================================================

      else if (
        status ===
        "Completed"
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

      // ====================================================
      // CANCELLED
      // ====================================================

      else if (
        status ===
        "Cancelled"
      ) {
        booking.status =
          "Cancelled";

        booking.trackingActive =
          false;
      }

      // ====================================================
      // INVALID STATUS
      // ====================================================

      else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking status",
        });
      }

      await booking.save();

      return res.status(200).json({
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

      return res.status(500).json({
        success: false,

        message:
          "Failed to update booking status",

        error: error.message,
      });
    }
  };


// ==========================================================
// VERIFY BOOKING OTP
// ==========================================================

const verifyBookingOTP =
  async (req, res) => {
    try {
      const { otp } =
        req.body;

      // ====================================================
      // FIND BOOKING
      // ====================================================

      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // CHECK TECHNICIAN
      // ====================================================

      if (
        !booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No technician assigned",
        });
      }

      // ====================================================
      // CHECK ASSIGNED TECHNICIAN
      // ====================================================

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

      // ====================================================
      // BOOKING MUST BE ON THE WAY
      // ====================================================

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

      // ====================================================
      // VALIDATE OTP
      // ====================================================

      if (
        booking.otp !==
        otp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP",
        });
      }

      // ====================================================
      // OTP VERIFIED
      // ====================================================

      booking.otpVerified =
        true;

      booking.status =
        "In Progress";

      booking.trackingActive =
        true;

      await booking.save();

      return res.status(200).json({
        success: true,

        message:
          "OTP Verified Successfully. Service started.",

        booking,
      });
    } catch (error) {
      console.error(
        "Verify OTP Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // ==========================================================
// PAY FOR BOOKING
// ==========================================================

const payForBooking = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ======================================================
    // CUSTOMER OWNERSHIP
    // ======================================================

    if (
      booking.customer.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // ======================================================
    // VALID PAYMENT METHODS
    // ======================================================

    const validPaymentMethods = [
      "Cash on Service",
      "UPI",
      "Card",
    ];

    if (
      !validPaymentMethods.includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ======================================================
    // PAYMENT ALLOWED AFTER TECHNICIAN ACCEPTS
    // ======================================================

    const allowedStatuses = [
      "Accepted",
      "On The Way",
      "In Progress",
      "Completed",
    ];

    if (
      !allowedStatuses.includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is available only after a technician accepts the booking.",
      });
    }

    // ======================================================
    // PREVENT DUPLICATE PAYMENT
    // ======================================================

    if (
      booking.paymentStatus === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed",
      });
    }

    // ======================================================
    // CASH ON SERVICE
    // ======================================================

    if (
      paymentMethod ===
      "Cash on Service"
    ) {
      booking.paymentMethod =
        "Cash on Service";

      // Cash is NOT paid yet
      booking.paymentStatus =
        "Pending";

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Cash on Service selected successfully",
        booking,
      });
    }

    // ======================================================
    // UPI / CARD
    // ======================================================
    //
    // DO NOT MARK PAYMENT AS PAID HERE.
    //
    // Razorpay will handle:
    //
    // create-order
    //      ↓
    // Razorpay Checkout
    //      ↓
    // Successful Payment
    //      ↓
    // /payment/verify
    //
    // Only successful Razorpay verification
    // should change paymentStatus to Paid.
    // ======================================================

    return res.status(400).json({
      success: false,
      message:
        "Online payments must be processed through Razorpay.",
    });
  } catch (error) {
    console.error(
      "Pay For Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================================
// PAYMENT HISTORY
// ==========================================================

const getPaymentHistory =
  async (req, res) => {
    try {
      const bookings =
        await Booking.find({
          customer:
            req.user.id,
        })
          .populate(
            "service",
            "name"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          bookings.length,

        bookings,
      });
    } catch (error) {
      console.error(
        "Payment History Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ==========================================================
// PENDING BOOKINGS
// ==========================================================

const getPendingBookings =
  async (req, res) => {
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

      return res.status(200).json({
        success: true,

        count:
          bookings.length,

        bookings,
      });
    } catch (error) {
      console.error(
        "Pending Bookings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ==========================================================
// ASSIGNED BOOKINGS
// ==========================================================

const getAssignedBookings =
  async (req, res) => {
    try {
      const bookings =
        await Booking.find({
          technician:
            req.user.id,
        })
          .populate(
            "customer",
            "name phone address"
          )
          .populate(
            "service",
            "name category price image"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          bookings.length,

        bookings,
      });
    } catch (error) {
      console.error(
        "Assigned Bookings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ==========================================================
// CUSTOMER CANCEL BOOKING
// ==========================================================

const cancelBooking =
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // CHECK CUSTOMER
      // ====================================================

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

      // ====================================================
      // COMPLETED BOOKING
      // ====================================================

      if (
        booking.status ===
        "Completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed booking cannot be cancelled",
        });
      }

      // ====================================================
      // ALREADY CANCELLED
      // ====================================================

      if (
        booking.status ===
        "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking is already cancelled",
        });
      }

      // ====================================================
      // CANCEL
      // ====================================================

      booking.status =
        "Cancelled";

      booking.trackingActive =
        false;

      await booking.save();

      return res.status(200).json({
        success: true,

        message:
          "Booking cancelled successfully",

        booking,
      });
    } catch (error) {
      console.error(
        "Cancel Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ==========================================================
// TECHNICIAN CANCEL JOB
// ==========================================================
//
// Accepted / On The Way
//          ↓
// Technician cancels
//          ↓
// Pending
//          ↓
// Another technician can accept
// ==========================================================

const technicianCancelJob =
  async (req, res) => {
    try {
      const technicianId =
        req.user.id;

      const booking =
        await Booking.findById(
          req.params.id
        ).populate(
          "service",
          "name"
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // TECHNICIAN MUST EXIST
      // ====================================================

      if (
        !booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No technician is assigned to this booking.",
        });
      }

      // ====================================================
      // CHECK TECHNICIAN
      // ====================================================

      if (
        booking.technician.toString() !==
        technicianId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this booking.",
        });
      }

      // ====================================================
      // ONLY ACCEPTED / ON THE WAY
      // ====================================================

      if (
        booking.status !==
          "Accepted" &&
        booking.status !==
          "On The Way"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This job can no longer be cancelled by the technician.",
        });
      }

      // ====================================================
      // SAVE CANCELLATION
      // ====================================================

      booking.technicianCancelled =
        true;

      booking.technicianCancellation =
        {
          technician:
            technicianId,

          cancelledAt:
            new Date(),

          reason:
            "Technician cancelled the accepted job.",
        };

      // ====================================================
      // MAKE BOOKING AVAILABLE AGAIN
      // ====================================================

      booking.technician =
        null;

      booking.status =
        "Pending";

      booking.trackingActive =
        false;

      booking.technicianLocation =
        {
          latitude: null,
          longitude: null,
          updatedAt: null,
        };

      booking.otpVerified =
        false;

      // ====================================================
      // GENERATE NEW OTP
      // ====================================================

      const newOtp =
        Math.floor(
          1000 +
            Math.random() *
              9000
        ).toString();

      booking.otp =
        newOtp;

      // ====================================================
      // ADD TECHNICIAN TO DECLINED LIST
      // ====================================================

      if (
        !booking.declinedTechnicians
      ) {
        booking.declinedTechnicians =
          [];
      }

      const alreadyDeclined =
        booking.declinedTechnicians.some(
          (id) =>
            id.toString() ===
            technicianId.toString()
        );

      if (
        !alreadyDeclined
      ) {
        booking.declinedTechnicians.push(
          technicianId
        );
      }

      await booking.save();

      // ====================================================
      // REAL-TIME CUSTOMER NOTIFICATION
      // ====================================================

      const io =
        req.app.get("io");

      if (io) {
        io.to(
          `customer-${booking.customer.toString()}`
        ).emit(
          "technician-job-cancelled",
          {
            bookingId:
              booking._id,

            bookingNumber:
              booking.bookingId,

            service:
              booking.service?.name ||
              "Home Service",

            bookingDate:
              booking.bookingDate,

            message:
              "The technician has cancelled this booking. Fixora is trying to find another technician for you.",
          }
        );

        console.log(
          "Technician cancellation sent to customer:",
          booking.customer.toString()
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Job cancelled. We are trying to find another technician for the customer.",

        booking,
      });
    } catch (error) {
      console.error(
        "Technician Cancel Job Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to cancel the job.",
      });
    }
  };


// ==========================================================
// DECLINE AVAILABLE JOB
// ==========================================================
//
// Pending
//    ↓
// Technician declines
//    ↓
// Technician added to declinedTechnicians
//    ↓
// Booking remains Pending
//    ↓
// Other technicians can see it
// ==========================================================

const declineAvailableJob =
  async (req, res) => {
    try {
      const technicianId =
        req.user.id;

      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      // ====================================================
      // MUST BE PENDING
      // ====================================================

      if (
        booking.status !==
        "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This job is no longer available.",
        });
      }

      // ====================================================
      // MUST NOT ALREADY HAVE TECHNICIAN
      // ====================================================

      if (
        booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This job has already been assigned to a technician.",
        });
      }

      // ====================================================
      // INITIALIZE DECLINED LIST
      // ====================================================

      if (
        !booking.declinedTechnicians
      ) {
        booking.declinedTechnicians =
          [];
      }

      // ====================================================
      // CHECK DUPLICATE DECLINE
      // ====================================================

      const alreadyDeclined =
        booking.declinedTechnicians.some(
          (id) =>
            id.toString() ===
            technicianId.toString()
        );

      if (
        alreadyDeclined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You have already declined this job.",
        });
      }

      // ====================================================
      // ADD TECHNICIAN
      // ====================================================

      booking.declinedTechnicians.push(
        technicianId
      );

      await booking.save();

      return res.status(200).json({
        success: true,

        message:
          "Job removed from your available jobs.",

        bookingId:
          booking._id,
      });
    } catch (error) {
      console.error(
        "Decline Available Job Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to decline this job.",
      });
    }
  };


// ==========================================================
// AVAILABLE JOBS
// ==========================================================

const getAvailableJobs =
  async (req, res) => {
    try {
      const technicianId =
        req.user.id;

      const bookings =
        await Booking.find({
          status: "Pending",

          declinedTechnicians: {
            $ne: technicianId,
          },
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

      return res.status(200).json({
        success: true,

        count:
          bookings.length,

        bookings,
      });
    } catch (error) {
      console.error(
        "Available Jobs Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // ==========================================================
// GET ACTIVE BOOKING
// ==========================================================

const getActiveBooking = async (req, res) => {
  try {
    const userId =
      req.user._id || req.user.id;

    const userRole =
      req.user.role;

    let booking;

    // ======================================================
    // CUSTOMER
    // ======================================================

    if (userRole === "customer") {
      booking =
        await Booking.findOne({
          customer: userId,

          customerRemoved: {
            $ne: true,
          },

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
          .sort({
            createdAt: -1,
          });
    }

    // ======================================================
    // TECHNICIAN
    // ======================================================

    else if (userRole === "technician") {
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
          .sort({
            createdAt: -1,
          });
    }

    // ======================================================
    // ADMIN
    // ======================================================

    else if (userRole === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Live tracking is not available for administrators",
      });
    }

    // ======================================================
    // UNKNOWN ROLE
    // ======================================================

    else {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized role",
      });
    }

    // ======================================================
    // NO ACTIVE BOOKING
    // ======================================================

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

    // ======================================================
    // ACTIVE BOOKING FOUND
    // ======================================================

    return res.status(200).json({
      success: true,

      active: true,

      booking,
    });
  } catch (error) {
    console.error(
      "Get Active Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch active booking",
    });
  }
};


// ==========================================================
// GET TECHNICIAN AVAILABILITY
// ==========================================================

const getTechnicianAvailability =
  async (req, res) => {
    try {
      const technician =
        await User.findById(
          req.user.id
        ).select(
          "availability"
        );

      if (!technician) {
        return res.status(404).json({
          success: false,
          message:
            "Technician not found",
        });
      }

      return res.status(200).json({
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

      return res.status(500).json({
        success: false,

        message:
          "Failed to get availability",
      });
    }
  };


// ==========================================================
// UPDATE TECHNICIAN AVAILABILITY
// ==========================================================

const updateTechnicianAvailability =
  async (req, res) => {
    try {
      const { isOnline } =
        req.body;

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

      technician.availability =
        isOnline
          ? "Available"
          : "Unavailable";

      await technician.save();

      return res.status(200).json({
        success: true,

        message:
          isOnline
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

      return res.status(500).json({
        success: false,

        message:
          "Failed to update availability",
      });
    }
  };


// ==========================================================
// REMOVE COMPLETED JOB
// ==========================================================

const removeCompletedJob =
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            "Booking not found",
        });
      }

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

      if (
        booking.status !==
        "Completed"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only completed jobs can be removed",
        });
      }

      booking.technician =
        null;

      booking.trackingActive =
        false;

      booking.technicianLocation = {
        latitude: null,

        longitude: null,

        updatedAt: null,
      };

      await booking.save();

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


// ==========================================================
// GET BOOKED TIME SLOTS
// ==========================================================
//
// Used by Booking.jsx.
//
// GET:
// /api/bookings/availability?service=SERVICE_ID&date=YYYY-MM-DD
//
// Returns already booked time slots.
//
// ==========================================================

const getBookedTimeSlots =
  async (req, res) => {
    try {
      const {
        service,
        date,
      } = req.query;

      // ====================================================
      // VALIDATE SERVICE
      // ====================================================

      if (!service) {
        return res.status(400).json({
          success: false,

          message:
            "Service ID is required",
        });
      }

      // ====================================================
      // VALIDATE DATE
      // ====================================================

      if (!date) {
        return res.status(400).json({
          success: false,

          message:
            "Booking date is required",
        });
      }

      // ====================================================
      // VALIDATE DATE FORMAT
      // ====================================================

      const dateRegex =
        /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid booking date format",
        });
      }

      const selectedDate =
        new Date(
          `${date}T00:00:00`
        );

      if (
        Number.isNaN(
          selectedDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid booking date",
        });
      }

      // ====================================================
      // START OF DAY
      // ====================================================

      const startOfDay =
        new Date(
          selectedDate
        );

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      // ====================================================
      // END OF DAY
      // ====================================================

      const endOfDay =
        new Date(
          selectedDate
        );

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      // ====================================================
      // FIND EXISTING BOOKINGS
      //
      // Cancelled bookings do not block
      // the time slot.
      // ====================================================

      const bookings =
        await Booking.find({
          service,

          bookingDate: {
            $gte: startOfDay,

            $lte: endOfDay,
          },

          status: {
            $nin: [
              "Cancelled",
            ],
          },
        }).select(
          "bookingTime status"
        );

      // ====================================================
      // GET BOOKED TIMES
      // ====================================================

      const bookedSlots =
        bookings
          .map(
            (booking) =>
              booking.bookingTime
          )
          .filter(Boolean);

      // ====================================================
      // REMOVE DUPLICATES
      // ====================================================

      const uniqueBookedSlots =
        [
          ...new Set(
            bookedSlots
          ),
        ];

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(200).json({
        success: true,

        service,

        date,

        bookedSlots:
          uniqueBookedSlots,

        count:
          uniqueBookedSlots.length,
      });
    } catch (error) {
      console.error(
        "Get Booked Time Slots Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to check booking availability",

        error:
          error.message,
      });
    }
  };


// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  createBooking,

  getAllBookings,

  getMyBookings,

  // CUSTOMER HISTORY
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
};