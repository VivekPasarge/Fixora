import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiUsers,
  FiStar,
  FiMapPin,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import "./About.css";
import { FiArrowLeft } from "react-icons/fi";

const About = () => {
  return (
    <section
      id="about"
      className="about-section"
    >
      <div className="container">

        {/* Left Side */}

        <motion.div
          className="about-content"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Link to="/" className="back-home-btn">
  <FiArrowLeft />
  <span>Back to Home</span>
</Link>
<br></br>

          <span className="about-tag">
            ABOUT FIXORA
          </span>

          <h2>
            Making Home Services
            <br />
            Simple, Fast & Reliable
          </h2>

          <p>
            Fixora is a modern home service platform that connects
            customers with trusted professionals for electrical,
            plumbing, cleaning, appliance repair, painting and many
            more services. Our goal is to provide quick, reliable
            and affordable solutions at your doorstep.
          </p>

          <div className="about-features">

            <div className="feature-item">
              <FiCheckCircle />
              <span>Verified Professionals</span>
            </div>

            <div className="feature-item">
              <FiCheckCircle />
              <span>Transparent Pricing</span>
            </div>

            <div className="feature-item">
              <FiCheckCircle />
              <span>Fast Service</span>
            </div>

            <div className="feature-item">
              <FiCheckCircle />
              <span>Secure Payments</span>
            </div>
            

          </div>

        </motion.div>

        {/* Right Side */}

        <motion.div
          className="about-stats"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >

          <div className="stat-card">

            <FiUsers />

            <h3>500+</h3>

            <p>Verified Professionals</p>

          </div>

          <div className="stat-card">

            <FiStar />

            <h3>10,000+</h3>

            <p>Completed Bookings</p>

          </div>

          <div className="stat-card">

            <FiMapPin />

            <h3>25+</h3>

            <p>Cities Covered</p>

          </div>

          <div className="stat-card">

            <FiCheckCircle />

            <h3>4.9★</h3>

            <p>Customer Rating</p>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default About;