
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

          {/* Service Information */}
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

            {/* Service Information */}
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

        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
