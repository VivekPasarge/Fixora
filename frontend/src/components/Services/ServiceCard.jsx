import { motion } from "framer-motion";
import { FiArrowRight, FiClock, FiStar } from "react-icons/fi";

import "./ServiceCard.css";

const ServiceCard = ({ service }) => {
  const Icon = service.icon;

  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.03,
      }}
      transition={{
        duration: 0.3,
      }}
      className="service-card"
    >
      {/* Background Glow */}
      <div className="service-card-glow"></div>

      {/* Icon */}
      <div className="service-card-icon">
        <Icon />
      </div>

      {/* Title */}
      <h3 className="service-card-title">
        {service.title}
      </h3>

      {/* Description */}
      <p className="service-card-description">
        {service.description}
      </p>

      {/* Rating & Arrival */}
      <div className="service-card-meta">

        <div className="service-card-rating">
          <FiStar className="service-card-star" />
          <span>{service.rating}</span>
        </div>

        <div className="service-card-arrival">
          <FiClock />
          <span>{service.arrival}</span>
        </div>

      </div>

      {/* Price */}
      <div className="service-card-price">

        <p>Starting from</p>

        <h2>{service.price}</h2>

      </div>

      {/* Button */}
      <button className="service-card-button">
        Book Now
        <FiArrowRight className="service-card-arrow" />
      </button>

    </motion.div>
  );
};

export default ServiceCard;