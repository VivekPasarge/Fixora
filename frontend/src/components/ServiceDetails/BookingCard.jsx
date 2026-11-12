
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
  const arrivalTime = service.arrivalTime || "Within 45 mins";
  const experience = service.technician?.experience || "5+ Years";
  const rating =
    service.technician?.rating || service.rating || 4.8;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="service-booking-card"
    >
      {/* Price */}
      <div className="service-price-header">
        <div>
          <span className="service-price-label">
            Starting from
          </span>

          <h2 className="service-price-value">
            ₹{service.price}
          </h2>
        </div>

        <span className="service-price-tag">
          Fixora Service
        </span>
      </div>

      {/* Service information */}
      <div className="service-booking-info">
        <div className="service-info-row">
          <div className="service-info-icon blue">
            <FiClock />
          </div>

          <div className="service-info-text">
            <span>Arrival time</span>
            <strong>{arrivalTime}</strong>
          </div>
        </div>

        <div className="service-info-row">
          <div className="service-info-icon blue">
            <FiUser />
          </div>

          <div className="service-info-text">
            <span>Experience</span>
            <strong>{experience}</strong>
          </div>
        </div>

        <div className="service-info-row">
          <div className="service-info-icon yellow">
            <FiStar />
          </div>

          <div className="service-info-text">
            <span>Customer rating</span>
            <strong>{rating} / 5</strong>
          </div>
        </div>
      </div>

      {/* Trust information */}
      <div className="service-booking-trust">
        <div>
          <FiCheckCircle />
          <span>Verified professionals</span>
        </div>

        <div>
          <FiShield />
          <span>Transparent pricing</span>
        </div>
      </div>

      {/* Booking button */}
      <Link
        to={`/booking/${service._id}`}
        className="service-booking-button"
      >
        Book This Service
        <span aria-hidden="true">→</span>
      </Link>

      <p className="service-booking-note">
        Simple booking. Reliable home service.
      </p>
    </motion.aside>
  );
};

export default BookingCard;
