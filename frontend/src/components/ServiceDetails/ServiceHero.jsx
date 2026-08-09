import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiStar,
  FiMapPin,
  FiSettings,
} from "react-icons/fi";

import "./ServiceHero.css";

const ServiceHero = ({ service }) => {
  return (
    <section className="service-hero">
      {/* Background Blur */}
      <div className="hero-blur hero-blur-left"></div>
      <div className="hero-blur hero-blur-right"></div>

      <div className="service-hero-container">

        {/* Back Button */}
        <Link to="/services" className="back-button">
          <FiArrowLeft />
          Back to Services
        </Link>

        <div className="hero-content">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-left"
          >
            <div className="service-icon-box">
              <FiSettings size={48} />
            </div>

            <p className="service-category">
              {service.category}
            </p>

            <h1 className="service-title">
              {service.name}
            </h1>

            <p className="service-description">
              {service.description}
            </p>

            <div className="service-info">

              <div className="info-item">
                <FiStar className="star-icon" />
                <span className="info-value">
                  {service.rating || 4.8}
                </span>
                <span className="info-text">
                  ({service.reviews || 120} Reviews)
                </span>
              </div>

              <div className="info-item">
                <FiClock className="clock-icon" />
                <span>
                  {service.arrivalTime || "Within 45 mins"}
                </span>
              </div>

              <div className="info-item">
                <FiMapPin className="location-icon" />
                <span>Available Near You</span>
              </div>

            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-right"
          >
            <div className="price-card">

              <p className="price-label">
                Starting From
              </p>

              <h2 className="price-value">
                ₹{service.price}
              </h2>

              <div className="price-details">

                <div className="price-row">
                  <span>Arrival</span>
                  <strong>
                    {service.arrivalTime || "Within 45 mins"}
                  </strong>
                </div>

                <div className="price-row">
                  <span>Duration</span>
                  <strong>
                    {service.duration || "30-60 mins"}
                  </strong>
                </div>

                <div className="price-row">
                  <span>Service Warranty</span>
                  <strong className="warranty">
                    30 Days
                  </strong>
                </div>

              </div>

              <Link
                to={`/booking/${service._id}`}
                className="book-service-btn"
              >
                Book Service
              </Link>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default ServiceHero;