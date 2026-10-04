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

// =========================================================
// LOAD RAZORPAY CHECKOUT SCRIPT
// =========================================================

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

// =========================================================
// PAYMENT COMPONENT
// =========================================================

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [booking, setBooking] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  // =======================================================
  // FETCH BOOKING
  // =======================================================

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

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

      setBooking(response.data.booking);
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

  // =======================================================
  // PAYMENT STATUS
  // =======================================================

  const paymentAllowedStatuses = [
    "Accepted",
    "On The Way",
    "In Progress",
    "Completed",
  ];

  const canPay =
    booking &&
    paymentAllowedStatuses.includes(
      booking.status
    );

  // =======================================================
  // CASH ON SERVICE
  // =======================================================

  const handleCashPayment = async () => {
    if (!booking) {
      return;
    }

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
          paymentMethod: "Cash on Service",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBooking(response.data.booking);

      setPaymentMethod("Cash on Service");
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

  // =======================================================
  // RAZORPAY PAYMENT
  // =======================================================

  const handleRazorpayPayment = async () => {
    if (!booking) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      // ---------------------------------------------------
      // Load Razorpay Checkout
      // ---------------------------------------------------

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Unable to load Razorpay. Please check your internet connection and try again."
        );

        setProcessing(false);
        return;
      }

      // ---------------------------------------------------
      // Backend payment method
      // ---------------------------------------------------

      const backendPaymentMethod =
        paymentMethod === "Credit Card" ||
        paymentMethod === "Debit Card"
          ? "Card"
          : "UPI";

      // ---------------------------------------------------
      // Create Razorpay Order
      // ---------------------------------------------------

      const orderResponse =
        await api.post(
          "/payment/create-order",
          {
            bookingId: booking._id,
            paymentMethod:
              backendPaymentMethod,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const orderData =
        orderResponse.data;

      if (!orderData.success) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }

      // ---------------------------------------------------
      // Razorpay Options
      // ---------------------------------------------------

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

        handler: async function (
          response
        ) {
          try {
            // ------------------------------------------------
            // Verify payment on backend
            // ------------------------------------------------

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
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

            if (
              verifyResponse.data.success
            ) {
              setBooking(
                verifyResponse.data.booking
              );

              setError("");
            } else {
              setError(
                verifyResponse.data.message ||
                  "Payment verification failed."
              );
            }
          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            setError(
              error.response?.data?.message ||
                "Payment verification failed."
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            setProcessing(false);

            setError(
              "Payment was cancelled."
            );
          },
        },
      };

      // ---------------------------------------------------
      // Open Razorpay
      // ---------------------------------------------------

      const razorpay =
        new window.Razorpay(options);

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

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay Payment Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Payment failed. Please try again."
      );

      setProcessing(false);
    }
  };

  // =======================================================
  // HANDLE PAYMENT
  // =======================================================

  const handlePayment = async () => {
    if (!booking) {
      return;
    }

    if (
      booking.paymentStatus === "Paid"
    ) {
      return;
    }

    if (!canPay) {
      setError(
        "Payment is available only after a technician accepts the booking."
      );

      return;
    }

    // -----------------------------------------------------
    // Cash on Service
    // -----------------------------------------------------

    if (
      paymentMethod ===
      "Cash on Service"
    ) {
      await handleCashPayment();
      return;
    }

    // -----------------------------------------------------
    // UPI / Card
    // -----------------------------------------------------

    await handleRazorpayPayment();
  };

  // =======================================================
  // PROMO CODE
  // =======================================================

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

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="payment-loading">
          Loading payment details...
        </div>
      </>
    );
  }

  // =======================================================
  // ERROR / BOOKING NOT FOUND
  // =======================================================

  if (error && !booking) {
    return (
      <>
        <Navbar />

        <main className="payment-page">
          <div className="payment-error-card">
            <h2>
              Unable to Load Payment
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchBooking}
              className="retry-payment-btn"
            >
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  // =======================================================
  // BOOKING NOT FOUND
  // =======================================================

  if (!booking) {
    return (
      <>
        <Navbar />

        <div className="payment-loading">
          Booking not found.
        </div>
      </>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <>
      <Navbar />

      <main className="payment-page">
        <div className="payment-container">

          {/* BACK */}

          <Link
            to={`/track-booking/${booking._id}`}
            className="back-btn"
          >
            <FiArrowLeft />
            Back to Booking
          </Link>

          {/* HEADER */}

          <motion.div
            className="payment-header"
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div className="payment-header-icon">
              <FiCreditCard />
            </div>

            <div>
              <h1>Payment</h1>

              <p>
                Complete your payment securely.
              </p>
            </div>
          </motion.div>

          {/* ERROR */}

          {error && (
            <div className="payment-error-message">
              {error}
            </div>
          )}

          {/* PAYMENT NOT AVAILABLE */}

          {!canPay &&
            booking.paymentStatus !==
              "Paid" && (
              <div className="payment-error-message">
                Payment will be available after
                a technician accepts your booking.
              </div>
            )}

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <motion.div
            className="summary-card"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            <div className="summary-title">
              <FiFileText />

              <h2>
                Order Summary
              </h2>
            </div>

            <div className="summary-row">
              <span>Booking ID</span>

              <strong>
                {booking.bookingId ||
                  booking._id}
              </strong>
            </div>

            <div className="summary-row">
              <span>Service</span>

              <strong>
                {booking.service?.name ||
                  "Home Service"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Booking Date</span>

              <strong>
                {booking.bookingDate
                  ? new Date(
                      booking.bookingDate
                    ).toLocaleDateString()
                  : "N/A"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Booking Time</span>

              <strong>
                {booking.bookingTime ||
                  "N/A"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Payment Method</span>

              <strong>
                {booking.paymentMethod ||
                  paymentMethod ||
                  "Not selected"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Payment Status</span>

              <strong
                className={
                  booking.paymentStatus ===
                  "Paid"
                    ? "payment-status-paid"
                    : "payment-status-pending"
                }
              >
                {booking.paymentStatus ||
                  "Pending"}
              </strong>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total Amount</span>

              <strong>
                ₹{booking.price || 0}
              </strong>
            </div>
          </motion.div>

          {/* =================================================
              PAYMENT CARD
          ================================================= */}

          <motion.div
            className="payment-card"
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            <div className="payment-title">
              <FiCreditCard />

              <h2>
                Select Payment Method
              </h2>
            </div>

            {/* PAYMENT OPTIONS */}

            <div className="payment-options">

              {/* UPI */}

              <label
                className={`payment-option ${
                  paymentMethod === "UPI"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value="UPI"
                  checked={
                    paymentMethod === "UPI"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  disabled={
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
                  }
                />

                <span>
                  UPI / QR
                </span>
              </label>

              {/* CREDIT CARD */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "Credit Card"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
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
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
                  }
                />

                <span>
                  Credit Card
                </span>
              </label>

              {/* DEBIT CARD */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "Debit Card"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
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
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
                  }
                />

                <span>
                  Debit Card
                </span>
              </label>

              {/* CASH ON SERVICE */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "Cash on Service"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
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
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
                  }
                />

                <span>
                  Cash on Service
                </span>
              </label>
            </div>

            {/* =================================================
                RAZORPAY INFORMATION
            ================================================= */}

            {paymentMethod !==
              "Cash on Service" &&
              booking.paymentStatus !==
                "Paid" &&
              canPay && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  <strong>
                    Secure online payment
                  </strong>

                  <br />

                  UPI payments may include
                  QR scan, UPI ID or supported
                  UPI options inside Razorpay.
                  Card payments are also
                  supported.
                </div>
              )}

            {/* =================================================
                PROMO
            ================================================= */}

            <div className="promo-section">
              <label className="promo-label">
                Promo Code
              </label>

              <div className="promo-box">
                <FiTag />

                <input
                  type="text"
                  className="promo-input"
                  placeholder="Enter Promo Code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(
                      e.target.value
                    );

                    setPromoMessage("");
                  }}
                  disabled={
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
                  }
                />

                <button
                  type="button"
                  className="apply-btn"
                  onClick={handlePromo}
                  disabled={
                    booking.paymentStatus ===
                      "Paid" ||
                    !canPay ||
                    processing
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
            </div>

            {/* =================================================
                PAY BUTTON
            ================================================= */}

            <button
              type="button"
              className="pay-btn"
              onClick={handlePayment}
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

            {/* =================================================
                SUCCESS
            ================================================= */}

            {booking.paymentStatus ===
              "Paid" && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="payment-success"
              >
                <div className="payment-success-icon">
                  <FiCheckCircle />
                </div>

                <h3>
                  Payment Successful
                </h3>

                <p>
                  Thank you for choosing
                  Fixora.
                </p>

                {booking.razorpayPaymentId && (
                  <p>
                    Payment ID:{" "}
                    <strong>
                      {
                        booking.razorpayPaymentId
                      }
                    </strong>
                  </p>
                )}

                <button
                  type="button"
                  className="back-dashboard-btn"
                  onClick={() =>
                    navigate(
                      "/customer-dashboard"
                    )
                  }
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Payment;