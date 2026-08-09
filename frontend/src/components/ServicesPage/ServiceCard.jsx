import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiClock,
  FiStar,
  FiTool,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import "./ServiceCard.css";

const ServiceCard = ({ service }) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{ duration: 0.3 }}
      className="service-card"
    >
      {/* Icon */}
      <div className="service-card-icon">
        <FiTool size={30} />
      </div>

      {/* Category */}
      <p className="service-card-category">
        {service.category}
      </p>

      {/* Title */}
      <h3 className="service-card-title">
        {service.name}
      </h3>

      {/* Description */}
      <p className="service-card-description">
        {service.description}
      </p>

      {/* Rating */}
      <div className="service-card-info">

        <div className="service-card-rating">
          <FiStar className="service-card-star" />
          <span className="rating-value">4.8</span>
          <span className="rating-count">(120)</span>
        </div>

        <div className="service-card-duration">
          <FiClock />
          <span>30-60 min</span>
        </div>

      </div>

      {/* Price */}
      <div className="service-card-price">
        <p>Starting from</p>

        <h2>₹{service.price}</h2>
      </div>

      {/* Button */}
      <Link
        to={`/services/${service._id}`}
        className="service-card-button"
      >
        View Details
        <FiArrowRight className="service-card-arrow" />
      </Link>

    </motion.div>
  );
};

export default ServiceCard;