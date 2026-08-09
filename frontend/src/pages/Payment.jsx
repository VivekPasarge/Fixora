import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCreditCard,
  FiFileText,
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

  useEffect(() => {

    fetchBooking();

  }, []);

  const fetchBooking = async () => {

    try {

      const token = localStorage.getItem("token");

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

      console.log(error);

    }

  };

  const handlePayment = async () => {

    try {

      const token = localStorage.getItem("token");

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

      alert(response.data.message);

      setBooking(response.data.booking);

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Payment Failed"
      );

    }

  };

  if (!booking) {

    return (
      <>
        <Navbar />
        <h2
          style={{
            textAlign: "center",
            marginTop: "120px",
          }}
        >
          Loading...
        </h2>
      </>
    );

  }

  return (

    <>

      <Navbar />

      <main className="payment-page">

        <div className="payment-container">

          <Link
            to={`/track-booking/${booking._id}`}
            className="back-btn"
          >

            <FiArrowLeft />

            Back to Booking

          </Link>

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

            <h1>Payment</h1>

            <p>

              Complete your payment securely.

            </p>

          </motion.div>
                    {/* Order Summary */}

          <motion.div
            className="summary-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >

            <div className="summary-title">

              <FiFileText />

              <h2>Order Summary</h2>

            </div>

            <div className="summary-row">

              <span>Booking ID</span>

              <strong>{booking.bookingId}</strong>

            </div>

            <div className="summary-row">

              <span>Service</span>

              <strong>{booking.service.name}</strong>

            </div>

            <div className="summary-row">

              <span>Booking Date</span>

              <strong>
                {new Date(
                  booking.bookingDate
                ).toLocaleDateString()}
              </strong>

            </div>

            <div className="summary-row">

              <span>Booking Time</span>

              <strong>{booking.bookingTime}</strong>

            </div>

            <div className="summary-row">

              <span>Payment Method</span>

              <strong>{booking.paymentMethod}</strong>

            </div>

            <div className="summary-row">

              <span>Payment Status</span>

              <strong
                style={{
                  color:
                    booking.paymentStatus === "Paid"
                      ? "#16a34a"
                      : "#f59e0b",
                }}
              >
                {booking.paymentStatus}
              </strong>

            </div>

            <hr />

            <div className="summary-total">

              <span>Total Amount</span>

              <strong>₹{booking.price}</strong>

            </div>

          </motion.div>

          {/* Payment Section */}

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

              <h2>Select Payment Method</h2>

            </div>

            <div className="payment-options">

              <label className="payment-option">

                <input
                  type="radio"
                  value="UPI"
                  checked={
                    paymentMethod === "UPI"
                  }
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <span>UPI</span>

              </label>

              <label className="payment-option">

                <input
                  type="radio"
                  value="Credit Card"
                  checked={
                    paymentMethod === "Credit Card"
                  }
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <span>Credit Card</span>

              </label>

              <label className="payment-option">

                <input
                  type="radio"
                  value="Debit Card"
                  checked={
                    paymentMethod === "Debit Card"
                  }
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <span>Debit Card</span>

              </label>

              <label className="payment-option">

                <input
                  type="radio"
                  value="Cash on Service"
                  checked={
                    paymentMethod ===
                    "Cash on Service"
                  }
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <span>Cash on Service</span>

              </label>

            </div>

            <div className="promo-section">

              <label className="promo-label">

                Promo Code

              </label>

              <div className="promo-box">

                <input
                  type="text"
                  className="promo-input"
                  placeholder="Enter Promo Code"
                />

                <button
                  type="button"
                  className="apply-btn"
                >
                  Apply
                </button>

              </div>

            </div>

                        <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={booking.paymentStatus === "Paid"}
            >
              {booking.paymentStatus === "Paid"
                ? "Payment Completed"
                : `Pay ₹${booking.price}`}
            </button>

            {booking.paymentStatus === "Paid" && (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="payment-success"
              >

                <h3>
                  ✅ Payment Successful
                </h3>

                <p>
                  Thank you for choosing Fixora.
                </p>

                <button
                  className="back-dashboard-btn"
                  onClick={() =>
                    navigate("/customer-dashboard")
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