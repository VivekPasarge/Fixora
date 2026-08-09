import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiTool,
  FiCheckCircle,
} from "react-icons/fi";

import Navbar from "../components/Navbar/Navbar";
import "./BookingDetails.css";

const BookingDetails = () => {
  return (
    <>
      <Navbar />

      <main className="booking-details-page">

        <div className="booking-details-container">

          {/* Back Button */}

          <Link
            to="/my-bookings"
            className="back-btn"
          >
            <FiArrowLeft />
            Back to My Bookings
          </Link>

          {/* Header */}

          <motion.div
            className="details-header"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            <div>

              <h1>Booking Details</h1>

              <p>
                View complete information about your booking.
              </p>

            </div>

            <span className="booking-status">
              <FiCheckCircle />
              Confirmed
            </span>

          </motion.div>

          {/* Service Card */}

          <motion.div
            className="service-details-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >

            <div className="service-left">

              <div className="service-icon">
                <FiTool />
              </div>

              <div>

                <h2>Electrician Service</h2>

                <p>Professional Electrical Repair</p>

              </div>

            </div>

            <div className="service-right">

              <h2>₹299</h2>

              <span>Starting Price</span>

            </div>

          </motion.div>

          {/* Booking Information */}

          <div className="details-grid">            {/* Customer Details */}

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >

              <h2>Customer Details</h2>

              <div className="info-row">
                <span>Name</span>
                <strong>Vivek Pasarge</strong>
              </div>

              <div className="info-row">
                <span>Phone</span>
                <strong>+91 9876543210</strong>
              </div>

              <div className="info-row">
                <span>Email</span>
                <strong>vivek@email.com</strong>
              </div>

            </motion.div>

            {/* Service Address */}

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >

              <h2>Service Address</h2>

              <div className="info-row">
                <span>Address</span>
                <strong>Rajajinagar</strong>
              </div>

              <div className="info-row">
                <span>City</span>
                <strong>Bengaluru</strong>
              </div>

              <div className="info-row">
                <span>Pincode</span>
                <strong>560010</strong>
              </div>

            </motion.div>

            {/* Schedule */}

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >

              <h2>Schedule</h2>

              <div className="info-row">
                <span>Date</span>
                <strong>12 July 2026</strong>
              </div>

              <div className="info-row">
                <span>Time</span>
                <strong>10:30 AM</strong>
              </div>

              <div className="info-row">
                <span>Technician</span>
                <strong>Rahul Sharma</strong>
              </div>

            </motion.div>

            {/* Payment */}

            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >

              <h2>Payment Details</h2>

              <div className="info-row">
                <span>Method</span>
                <strong>Cash on Service</strong>
              </div>

              <div className="info-row">
                <span>Total Amount</span>
                <strong>₹348</strong>
              </div>

              <div className="info-row">
                <span>Status</span>
                <strong className="payment-pending">
                  Pending
                </strong>
              </div>
              <Link
  to="/payment"
  className="track-btn"
>
  Proceed to Payment
</Link>

            </motion.div>

          </div>

          {/* Action Buttons */}

          <div className="details-actions">

            <Link
              to="/track-booking"
              className="track-btn"
            >
              Track Booking
            </Link>

            <button className="cancel-btn">
              Cancel Booking
            </button>

          </div>

        </div>

      </main>

    </>
  );
};

export default BookingDetails;
          