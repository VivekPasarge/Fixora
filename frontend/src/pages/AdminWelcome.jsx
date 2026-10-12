
import { useNavigate } from "react-router-dom";
import "./AdminWelcome.css";

const AdminWelcome = () => {
  const navigate = useNavigate();

  let adminName = "Admin";

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user?.name) {
      adminName = user.name;
    } else if (user?.fullName) {
      adminName = user.fullName;
    }
  } catch {
    adminName = "Admin";
  }

  return (
    <main className="admin-welcome-page">
      <header className="admin-welcome-navbar">
        <div className="admin-welcome-brand">
          <div className="admin-welcome-logo">F</div>

          <div>
            <span className="admin-brand-name">FIXORA</span>
            <span className="admin-brand-caption">
              ADMINISTRATION
            </span>
          </div>
        </div>

        <div className="admin-welcome-badge">
          <span className="admin-status-dot" />
          ADMINISTRATOR
        </div>
      </header>

      <section className="admin-welcome-hero">
        <div className="admin-welcome-content">
          <span className="admin-welcome-eyebrow">
            YOUR PLATFORM. YOUR COMMAND.
          </span>

          <h1>
            Welcome Back,
            <span>{adminName}.</span>
            Your Platform
            <br />
            Starts Here.
          </h1>

          <p className="admin-welcome-description">
            Manage your professionals, oversee bookings,
            monitor platform performance, and keep Fixora
            running smoothly from one central place.
          </p>

          <button
            type="button"
            className="admin-command-button"
            onClick={() => navigate("/admin-dashboard")}
          >
            Open Admin Command Center
            <span aria-hidden="true">→</span>
          </button>

          <div className="admin-welcome-features">
            <span>✓ Manage Professionals</span>
            <span>▤ Monitor Bookings</span>
            <span>↗ Track Performance</span>
          </div>
        </div>

        <div className="admin-welcome-visual">
          <div className="admin-visual-glow" />

          <div className="admin-visual-orbit orbit-one" />
          <div className="admin-visual-orbit orbit-two" />

          <div className="admin-visual-center">
            <div className="admin-visual-symbol">F</div>
            <span>FIXORA</span>
            <strong>COMMAND CENTER</strong>
          </div>

          <div className="admin-floating-card admin-card-top">
            <span className="admin-floating-icon">▦</span>
            <div>
              <strong>Platform Overview</strong>
              <small>Your operations, organized</small>
            </div>
          </div>

          <div className="admin-floating-card admin-card-bottom">
            <span className="admin-floating-icon">✓</span>
            <div>
              <strong>Full Control</strong>
              <small>One place to manage Fixora</small>
            </div>
          </div>
        </div>
      </section>

      <footer className="admin-welcome-footer">
        <span>FIXORA ADMINISTRATION</span>
        <span>One platform. Complete control.</span>
      </footer>
    </main>
  );
};

export default AdminWelcome;
