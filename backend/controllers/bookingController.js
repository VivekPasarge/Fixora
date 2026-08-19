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

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // ==========================================
    // Get Today's Date In India
    // ==========================================

    const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // ==========================================
    // Prevent Past Date
    // ==========================================

    if (bookingDate < todayString) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
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

      let [timePart, modifier] = bookingTime.split(" ");

      let [hours, minutes] =
        timePart.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      }

      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

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
      await Booking.findOne()
        .sort({
          createdAt: -1,
        });

    let bookingNumber = 1;

    if (
      lastBooking &&
      lastBooking.bookingId
    ) {
      bookingNumber =
        Number(
          lastBooking.bookingId
            .split("-")[2]
        ) + 1;
    }

    // ==========================================
    // Generate OTP
    // ==========================================

    const otp =
      Math.floor(
        1000 + Math.random() * 9000
      ).toString();

    // ==========================================
    // Create Booking
    // ==========================================

    const booking =
      await Booking.create({
        bookingId:
          `FXR-${new Date().getFullYear()}-${String(
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

        declinedTechnicians: [],

        // ==========================================
        // CUSTOMER HISTORY
        // ==========================================

        customerRemoved: false,

        customerRemovedAt: null,
      });

    // ==========================================
    // Success Response
    // ==========================================

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


// ==========================================
// Get My Bookings
// ==========================================
//
// CUSTOMER ONLY
//
// customerRemoved != true
//        ↓
// Show in My Bookings
//
// customerRemoved == true
//        ↓
// Hide from My Bookings
//
// ==========================================
const getMyBookings = async (req, res) => {
  try {

    const customerId =
      req.user.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const bookings =
      await Booking.find({

        customer:
          customerId,

        customerRemoved: {
          $ne: true,
        },

      })
        .select(
          "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt"
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


// =========================================================
// REMOVE BOOKING FROM CUSTOMER'S MY BOOKINGS
// =========================================================
//
// CUSTOMER ONLY
//
// This is NOT a permanent delete.
//
// Booking remains inside MongoDB.
//
// customerRemoved:
// false → My Bookings
//
// customerRemoved:
// true → Booking History
//
// =========================================================
const removeBookingFromMyBookings =
  async (req, res) => {

    try {

      // ==========================================
      // GET BOOKING ID
      // ==========================================

      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Booking ID is required",
        });
      }


      // ==========================================
      // GET CUSTOMER ID
      // ==========================================

      // IMPORTANT:
      // Use req.user.id because this is what
      // the rest of this controller uses.

      const customerId =
        req.user.id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          message:
            "Customer authentication required",
        });
      }


      // ==========================================
      // FIND BOOKING
      // ==========================================

      const booking =
        await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }


      // ==========================================
      // CHECK CUSTOMER OWNERSHIP
      // ==========================================

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


      // ==========================================
      // CHECK IF ALREADY REMOVED
      // ==========================================

      if (
        booking.customerRemoved === true
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Booking is already in booking history.",
        });

      }


      // ==========================================
      // SOFT DELETE
      // ==========================================

      booking.customerRemoved =
        true;

      booking.customerRemovedAt =
        new Date();


      // ==========================================
      // SAVE
      // ==========================================

      await booking.save();


      // ==========================================
      // SUCCESS
      // ==========================================

      return res.status(200).json({

        success: true,

        message:
          "Booking removed from My Bookings successfully.",

        bookingId:
          booking._id,

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

        error:
          error.message,

      });

    }
  };


// =========================================================
// GET CUSTOMER BOOKING HISTORY
// =========================================================
//
// CUSTOMER ONLY
//
// Shows bookings that were removed from
// My Bookings.
//
// customerRemoved = true
//
// =========================================================
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

          customer:
            customerId,

          customerRemoved:
            true,

        })
          .select(
            "bookingId service technician address bookingDate bookingTime status paymentStatus price createdAt updatedAt technicianCancelled technicianCancellation customerRemoved customerRemovedAt"
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

        count:
          bookings.length,

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

        error:
          error.message,

      });
    }
  };


// ==========================================
// Technician Dashboard Statistics
// ==========================================
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

      if (
        reviews.length > 0
      ) {

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


// ==========================================
// Technician Earnings
// ==========================================
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

      const totalEarnings =
        completedBookings.reduce(
          (sum, booking) =>
            sum + booking.price,
          0
        );

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


// ==========================================
// Get Single Booking
// ==========================================
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


// ==========================================
// Accept Booking
// ==========================================
const acceptBooking =
  async (req, res) => {

    try {

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
          message:
            "Booking not found",
        });
      }


      // ==========================================
      // Check Booking Status
      // ==========================================

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


      // ==========================================
      // Prevent Previously Declined Technician
      // ==========================================

      const alreadyDeclined =
        booking.declinedTechnicians?.some(
          (id) =>
            id.toString() ===
            req.user.id.toString()
        );

      if (
        alreadyDeclined
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You have already declined this job.",
        });
      }


      // ==========================================
      // Validate Booking Date
      // ==========================================

      if (
        !booking.bookingDate
      ) {
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


      // ==========================================
      // Get Today's Date In India
      // ==========================================

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


      bookingDate.setHours(
        0,
        0,
        0,
        0
      );


      // ==========================================
      // Calculate Day Difference
      // ==========================================

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


      // ==========================================
      // Prevent Past Booking
      // ==========================================

      if (
        differenceInDays < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This booking date has already passed.",
        });
      }


      // ==========================================
      // 3-DAY ACCEPTANCE WINDOW
      // ==========================================

      if (
        differenceInDays > 3
      ) {

        const availableDate =
          new Date(
            bookingDate
          );

        availableDate.setDate(
          availableDate.getDate() -
            3
        );


        const formattedBookingDate =
          bookingDate.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          );


        const formattedAvailableDate =
          availableDate.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          );


        return res.status(403).json({

          success: false,

          acceptanceBlocked:
            true,

          message:
            `This booking is scheduled for ${formattedBookingDate}. You can accept it from ${formattedAvailableDate}.`,

          bookingDate:
            bookingDate.toISOString(),

          availableFrom:
            availableDate.toISOString(),

        });
      }


      // ==========================================
      // ASSIGN TECHNICIAN
      // ==========================================

      booking.technician =
        req.user.id;

      booking.status =
        "Accepted";


      // Remove technician from declined list

      booking.declinedTechnicians =
        (
          booking.declinedTechnicians ||
          []
        ).filter(
          (id) =>
            id.toString() !==
            req.user.id.toString()
        );


      // Reset cancellation state

      booking.technicianCancelled =
        false;

      booking.technicianCancellation = {
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
      });
    }
  };


// ==========================================
// Update Booking Status
// ==========================================
const updateBookingStatus =
  async (req, res) => {

    try {

      const { status } =
        req.body;

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


      // ==========================================
      // Check Technician
      // ==========================================

      if (
        !booking.technician
      ) {
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
      // ==========================================

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


      // ==========================================
      // Start Service
      // ==========================================

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


      // ==========================================
      // Complete Job
      // ==========================================

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


      // ==========================================
      // Cancel
      // ==========================================

      else if (
        status ===
        "Cancelled"
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
      });
    }
  };


// ==========================================
// Verify Booking OTP
// ==========================================
const verifyBookingOTP =
  async (req, res) => {

    try {

      const { otp } =
        req.body;

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


      if (
        !booking.technician
      ) {
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
      // OTP ONLY AFTER ON THE WAY
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


// ==========================================
// Pay For Booking
// ==========================================
const payForBooking =
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


      if (
        booking.customer.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied",
        });
      }


      if (
        booking.status !==
        "Completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Service is not completed yet",
        });
      }


      if (
        booking.paymentStatus ===
        "Paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment has already been completed",
        });
      }


      booking.paymentStatus =
        "Paid";


      await booking.save();


      return res.status(200).json({

        success: true,

        message:
          "Payment Successful",

        booking,

      });

    } catch (error) {

      console.error(
        "Pay For Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ==========================================
// Payment History
// ==========================================
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


// ==========================================
// Pending Bookings
// ==========================================
const getPendingBookings =
  async (req, res) => {

    try {

      const bookings =
        await Booking.find({

          status:
            "Pending",

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


// ==========================================
// Assigned Bookings
// ==========================================
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


// ==========================================
// Customer Cancel Booking
// ==========================================
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


// ==========================================
// Technician Cancel Job
//
// ONLY AFTER ACCEPTING
//
// Accepted / On The Way
//        ↓
// Technician cancels
//        ↓
// Pending
//        ↓
// Another technician can accept
// ==========================================
const technicianCancelJob =
  async (req, res) => {

    try {

      const technicianId =
        req.user.id;


      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate(
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


      // ==========================================
      // Check Technician Assignment
      // ==========================================

      if (
        !booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No technician is assigned to this booking.",
        });
      }


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


      // ==========================================
      // Only Accepted / On The Way
      // ==========================================

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


      // ==========================================
      // Save Cancellation History
      // ==========================================

      booking.technicianCancelled =
        true;


      booking.technicianCancellation = {

        technician:
          technicianId,

        cancelledAt:
          new Date(),

        reason:
          "Technician cancelled the accepted job.",

      };


      // ==========================================
      // Make Booking Available Again
      // ==========================================

      booking.technician =
        null;

      booking.status =
        "Pending";


      // ==========================================
      // Stop Tracking
      // ==========================================

      booking.trackingActive =
        false;


      booking.technicianLocation = {

        latitude:
          null,

        longitude:
          null,

        updatedAt:
          null,

      };


      // ==========================================
      // Reset OTP
      // ==========================================

      booking.otpVerified =
        false;


      const newOtp =
        Math.floor(
          1000 +
          Math.random() *
          9000
        ).toString();


      booking.otp =
        newOtp;


      // ==========================================
      // Prevent Same Technician From Seeing Job
      // ==========================================

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


      // ==========================================
      // REAL-TIME CUSTOMER NOTIFICATION
      // ==========================================

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


// ==========================================
// Decline Available Job
//
// BEFORE ACCEPTING
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
// ==========================================
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


      // ==========================================
      // Must Be Pending
      // ==========================================

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


      // ==========================================
      // Must Not Already Have Technician
      // ==========================================

      if (
        booking.technician
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This job has already been assigned to a technician.",
        });
      }


      // ==========================================
      // Check Existing Decline
      // ==========================================

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
        alreadyDeclined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You have already declined this job.",
        });
      }


      // ==========================================
      // Add Technician
      // ==========================================

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


// ==========================================
// Available Jobs
// ==========================================
const getAvailableJobs =
  async (req, res) => {

    try {

      const technicianId =
        req.user.id;


      const bookings =
        await Booking.find({

          status:
            "Pending",

          declinedTechnicians: {
            $ne:
              technicianId,
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
        "Get Available Jobs Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });
    }
  };


// ==========================================
// Get Active Booking
// ==========================================
const getActiveBooking =
  async (req, res) => {

    try {

      const userId =
        req.user._id || req.user.id;

      const userRole =
        req.user.role;

      let booking;


      // ==========================================
      // CUSTOMER
      // ==========================================

      if (
        userRole ===
        "customer"
      ) {

        booking =
          await Booking.findOne({

            customer:
              userId,

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
            .populate(
              "service"
            )
            .populate(
              "technician"
            )
            .sort({
              createdAt: -1,
            });
      }


      // ==========================================
      // TECHNICIAN
      // ==========================================

      else if (
        userRole ===
        "technician"
      ) {

        booking =
          await Booking.findOne({

            technician:
              userId,

            status: {
              $in: [
                "Accepted",
                "On The Way",
                "In Progress",
              ],
            },

          })
            .populate(
              "service"
            )
            .populate(
              "customer"
            )
            .sort({
              createdAt: -1,
            });
      }


      // ==========================================
      // ADMIN
      // ==========================================

      else if (
        userRole ===
        "admin"
      ) {

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
            userRole ===
            "technician"
              ? "You do not have an active job"
              : "You do not have an active service",

        });
      }


      // ==========================================
      // ACTIVE BOOKING FOUND
      // ==========================================

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


// ==========================================
// Get Technician Availability
// ==========================================
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


// ==========================================
// Update Technician Availability
// ==========================================
const updateTechnicianAvailability =
  async (req, res) => {

    try {

      const {
        isOnline,
      } = req.body;


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


// ==========================================
// Remove Completed Job
// ==========================================
//
// TECHNICIAN ONLY
//
// This is separate from customer history.
//
// ==========================================
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


      // ==========================================
      // Check Technician Assignment
      // ==========================================

      if (
        !booking.technician
      ) {

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
      // Only Completed Jobs
      // ==========================================

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


      // ==========================================
      // Remove From Technician
      // ==========================================

      booking.technician =
        null;

      booking.trackingActive =
        false;

      booking.technicianLocation = {

        latitude:
          null,

        longitude:
          null,

        updatedAt:
          null,

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


// ==========================================
// EXPORTS
// ==========================================
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

};