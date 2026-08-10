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

const Payment = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [promoCode, setPromoCode] = useState("");

  const [promoMessage, setPromoMessage] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");


  /* =========================================================
     FETCH BOOKING
  ========================================================= */

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


  /* =========================================================
     HANDLE PAYMENT
  ========================================================= */

  const handlePayment = async () => {
    if (!booking) {
      return;
    }

    if (booking.paymentStatus === "Paid") {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await api.put(
        `/bookings/${booking._id}/pay`,
        {
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBooking(response.data.booking);

    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Payment failed. Please try again."
      );

    } finally {
      setProcessing(false);
    }
  };


  /* =========================================================
     PROMO CODE
  ========================================================= */

  const handlePromo = () => {
    const code = promoCode.trim().toUpperCase();

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


  /* =========================================================
     LOADING
  ========================================================= */

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


  /* =========================================================
     ERROR / BOOKING NOT FOUND
  ========================================================= */

  if (error && !booking) {
    return (
      <>
        <Navbar />

        <main className="payment-page">

          <div className="payment-error-card">

            <h2>
              Unable to Load Payment
            </h2>

            <p>
              {error}
            </p>

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


  /* =========================================================
     PAGE
  ========================================================= */

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
              <h1>
                Payment
              </h1>

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
                Service
              </span>

              <strong>
                {booking.service?.name ||
                  "Home Service"}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Booking Date
              </span>

              <strong>
                {booking.bookingDate
                  ? new Date(
                      booking.bookingDate
                    ).toLocaleDateString()
                  : "N/A"}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Booking Time
              </span>

              <strong>
                {booking.bookingTime ||
                  "N/A"}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Payment Method
              </span>

              <strong>
                {booking.paymentMethod ||
                  "Not selected"}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Payment Status
              </span>

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

              <span>
                Total Amount
              </span>

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
                    "Paid"
                  }
                />

                <span>
                  UPI
                </span>

              </label>


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
                    "Paid"
                  }
                />

                <span>
                  Credit Card
                </span>

              </label>


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
                    "Paid"
                  }
                />

                <span>
                  Debit Card
                </span>

              </label>


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
                    "Paid"
                  }
                />

                <span>
                  Cash on Service
                </span>

              </label>

            </div>


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
                    "Paid"
                  }
                />

                <button
                  type="button"
                  className="apply-btn"
                  onClick={handlePromo}
                  disabled={
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
                  "Paid"
              }
            >

              {booking.paymentStatus ===
              "Paid" ? (
                <>
                  <FiCheckCircle />

                  Payment Completed
                </>
              ) : processing ? (
                "Processing..."
              ) : (
                `Pay ₹${booking.price || 0}`
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
                  Thank you for choosing Fixora.
                </p>

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