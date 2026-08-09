import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import ServiceCard from "./ServiceCard";
import services from "./servicesData";

import "./Services.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const Services = () => {
  return (
    <section id="services" className="services-section">

      {/* Background */}
      <div className="services-bg services-bg-left"></div>
      <div className="services-bg services-bg-right"></div>

      <div className="services-container">

        {/* Heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="services-header"
        >
          <span className="services-badge">
            OUR SERVICES
          </span>

          <h2 className="services-title">
            Everything Your Home Needs,
            <span className="services-title-blue">
              All in One Place
            </span>
          </h2>

          <p className="services-description">
            Book trusted professionals for repairs, maintenance, cleaning,
            installations, and more. Every technician is verified, highly
            rated, and ready to help.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="services-grid"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.2,
          }}
          className="services-button-wrapper"
        >
          <Link
            to="/services"
            className="services-button"
          >
            View All Services

            <FiArrowRight className="services-button-icon" />
          </Link>
        </motion.div>

      </div>

    </section>
  );
};

export default Services;