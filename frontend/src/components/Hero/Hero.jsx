import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import heroImage from "../../assets/hero/hero.png";

import SearchCard from "./SearchCard";

import "./Hero.css";
import "./SearchCard.css";
import "./FloatingCards.css";

const Hero = () => {
  return (
    <section className="hero">

      {/* =====================================================
          HERO BACKGROUND
      ===================================================== */}

      <div className="hero-bg">
        <div className="hero-gradient"></div>

        <div className="hero-glow-left"></div>

        <div className="hero-glow-right"></div>
      </div>


      {/* =====================================================
          HERO CONTAINER
      ===================================================== */}

      <div className="container hero-container">

        <div className="hero-grid">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <motion.div
            className="hero-left"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            {/* Badge */}

            <span className="hero-badge">
              PROFESSIONAL HOME SERVICES
            </span>


            {/* Heading */}

            <h1 className="hero-title">
              Smart Home

              <span className="hero-highlight">
                Services
              </span>

              You Can Trust.
            </h1>


            {/* Description */}

            <p className="hero-text">
              Verified professionals for repairs,
              maintenance, installation and cleaning.
              Book trusted experts in minutes and
              enjoy safe, fast and reliable home
              services across your city.
            </p>


            {/* Buttons */}

            <div className="hero-buttons">

              <Link
                to="/services"
                className="btn btn-primary btn-lg"
              >
                Book Service
              </Link>


              <Link
                to="/services"
                className="btn btn-secondary btn-lg"
              >
                Explore Services
              </Link>

            </div>


            {/* Search Card */}

            <div className="hero-search">
              <SearchCard />
            </div>


            {/* =================================================
                HERO STATS
                Currently disabled
            ================================================= */}

            {/*
            <div className="hero-stats">

              {heroStats.map((item) => (

                <motion.div
                  key={item.id}
                  className="stat-card"

                  whileHover={{
                    y: -8,
                    scale: 1.03,
                  }}

                  transition={{
                    duration: 0.25,
                  }}
                >

                  <h2 className="stat-number">
                    {item.number}
                  </h2>

                  <p className="stat-title">
                    {item.title}
                  </p>

                </motion.div>

              ))}

            </div>
            */}

          </motion.div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            {/* Image Glow */}

            <div className="image-glow"></div>


            {/* Main Hero Image */}

            <img
              src={heroImage}
              alt="Professional Fixora Technician"
              className="hero-main-image"
            />


            {/* =================================================
                FLOATING CARDS
                Currently disabled
            ================================================= */}

            {/*
            <FloatingCards />
            */}

          </motion.div>

        </div>


        {/* =====================================================
            TRUST STRIP
            Currently disabled
        ===================================================== */}

        {/*
        <motion.div
          className="trust-wrapper"

          initial={{
            opacity: 0,
            y: 40,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.45,
            duration: 0.7,
          }}
        >

          <div className="trust-strip">

            <div className="trust-item">
              <h3>✔</h3>
              <p>Verified Experts</p>
            </div>

            <div className="trust-item">
              <h3>⚡</h3>
              <p>Fast Booking</p>
            </div>

            <div className="trust-item">
              <h3>⭐</h3>
              <p>4.9 Customer Rating</p>
            </div>

            <div className="trust-item">
              <h3>🛡️</h3>
              <p>Secure Payments</p>
            </div>

          </div>

        </motion.div>
        */}

      </div>

    </section>
  );
};

export default Hero;