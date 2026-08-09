import { motion } from "framer-motion";
import { FiMapPin } from "react-icons/fi";

import trackingData from "./trackingData";
import StatusTimeline from "./StatusTimeline";
import TrackingCard from "./TrackingCard";

import "./LiveTracking.css";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const LiveTracking = () => {
  return (
    <section id="tracking" className="tracking-section">

      {/* Background */}

      <div className="tracking-bg-left"></div>

      <div className="tracking-bg-right"></div>

      <div className="tracking-container">

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="tracking-header"
        >

          <span className="tracking-badge">

            <FiMapPin />

            LIVE TRACKING

          </span>

          <h2 className="tracking-title">

            Track Your Technician<span>
              In Real Time
            </span>

          </h2>

          <p className="tracking-description">

            From booking confirmation to arrival,
            stay updated with your technician's live
            location, estimated arrival time, and
            service progress.

          </p>

        </motion.div>

        {/* Content */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="tracking-grid"
        >

          <motion.div variants={itemVariants}>
            <StatusTimeline data={trackingData} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <TrackingCard technician={trackingData.technician} />
          </motion.div>

        </motion.div>

      </div>

    </section>
  );
};

export default LiveTracking;