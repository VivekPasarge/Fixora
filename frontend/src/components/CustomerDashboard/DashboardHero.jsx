import "./DashboardHero.css";
import { FiSearch, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DashboardHero = () => {
  const navigate = useNavigate();
  return (
    <motion.section
      className="dashboard-hero"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-content">

        <div className="hero-left">

          <span className="welcome-text">
            👋 Welcome Back
          </span>

          <h1 className="hero-title">
            Vivek Pasarge
          </h1>

          <p className="hero-description">
            Manage your bookings, track technicians in real time,
            explore professional services and enjoy a premium home
            service experience with Fixora.
          </p>

          <div className="hero-search">

            <div className="search-box">

              <FiSearch className="search-icon"/>

              <input
                type="text"
                placeholder="Search for plumbing, AC repair..."
              />

            </div>

            <button
  className="book-btn"
  onClick={() => navigate("/services")}
>
  <FiPlus />
  Book Service
</button>
          </div>

        </div>

        <div className="hero-right">

          <div className="profile-card">

            <img
              src="https://ui-avatars.com/api/?name=Vivek+Pasarge&background=2563eb&color=fff&size=256"
              alt="Profile"
            />

            <div className="online-dot"></div>

          </div>

        </div>

      </div>
    </motion.section>
  );
};

export default DashboardHero;