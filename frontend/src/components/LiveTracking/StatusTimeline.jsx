import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiStar,
  FiTruck,
  FiUser,
} from "react-icons/fi";

import "./StatusTimeline.css";

const StatusTimeline = ({ data }) => {
  return (
    <motion.section
      className="status-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* ===============================
          HEADER
      =============================== */}

      <div className="status-header">

        <span className="live-badge">
          Live Status
        </span>

        <h2 className="status-title">
          Technician Tracking
        </h2>

        <p className="status-description">
          Follow every stage of your booking in real time. Track technician
          progress, estimated arrival, and service completion from one place.
        </p>

      </div>

      {/* ===============================
          BODY
      =============================== */}

      <div className="status-body">

        {/* ===============================
            LEFT SIDE
        =============================== */}

        <motion.div
          className="technician-card"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .5 }}
        >

          <div className="technician-top">

            <div className="avatar">
              <FiUser />
            </div>

            <div className="technician-info">

              <h3 className="technician-name">
                {data.technician.name}
              </h3>

              <span className="technician-role">
                {data.technician.role}
              </span>

            </div>

          </div>

          <div className="stats-grid">

            <div className="stat-card">

              <FiTruck />

              <span>Estimated Arrival</span>

              <h4>{data.technician.eta}</h4>

            </div>

            <div className="stat-card">

              <FiStar />

              <span>Customer Rating</span>

              <h4>{data.technician.rating}</h4>

            </div>

            <div className="stat-card">

              <FiClock />

              <span>Distance Away</span>

              <h4>{data.technician.distance}</h4>

            </div>

            <div className="stat-card">

              <FiPhone />

              <span>Phone Number</span>

              <h4 className="stat-phone">
                {data.technician.phone}
              </h4>

            </div>

          </div>

        </motion.div>

        {/* ===============================
            RIGHT SIDE
        =============================== */}

        <motion.div
          className="timeline-card"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .5 }}
        >

          <div className="timeline">

            {data.timeline.map((item, index) => (

              <motion.div
                key={item.id}
                className={`timeline-item ${
                  item.completed
                    ? "completed"
                    : "pending"
                }`}
                initial={{
                  opacity: 0,
                  x: 30,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.12,
                  duration: .45,
                }}
              >

                <div className="timeline-icon">

                  {item.completed ? (
                    <FiCheckCircle />
                  ) : (
                    <FiClock />
                  )}

                </div>

                <div className="timeline-content">

                  <h4>
                    {item.title}
                  </h4>

                  <span>

                    {item.completed
                      ? "Completed"
                      : "Waiting for update"}

                  </span>

                </div>

              </motion.div>

            ))}

          </div>

        </motion.div>

      </div>

    </motion.section>
  );
};

export default StatusTimeline;