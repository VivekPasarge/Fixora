import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCreditCard,
  FiFileText,
  FiCheckCircle,
  FiTag,
} from "react-icons/fi";

import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./Payment.css";

// ==========================================
// Razorpay Script Loader
// ==========================================
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// ==========================================
// Payment Page
// ==========================================
const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // State
  // ==========================================

  const [booking, setBooking] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [promoCode, setPromoCode] = useState("");

  const [promoMessage, setPromoMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // Allowed Booking Statuses for Payment
  // ==========================================

  const paymentAllowedStatuses = [
    "Accepted",
    "On The Way",
    "In Progress",
    "Completed",
  ];

  // ==========================================
  // Can Customer Pay?
  // ==========================================

  const canPay =
    booking &&
    paymentAllowedStatuses.includes(
      booking.status
    );

  // ==========================================
  // Fetch Booking
  // ==========================================

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await api.get(
        `/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedBooking =
        response.data.booking;

      setBooking(fetchedBooking);

      // ==========================================
      // Set Payment Method From Booking
      // ==========================================

      if (
        fetchedBooking.paymentMethod ===
        "UPI"
      ) {
        setPaymentMethod("UPI");
      } else if (
        fetchedBooking.paymentMethod ===
          "Card" ||
        fetchedBooking.paymentMethod ===
          "Credit Card" ||
        fetchedBooking.paymentMethod ===
          "Debit Card"
      ) {
        setPaymentMethod("Credit Card");
      } else {
        setPaymentMethod("Cash on Service");
      }
    } catch (error) {
      console.error(
        "Fetch Booking Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Cash Payment
  // ==========================================

  const handleCashPayment = async () => {
    if (!booking) return;

    try {
      setProcessing(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await api.put(
        `/bookings/${booking._id}/pay`,
        {
          paymentMethod:
            "Cash on Service",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setBooking(response.data.booking);

      setPaymentMethod(
        "Cash on Service"
      );
    } catch (error) {
      console.error(
        "Cash Payment Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to select Cash on Service."
      );
    } finally {
      setProcessing(false);
    }
  };
    // ==========================================
  // Razorpay Payment
  // ==========================================

  const handleRazorpayPayment = async () => {
    if (!booking) {
      setError(
        "Booking details are not available."
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // ========================================
      // Get JWT Token
      // ========================================

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        setProcessing(false);
        return;
      }

      // ========================================
      // Load Razorpay Checkout Script
      // ========================================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Razorpay could not be loaded. Please check your internet connection and try again."
        );

        setProcessing(false);
        return;
      }

      // ========================================
      // Double Check Razorpay
      // ========================================

      if (!window.Razorpay) {
        setError(
          "Razorpay is not available. Please refresh the page and try again."
        );

        setProcessing(false);
        return;
      }

      // ========================================
      // Convert Frontend Payment Method
      // To Backend Payment Method
      // ========================================

      const backendPaymentMethod =
        paymentMethod === "Credit Card" ||
        paymentMethod === "Debit Card" ||
        paymentMethod === "Card"
          ? "Card"
          : "UPI";

      console.log(
        "Selected Payment Method:",
        paymentMethod
      );

      console.log(
        "Backend Payment Method:",
        backendPaymentMethod
      );

      // ========================================
      // Create Razorpay Order
      // ========================================

      const orderResponse = await api.post(
        "/payment/create-order",
        {
          bookingId: booking._id,
          paymentMethod:
            backendPaymentMethod,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Create Order Response:",
        orderResponse.data
      );

      const orderData =
        orderResponse.data;

      // ========================================
      // Validate Order Response
      // ========================================

      if (!orderData.success) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }

      if (!orderData.order?.id) {
        throw new Error(
          "Razorpay order ID was not received from the server."
        );
      }

      // ========================================
      // Razorpay Checkout Options
      // ========================================

      const options = {
        key: orderData.keyId,

        amount:
          orderData.order.amount,

        currency:
          orderData.order.currency,

        name: "Fixora",

        description:
          `${booking.service?.name || "Home Service"} Payment`,

        order_id:
          orderData.order.id,

        prefill: {
          name:
            booking.customer?.name ||
            "",

          email:
            booking.customer?.email ||
            "",

          contact:
            booking.customer?.phone ||
            "",
        },

        notes: {
          bookingId:
            booking.bookingId ||
            booking._id,
        },

        theme: {
          color: "#2563eb",
        },

        // ======================================
        // Successful Payment
        // ======================================

        handler: async function (
          response
        ) {
          try {
            console.log(
              "Razorpay Success Response:",
              response
            );

            // ==================================
            // Verify Payment With Backend
            // ==================================

            const verifyResponse =
              await api.post(
                "/payment/verify",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  bookingId:
                    booking._id,
                },
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            console.log(
              "Payment Verification Response:",
              verifyResponse.data
            );

            // ==================================
            // Verification Successful
            // ==================================

            if (
              verifyResponse.data.success
            ) {
              setBooking(
                verifyResponse.data.booking
              );

              setError("");

              // Payment is now actually Paid
              setProcessing(false);
            } else {
              setError(
                verifyResponse.data.message ||
                  "Payment verification failed."
              );

              setProcessing(false);
            }
          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            setError(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support if money was deducted."
            );

            setProcessing(false);
          }
        },

        // ======================================
        // Razorpay Modal Closed
        // ======================================

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay checkout closed."
            );

            setProcessing(false);

            setError(
              "Payment was cancelled."
            );
          },
        },
      };

      // ========================================
      // Create Razorpay Instance
      // ========================================

      const razorpay =
        new window.Razorpay(options);

      // ========================================
      // Payment Failed
      // ========================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay Payment Failed:",
            response
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setProcessing(false);
        }
      );

      // ========================================
      // Open Razorpay Checkout
      // ========================================

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay Payment Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start Razorpay payment."
      );

      setProcessing(false);
    }
  };
    // ==========================================
  // Main Payment Handler
  // ==========================================

  const handlePayment = async () => {
    if (!booking) {
      setError(
        "Booking details are not available."
      );
      return;
    }

    // ========================================
    // Already Paid
    // ========================================

    if (
      booking.paymentStatus === "Paid"
    ) {
      return;
    }

    // ========================================
    // Check Booking Status
    // ========================================

    if (!canPay) {
      setError(
        "Payment is available only after a technician accepts the booking."
      );
      return;
    }

    // ========================================
    // Cash on Service
    // ========================================

    if (
      paymentMethod ===
      "Cash on Service"
    ) {
      await handleCashPayment();
      return;
    }

    // ========================================
    // UPI / Card
    // ========================================

    await handleRazorpayPayment();
  };

  // ==========================================
  // Promo Code
  // ==========================================

  const handlePromo = () => {
    const code =
      promoCode.trim().toUpperCase();

    if (!code) {
      setPromoMessage(
        "Please enter a promo code."
      );
      return;
    }

    setPromoMessage(
      "Promo code integration is coming soon."
    );
  };

    // ==========================================
  // Main JSX
  // ==========================================

  return (
    <>
      <Navbar />

      <div className="payment-page">
        <div className="payment-container">

          {/* ==================================
              Back Button
          ================================== */}

          <Link
            to={`/booking/${booking._id}`}
            className="back-payment"
          >
            <FiArrowLeft />
            Back to Booking
          </Link>

          {/* ==================================
              Page Header
          ================================== */}

          <motion.div
            className="payment-header"
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div>
              <h1>
                Complete Payment
              </h1>

              <p>
                Choose your preferred payment
                method to complete your booking.
              </p>
            </div>

            <div className="payment-secure">
              <FiCheckCircle />

              <span>
                Secure Payment
              </span>
            </div>
          </motion.div>

          {/* ==================================
              Error Message
          ================================== */}

          {error && (
            <motion.div
              className="payment-alert error"
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              {error}
            </motion.div>
          )}

          <div className="payment-grid">

            {/* ==================================
                LEFT SIDE
            ================================== */}

            <div className="payment-main">

              {/* =================================
                  Booking Summary
              ================================= */}

              <motion.div
                className="payment-card booking-summary"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <div className="section-title">
                  <FiFileText />

                  <h2>
                    Booking Summary
                  </h2>
                </div>

                <div className="booking-summary-content">

                  <div className="summary-row">
                    <span>
                      Service
                    </span>

                    <strong>
                      {booking.service?.name ||
                        booking.serviceName ||
                        "Home Service"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Booking ID
                    </span>

                    <strong>
                      {booking.bookingId ||
                        booking._id}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Date
                    </span>

                    <strong>
                      {booking.date
                        ? new Date(
                            booking.date
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "Not available"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Time
                    </span>

                    <strong>
                      {booking.time ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Technician
                    </span>

                    <strong>
                      {booking.technician?.name ||
                        booking.technicianName ||
                        "Assigned Technician"}
                    </strong>
                  </div>

                </div>
              </motion.div>

              {/* =================================
                  Payment Status
              ================================= */}

              <motion.div
                className="payment-card payment-status-card"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
              >
                <div className="section-title">
                  <FiCheckCircle />

                  <h2>
                    Payment Status
                  </h2>
                </div>

                <div className="payment-status-display">

                  <span>
                    Current Status
                  </span>

                  <strong
                    className={
                      booking.paymentStatus ===
                      "Paid"
                        ? "status-paid"
                        : "status-pending"
                    }
                  >
                    {booking.paymentStatus ||
                      "Pending"}
                  </strong>

                </div>
              </motion.div>

              {/* =================================
                  Payment Methods
              ================================= */}

              <motion.div
                className="payment-card"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
              >
                <div className="section-title">
                  <FiCreditCard />

                  <h2>
                    Payment Method
                  </h2>
                </div>

                <div className="payment-methods">

                  {/* =================================
                      UPI
                  ================================= */}

                  <label
                    className={`payment-method-option ${
                      paymentMethod === "UPI"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={
                        paymentMethod ===
                        "UPI"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      disabled={
                        processing ||
                        booking.paymentStatus ===
                          "Paid" ||
                        !canPay
                      }
                    />

                    <div className="payment-method-content">

                      <div className="payment-method-icon">
                        <span>
                          UPI
                        </span>
                      </div>

                      <div>
                        <h3>
                          UPI
                        </h3>

                        <p>
                          Pay using Google Pay,
                          PhonePe, Paytm or any
                          supported UPI app.
                        </p>
                      </div>

                    </div>

                    {paymentMethod ===
                      "UPI" && (
                      <FiCheckCircle className="method-check" />
                    )}
                  </label>

                  {/* =================================
                      Credit Card
                  ================================= */}

                  <label
                    className={`payment-method-option ${
                      paymentMethod ===
                      "Credit Card"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={
                        paymentMethod ===
                        "Credit Card"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      disabled={
                        processing ||
                        booking.paymentStatus ===
                          "Paid" ||
                        !canPay
                      }
                    />

                    <div className="payment-method-content">

                      <div className="payment-method-icon">
                        <FiCreditCard />
                      </div>

                      <div>
                        <h3>
                          Credit Card
                        </h3>

                        <p>
                          Pay securely using
                          your credit card.
                        </p>
                      </div>

                    </div>

                    {paymentMethod ===
                      "Credit Card" && (
                      <FiCheckCircle className="method-check" />
                    )}
                  </label>

                  {/* =================================
                      Debit Card
                  ================================= */}

                  <label
                    className={`payment-method-option ${
                      paymentMethod ===
                      "Debit Card"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Debit Card"
                      checked={
                        paymentMethod ===
                        "Debit Card"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      disabled={
                        processing ||
                        booking.paymentStatus ===
                          "Paid" ||
                        !canPay
                      }
                    />

                    <div className="payment-method-content">

                      <div className="payment-method-icon">
                        <FiCreditCard />
                      </div>

                      <div>
                        <h3>
                          Debit Card
                        </h3>

                        <p>
                          Pay securely using
                          your debit card.
                        </p>
                      </div>

                    </div>

                    {paymentMethod ===
                      "Debit Card" && (
                      <FiCheckCircle className="method-check" />
                    )}
                  </label>

                  {/* =================================
                      Cash on Service
                  ================================= */}

                  <label
                    className={`payment-method-option ${
                      paymentMethod ===
                      "Cash on Service"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Service"
                      checked={
                        paymentMethod ===
                        "Cash on Service"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      disabled={
                        processing ||
                        booking.paymentStatus ===
                          "Paid" ||
                        !canPay
                      }
                    />

                    <div className="payment-method-content">

                      <div className="payment-method-icon">
                        ₹
                      </div>

                      <div>
                        <h3>
                          Cash on Service
                        </h3>

                        <p>
                          Pay directly to the
                          technician after the
                          service.
                        </p>
                      </div>

                    </div>

                    {paymentMethod ===
                      "Cash on Service" && (
                      <FiCheckCircle className="method-check" />
                    )}
                  </label>

                </div>

                {/* =================================
                    Razorpay Information
                ================================= */}

                {paymentMethod !==
                  "Cash on Service" &&
                  booking.paymentStatus !==
                    "Paid" && (
                    <div className="razorpay-info">

                      <FiCheckCircle />

                      <div>
                        <strong>
                          Secure online payment
                        </strong>

                        <p>
                          You will be redirected
                          to Razorpay's secure
                          checkout after clicking
                          the payment button.
                        </p>
                      </div>

                    </div>
                  )}

              </motion.div>

              {/* =================================
                  Promo Code
              ================================= */}

              <motion.div
                className="payment-card promo-card"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
              >
                <div className="section-title">
                  <FiTag />

                  <h2>
                    Promo Code
                  </h2>
                </div>

                <div className="promo-input-row">

                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(
                        e.target.value
                      );
                      setPromoMessage("");
                    }}
                    disabled={
                      processing ||
                      booking.paymentStatus ===
                        "Paid"
                    }
                  />

                  <button
                    type="button"
                    onClick={handlePromo}
                    disabled={
                      processing ||
                      booking.paymentStatus ===
                        "Paid"
                    }
                  >
                    Apply
                  </button>

                </div>

                {promoMessage && (
                  <p className="promo-message">
                    {promoMessage}
                  </p>
                )}

              </motion.div>

            </div>

            {/* ==================================
                RIGHT SIDE
            ================================== */}

            <motion.div
              className="payment-sidebar"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >

              <div className="payment-card price-card">

                <div className="section-title">
                  <FiFileText />

                  <h2>
                    Payment Summary
                  </h2>
                </div>

                <div className="price-details">

                  <div className="price-row">
                    <span>
                      Service Charge
                    </span>

                    <strong>
                      ₹
                      {booking.price || 0}
                    </strong>
                  </div>

                  <div className="price-row">
                    <span>
                      Platform Fee
                    </span>

                    <strong>
                      ₹0
                    </strong>
                  </div>

                  <div className="price-divider"></div>

                  <div className="price-total">
                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹
                      {booking.price || 0}
                    </strong>
                  </div>

                </div>

                {/* =================================
                    Pay Button
                ================================= */}

                <button
                  type="button"
                  className="pay-btn"
                  onClick={
                    handlePayment
                  }
                  disabled={
                    processing ||
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay
                  }
                >
                  {booking.paymentStatus ===
                  "Paid" ? (
                    <>
                      <FiCheckCircle />

                      Payment Completed
                    </>
                  ) : processing ? (
                    "Opening Secure Payment..."
                  ) : paymentMethod ===
                    "Cash on Service" ? (
                    `Confirm Cash ₹${
                      booking.price || 0
                    }`
                  ) : (
                    `Pay ₹${
                      booking.price || 0
                    } Securely`
                  )}
                </button>

                {/* =================================
                    Payment Restriction
                ================================= */}

                {!canPay &&
                  booking.paymentStatus !==
                    "Paid" && (
                    <p className="payment-note">
                      Payment will be available
                      after a technician accepts
                      your booking.
                    </p>
                  )}

                {/* =================================
                    Paid Message
                ================================= */}

                {booking.paymentStatus ===
                  "Paid" && (
                  <div className="paid-message">

                    <FiCheckCircle />

                    <div>
                      <strong>
                        Payment Successful
                      </strong>

                      <p>
                        Your payment has been
                        successfully verified.
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* ==================================
                  Security Card
              ================================== */}

              <div className="payment-card security-card">

                <FiCheckCircle />

                <div>
                  <h3>
                    Secure Payment
                  </h3>

                  <p>
                    Your payment is processed
                    securely through Razorpay.
                    Fixora does not store your
                    card or UPI credentials.
                  </p>
                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;