
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiStar,
  FiCreditCard,
} from "react-icons/fi";
import "./TechnicianHome.css";

const TechnicianHome = () => {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const name = user.name?.trim()?.split(" ")[0] || "Professional";

  const openDashboardSection = (section) => {
    navigate({
      pathname: "/technician-dashboard",
      search: "",
      hash: `#${section}`,
    }, {
      state: {
        scrollToSection: section,
        navigationTime: Date.now(),
      },
    });
  };

  return (
    <main className="technician-home">
      <header className="technician-home-nav">
        <button
          type="button"
          className="technician-home-logo"
          onClick={() => navigate("/technician-home")}
          aria-label="Fixora Technician Home"
        >
          <span className="fixora-mark">F</span>
          <span>
            FIXORA
            <small>PROFESSIONAL PARTNER</small>
          </span>
        </button>

        <nav className="technician-home-links">
          <button
            type="button"
            className="technician-nav-active"
            onClick={() => navigate("/technician-home")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => openDashboardSection("/technician-track")}
          >
            Track
          </button>

          <button
            type="button"
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>
        </nav>

        <button
          type="button"
          className="technician-account-btn"
          onClick={() => navigate("/technician-profile")}
        >
          <span>{name}</span>
          <span className="technician-account-arrow">⌄</span>
        </button>
      </header>

      <section className="technician-home-hero">
        <div className="technician-home-copy">
          <span className="technician-home-eyebrow">
            YOUR SKILLS. YOUR GROWTH.
          </span>

          <h1>
            Welcome Back,
            <br />
            <span>{name}.</span>
            <br />
            Your Next Job
            <br />
            Starts Here.
          </h1>

          <p>
            Manage service requests, stay on top of your bookings,
            and grow your home-service business with Fixora.
          </p>

          <div className="technician-home-actions">
            <button
              type="button"
              className="technician-primary-btn"
              onClick={() => openDashboardSection("/available-jobs")}
            >
              Find Jobs <FiArrowRight />
            </button>

            <button
              type="button"
              className="technician-secondary-btn"
              onClick={() => navigate("/technician-dashboard")}
            >
              Open Dashboard
            </button>
          </div>

          <div className="technician-home-trust">
            <div>
              <FiCheckCircle />
              <span>Manage your jobs</span>
            </div>

            <div>
              <FiCreditCard />
              <span>Track your earnings</span>
            </div>

            <div>
              <FiStar />
              <span>Build your reputation</span>
            </div>
          </div>
        </div>

        <div className="technician-home-visual">
          <img
            src="/technician-hero.png"
            alt="Fixora home service technician ready for work"
          />

          <div className="technician-floating-card technician-card-top">
            <span className="technician-floating-icon">
              <FiBriefcase />
            </span>
            <span>
              <strong>Job Opportunities</strong>
              <small>Find service requests</small>
            </span>
          </div>

          <div className="technician-floating-card technician-card-bottom">
            <span className="technician-floating-icon technician-green">
              <FiCheckCircle />
            </span>
            <span>
              <strong>Work with Confidence</strong>
              <small>Manage jobs in one place</small>
            </span>
          </div>
        </div>
      </section>

      <section className="technician-home-shortcuts">
        <button
          type="button"
          className="technician-shortcut"
          onClick={() => openDashboardSection("available-jobs")}
        >
          <span className="technician-shortcut-icon">
            <FiBriefcase />
          </span>
          <span>
            <strong>Available Jobs</strong>
            <small>Explore new requests</small>
          </span>
          <FiArrowRight className="technician-shortcut-arrow" />
        </button>

        <button
          type="button"
          className="technician-shortcut"
          onClick={() => openDashboardSection("assigned-jobs")}
        >
          <span className="technician-shortcut-icon">
            <FiCalendar />
          </span>
          <span>
            <strong>My Assigned Jobs</strong>
            <small>Manage your work</small>
          </span>
          <FiArrowRight className="technician-shortcut-arrow" />
        </button>

        <button
          type="button"
          className="technician-shortcut"
          onClick={() => navigate("/technician/wallet")}
        >
          <span className="technician-shortcut-icon">
            <FiCreditCard />
          </span>
          <span>
            <strong>My Earnings</strong>
            <small>View wallet and transactions</small>
          </span>
          <FiArrowRight className="technician-shortcut-arrow" />
        </button>

        <button
          type="button"
          className="technician-shortcut"
          onClick={() => openDashboardSection("active-job")}
        >
          <span className="technician-shortcut-icon">
            <FiMapPin />
          </span>
          <span>
            <strong>Active Job</strong>
            <small>View current work</small>
          </span>
          <FiArrowRight className="technician-shortcut-arrow" />
        </button>
      </section>

      <footer className="technician-home-footer">
        <span>FIXORA</span>
        <p>Your skills make a difference.</p>
        <button
          type="button"
          onClick={() => navigate("/contact")}
        >
          Contact Support
        </button>
      </footer>
    </main>
  );
};

export default TechnicianHome;
