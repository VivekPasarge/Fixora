import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiHash,
  FiTruck,
} from "react-icons/fi";

import Navbar from "../components/Navbar/Navbar";
import "./BookingSuccess.css";

const BookingSuccess = () => {
  return (
    <>
      <Navbar />

      <main className="success-page">

        <div className="success-container">

          <motion.div
            className="success-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            {/* Success Icon */}

            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
            >
              <FiCheckCircle />
            </motion.div>

            <h1>Booking Confirmed!</h1>

            <p className="success-message">
              Thank you for choosing Fixora.
              Your booking has been received successfully.
            </p>

            {/* Booking Details */}

            <div className="booking-info">

              <div className="info-item">

                <FiHash />

                <div>
                  <span>Booking ID</span>
                  <h3>FXR-2026-001245</h3>
                </div>

              </div>

              <div className="info-item">

                <FiTruck />

                <div>
                  <span>Service</span>
                  <h3>Electrician</h3>
                </div>

              </div>

              <div className="info-item">

                <FiCalendar />

                <div>
                  <span>Date</span>
                  <h3>12 July 2026</h3>
                </div>

              </div>

              <div className="info-item">

                <FiClock />

                <div>
                  <span>Time</span>
                  <h3>10:30 AM</h3>
                </div>

              </div>

              <div className="info-item">

                <FiMapPin />

                <div>
                  <span>Address</span>
                  <h3>Rajajinagar, Bengaluru</h3>
                </div>

              </div>

            </div>

            {/* Status */}

            <div className="status-card">

              <h2>What's Next?</h2>

              <ul>

                <li>✅ Booking request received</li>

                <li>✅ Searching nearby technician</li>

                <li>⏳ Technician will be assigned shortly</li>

              </ul>

              <div className="eta-box">

                <span>Estimated Arrival</span>

                <h3>30 – 45 Minutes</h3>

              </div>

            </div>
                        {/* Action Buttons */}

            <div className="success-actions">

              <Link
                to="/track-booking"
                className="primary-btn"
              >
                Track Booking
              </Link>

              <Link
                to="/my-bookings"
                className="secondary-btn"
              >
                My Bookings
              </Link>

              <Link
                to="/"
                className="outline-btn"
              >
                Back to Home
              </Link>

            </div>

          </motion.div>

        </div>

      </main>
    </>
  );
};

export default BookingSuccess;