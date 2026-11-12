
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUsers,
  FiStar,
  FiShield,
  FiZap,
} from "react-icons/fi";

import "./About.css";

const getDashboardPath = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.role) {
      return "/login";
    }

    switch (String(user.role).toLowerCase()) {
      case "customer":
        return "/customer-dashboard";

      case "technician":
        return user.profileCompleted
          ? "/technician-dashboard"
          : "/complete-profile";

      case "admin":
        return "/admin-dashboard";

      default:
        return "/login";
    }
  } catch {
    return "/login";
  }
};

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiUsers />,
      number: "500+",
      label: "Verified Professionals",
    },
    {
      icon: <FiStar />,
      number: "10,000+",
      label: "Completed Bookings",
    },
  ];

  const benefits = [
    "Verified Professionals",
    "Transparent Pricing",
    "Fast Service",
    "Secure Payments",
  ];

  return (
    <main className="about-page">
      <div className="about-container">

        <button
          type="button"
          className="about-back-button"
          onClick={() => navigate(getDashboardPath())}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <section className="about-intro">
          <span className="about-label">ABOUT FIXORA</span>

          <h1>
            Making Home Services
            <br />
            Simple, Fast & Reliable
          </h1>

          <p>
            Fixora is a modern home service platform that connects
            customers with trusted professionals for electrical,
            plumbing, cleaning, appliance repair, painting and many
            more services. Our goal is to provide quick, reliable
            and affordable solutions at your doorstep.
          </p>

          <div className="about-benefits">
            {benefits.map((benefit) => (
              <div key={benefit} className="about-benefit">
                <FiCheckCircle />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-stats">
          {features.map((feature) => (
            <article className="about-stat-card" key={feature.label}>
              <div className="about-stat-icon">
                {feature.icon}
              </div>

              <h2>{feature.number}</h2>
              <p>{feature.label}</p>
            </article>
          ))}
        </section>

        <section className="about-mission">
          <div className="about-mission-icon">
            <FiShield />
          </div>

          <div>
            <h2>Our Mission</h2>
            <p>
              To make home maintenance simple by bringing reliable
              professionals and convenient booking experiences
              together on one platform.
            </p>
          </div>
        </section>

        <section className="about-vision">
          <div className="about-vision-icon">
            <FiZap />
          </div>

          <div>
            <h2>Our Vision</h2>
            <p>
              To become a trusted destination for home services,
              creating a better experience for customers and
              service professionals.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
};

export default About;
