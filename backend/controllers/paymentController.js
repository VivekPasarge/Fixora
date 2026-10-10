const crypto = require("crypto");
const Booking = require("../models/Booking");
const razorpay = require("../config/razorpay");

const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const customerId = req.user._id || req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    if (!["UPI", "Card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Select UPI or Card for online payment",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.customer.toString() !== customerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this booking",
      });
    }

    if (
      !["Accepted", "On The Way", "In Progress", "Completed"].includes(
        booking.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "A technician must accept the booking before payment",
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(409).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    if (
      booking.paymentMethod === "Cash on Service" &&
      booking.cashReceivedAt
    ) {
      return res.status(409).json({
        success: false,
        message: "Cash payment has already been recorded",
      });
    }

    const amount = Number(booking.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Razorpay configuration is missing",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: booking.bookingId,
      notes: {
        bookingId: booking._id.toString(),
        fixoraBookingId: booking.bookingId,
        customerId: customerId.toString(),
        paymentMethod,
      },
    });

    booking.razorpayOrderId = order.id;
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = "Pending";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        price: booking.price,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Failed to create Razorpay order",
    });
  }
};

// Part 2 continues below.
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const customerId = req.user._id || req.user.id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is not configured",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.customer.toString() !== customerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment",
      });
    }

    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not match this booking",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "hex"
    );

    let receivedBuffer;

    try {
      receivedBuffer = Buffer.from(razorpay_signature, "hex");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      generatedBuffer.length === 0 ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    if (booking.paymentStatus === "Paid") {
      if (booking.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment has already been verified",
          booking,
        });
      }

      return res.status(409).json({
        success: false,
        message: "A different payment has already been recorded",
      });
    }

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.currency !== "INR" ||
      Number(payment.amount) !== Math.round(Number(booking.price) * 100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not captured or its amount does not match the booking",
      });
    }

    if (
      payment.method === "upi" &&
      booking.paymentMethod !== "UPI"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment method does not match the booking",
      });
    }

    if (
      payment.method === "card" &&
      booking.paymentMethod !== "Card"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment method does not match the booking",
      });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        customer: customerId,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "Pending",
      },
      {
        $set: {
          paymentStatus: "Paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBooking) {
      const latestBooking = await Booking.findById(booking._id);

      if (
        latestBooking?.paymentStatus === "Paid" &&
        latestBooking.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment has already been verified",
          booking: latestBooking,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Booking payment status changed. Refresh and retry.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
