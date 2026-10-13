
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiWind,
  FiTool,
  FiDroplet,
  FiZap,
  FiCheck,
} from "react-icons/fi";

import "./FixoraWelcome.css";

const FixoraWelcome = () => {
  const navigate = useNavigate();

  const services = [
    { label: "AC Repair", icon: <FiWind /> },
    { label: "Home Repairs", icon: <FiTool /> },
    { label: "Plumbing", icon: <FiDroplet /> },
    { label: "Electrical", icon: <FiZap /> },
    { label: "Cleaning", icon: <FiCheck /> },
  ];

  return (
    <main className="fixora-splash">
      <div className="fixora-splash-background" />
      <div className="fixora-splash-overlay" />

      <section className="fixora-splash-content">
        <p className="fixora-splash-eyebrow">WELCOME TO</p>

        <div className="fixora-splash-logo" aria-label="Fixora">
          <svg
            className="fixora-splash-roof"
            viewBox="0 0 120 76"
            aria-hidden="true"
          >
            <path
              d="M8 65 L60 10 L112 65"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="43" y="39" width="12" height="12" rx="2" fill="currentColor" />
            <rect x="62" y="39" width="12" height="12" rx="2" fill="currentColor" />
            <rect x="43" y="56" width="12" height="10" rx="2" fill="currentColor" />
            <rect x="62" y="56" width="12" height="10" rx="2" fill="currentColor" />
          </svg>

          <span>fixora<span className="fixora-logo-dot">.</span></span>
        </div>

        <h1 className="fixora-splash-tagline">
          YOUR HOME. OUR CARE.
        </h1>

        <div className="fixora-splash-divider" />

        <p className="fixora-splash-description">
          Trusted professionals for all your home services.
          <br />
          Book. Track. Relax.
        </p>

        <button
          type="button"
          className="fixora-splash-login"
          onClick={() => navigate("/login")}
        >
          <span className="fixora-splash-arrow">
            <FiArrowRight />
          </span>
          <span>Please Login to Continue</span>
        </button>

        <p className="fixora-splash-caption">
          SAME HOME. HAPPIER DAYS.
        </p>
      </section>

      <div className="fixora-splash-services" aria-label="Available services">
        {services.map((service) => (
          <div
            className="fixora-splash-service"
            key={service.label}
            title={service.label}
            aria-label={service.label}
          >
            {service.icon}
          </div>
        ))}
      </div>
    </main>
  );
};

export default FixoraWelcome;
