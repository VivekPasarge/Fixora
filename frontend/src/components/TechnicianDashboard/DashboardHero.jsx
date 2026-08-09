import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiPower } from "react-icons/fi";

import "./DashboardHero.css";

const DashboardHero = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userName = user?.name || "User";

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-hero"
    >
      <div className="dashboard-content">

        {/* LEFT SIDE */}
        <div className="dashboard-left">

          <p className="dashboard-welcome">
            Welcome Back 👋
          </p>

          <h1 className="dashboard-name">
            {userName}
          </h1>

          <p className="dashboard-description">
            Manage today's bookings, accept new jobs, navigate to customers,
            and track your earnings from one place.
          </p>

          <div className="dashboard-buttons">

            <button className="dashboard-primary-btn">
              View Today's Jobs
            </button>

            <button className="dashboard-secondary-btn">
              <FiMapPin />
              Open Navigation
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="dashboard-right">

          <div className="dashboard-avatar">

            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName
              )}&background=2563eb&color=fff&size=220`}
              alt={userName}
              className="dashboard-avatar-image"
            />

          </div>

          <div className="dashboard-status">

            <FiPower />

            Online

          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default DashboardHero;