import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiClock,
  FiShield,
  FiStar,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";

import "./BookingCard.css";

const BookingCard = ({ service }) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="booking-card"
    >
      {/* Price */}
      <p className="booking-subtitle">
        Starting From
      </p>

      <h2 className="booking-price">
        ₹{service.price}
      </h2>

      {/* Details */}
      <div className="booking-details">

        <div className="booking-detail-item">

          <div className="booking-detail-left">
            <FiClock className="detail-icon blue" />
            <span>Arrival Time</span>
          </div>

          <span className="booking-detail-value">
            {service.arrivalTime || "Within 45 mins"}
          </span>

        </div>

        <div className="booking-detail-item">

          <div className="booking-detail-left">
            <FiUser className="detail-icon blue" />
            <span>Experience</span>
          </div>

          <span className="booking-detail-value">
            {service.technician?.experience || "5+ Years"}
          </span>

        </div>

        <div className="booking-detail-item">

          <div className="booking-detail-left">
            <FiStar className="detail-icon yellow" />
            <span>Rating</span>
          </div>

          <span className="booking-detail-value">
            {service.technician?.rating || service.rating || 4.8}
          </span>

        </div>

      </div>

      {/* Divider */}
      <div className="booking-divider"></div>

      {/* Benefits */}
      <div className="booking-benefits">

        <div className="benefit-item">
          <FiCheckCircle className="detail-icon green" />
          <span>Verified Professional</span>
        </div>

        <div className="benefit-item">
          <FiCheckCircle className="detail-icon green" />
          <span>Transparent Pricing</span>
        </div>

        <div className="benefit-item">
          <FiShield className="detail-icon green" />
          <span>30-Day Service Warranty</span>
        </div>

      </div>

      {/* Buttons */}
      <div className="booking-buttons">

        <Link
          to={`/booking/${service._id}`}
          className="book-btn"
        >
          Book Service Now
        </Link>

        <button className="support-btn">
          Contact Support
        </button>

      </div>

    </motion.aside>
  );
};

export default BookingCard;