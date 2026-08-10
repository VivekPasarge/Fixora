import "./DashboardHero.css";
import {
  FiSearch,
  FiPlus,
  FiShield,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DashboardHero = () => {
  const navigate = useNavigate();

  /* =========================================================
     TIME-BASED GREETING
  ========================================================= */

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  return (
    <motion.section
      className="dashboard-hero"
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="hero-content">

        {/* =====================================================
            LEFT CONTENT
        ===================================================== */}

        <div className="hero-left">

          {/* Greeting */}

          <div className="welcome-text">

            <span>👋</span>

            <span>
              {getGreeting()}, Vivek
            </span>

          </div>


          {/* Title */}

          <h1 className="hero-title">
            What can we help you with today?
          </h1>


          {/* Description */}

          <p className="hero-description">
            Book trusted professionals for your home
            services and track your technician in real time.
          </p>


          {/* ===================================================
              SEARCH + BOOK BUTTON
          =================================================== */}

          <div className="hero-search">

            <div className="search-box">

              <FiSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search for plumbing, AC repair..."
              />

            </div>


            <button
              type="button"
              className="book-btn"
              onClick={() => navigate("/services")}
            >

              <FiPlus />

              <span>
                Book Service
              </span>

            </button>

          </div>


          {/* ===================================================
              TRUST FEATURES
          =================================================== */}

          <div className="hero-features">

            <div className="hero-feature">

              <FiCheckCircle />

              <span>
                Verified Professionals
              </span>

            </div>


            <div className="hero-feature">

              <FiClock />

              <span>
                Quick Service
              </span>

            </div>


            <div className="hero-feature">

              <FiShield />

              <span>
                Secure Booking
              </span>

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT PROFILE
        ===================================================== */}

        <div className="hero-right">

          <div className="profile-card">

            <img
              src="https://ui-avatars.com/api/?name=Vivek+Pasarge&background=2563eb&color=fff&size=256"
              alt="Vivek Pasarge"
            />

            <div className="online-dot"></div>

          </div>


          <div className="profile-status">

            <span className="status-dot"></span>

            Available now

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default DashboardHero;