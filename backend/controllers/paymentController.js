const crypto = require("crypto");

const Booking = require("../models/Booking");
const razorpay = require("../config/razorpay");

// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================

const createRazorpayOrder = async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
    } = req.body;

    // -----------------------------------------------------
    // Validate booking ID
    // -----------------------------------------------------

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // -----------------------------------------------------
    // Validate payment method
    // -----------------------------------------------------

    const validPaymentMethods = [
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
        message:
          "Invalid online payment method",
      });
    }

    // -----------------------------------------------------
    // Find booking
    // -----------------------------------------------------

    const booking =
      await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------------
    // Customer ownership check
    // -----------------------------------------------------

    if (
      booking.customer.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // -----------------------------------------------------
    // Validate booking status
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // Prevent paying an already-paid booking
    // -----------------------------------------------------

    if (
      booking.paymentStatus === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed",
      });
    }

    // -----------------------------------------------------
    // Validate booking price
    // -----------------------------------------------------

    const amount =
      Number(booking.price);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking amount",
      });
    }

    // -----------------------------------------------------
    // Convert INR to paise
    // -----------------------------------------------------

    const amountInPaise =
      Math.round(amount * 100);

    // -----------------------------------------------------
    // Create Razorpay order
    // -----------------------------------------------------

    const options = {
      amount: amountInPaise,

      currency: "INR",

      receipt:
        booking.bookingId,

      notes: {
        bookingId:
          booking._id.toString(),

        fixoraBookingId:
          booking.bookingId,

        customerId:
          booking.customer.toString(),

        paymentMethod,
      },
    };

    const razorpayOrder =
      await razorpay.orders.create(
        options
      );

    // -----------------------------------------------------
    // Save Razorpay order information
    // -----------------------------------------------------

    booking.razorpayOrderId =
      razorpayOrder.id;

    booking.paymentMethod =
      paymentMethod;

    // IMPORTANT:
    // Creating an order DOES NOT mean payment is paid.

    booking.paymentStatus =
      "Pending";

    await booking.save();

    // -----------------------------------------------------
    // Send response
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Razorpay order created successfully",

      order: {
        id: razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,
      },

      booking: {
        id: booking._id,

        bookingId:
          booking.bookingId,

        price:
          booking.price,
      },

      keyId:
        process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Razorpay Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.error?.description ||
        error.message ||
        "Failed to create Razorpay order",
    });
  }
};

// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // -----------------------------------------------------
    // Validate required fields
    // -----------------------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Payment verification data is incomplete",
      });
    }

    // -----------------------------------------------------
    // Find booking
    // -----------------------------------------------------

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------------
    // Customer ownership check
    // -----------------------------------------------------

    if (
      booking.customer.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // -----------------------------------------------------
    // Check Razorpay order ID
    // -----------------------------------------------------

    if (
      booking.razorpayOrderId !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Razorpay order does not match this booking",
      });
    }

    // -----------------------------------------------------
    // Generate expected signature
    // -----------------------------------------------------

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // -----------------------------------------------------
    // Safe signature comparison
    // -----------------------------------------------------

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Payment signature verification failed",
      });
    }

    const signaturesMatch =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signaturesMatch) {
      return res.status(400).json({
        success: false,

        message:
          "Payment signature verification failed",
      });
    }

    // -----------------------------------------------------
    // Prevent duplicate payment
    // -----------------------------------------------------

    if (
      booking.paymentStatus ===
      "Paid"
    ) {
      return res.status(200).json({
        success: true,

        message:
          "Payment has already been verified",

        booking,
      });
    }

    // -----------------------------------------------------
    // MARK PAYMENT AS PAID
    // -----------------------------------------------------

    booking.paymentStatus =
      "Paid";

    booking.razorpayPaymentId =
      razorpay_payment_id;

    booking.razorpaySignature =
      razorpay_signature;

    booking.paidAt =
      new Date();

    await booking.save();

    // -----------------------------------------------------
    // Success response
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      booking,
    });
  } catch (error) {
    console.error(
      "Verify Razorpay Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Payment verification failed",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};