import { motion } from "framer-motion";
import { FiPower, FiClock } from "react-icons/fi";

import "./AvailabilityCard.css";

const AvailabilityCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="availability-card"
    >
      <h2 className="availability-title">
        Availability
      </h2>

      <p className="availability-subtitle">
        Control your working status.
      </p>

      <div className="status-card">

        <div className="status-header">

          <div>

            <p className="status-label">
              Current Status
            </p>

            <h3 className="status-text">
              Online
            </h3>

          </div>

          <div className="status-icon">
            <FiPower size={28} />
          </div>

        </div>

      </div>

      <div className="availability-details">

        <div className="detail-row">
          <span className="detail-label">
            Working Hours
          </span>

          <strong>09:00 AM - 08:00 PM</strong>
        </div>

        <div className="detail-row">
          <span className="detail-label">
            Break Time
          </span>

          <strong>01:00 PM - 02:00 PM</strong>
        </div>

        <div className="detail-row">
          <span className="detail-label">
            Today's Availability
          </span>

          <strong>9 Hours</strong>
        </div>

      </div>

      <button className="offline-btn">
        <FiClock />
        Go Offline
      </button>

    </motion.div>
  );
};

export default AvailabilityCard;