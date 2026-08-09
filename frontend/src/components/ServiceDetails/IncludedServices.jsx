import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

import "./IncludedServices.css";

const IncludedServices = ({ service }) => {
  const includedServices =
    service.includedServices && service.includedServices.length > 0
      ? service.includedServices
      : [
          "Professional inspection",
          "Safety check",
          "Basic diagnosis",
          "Transparent pricing",
          "Verified technician",
          "Service warranty",
        ];

  return (
    <section className="included-services">
      <div className="included-container">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="included-header"
        >
          <span className="included-badge">
            WHAT'S INCLUDED
          </span>

          <h2 className="included-title">
            Services Included
          </h2>

          <p className="included-description">
            Every booking includes professional workmanship,
            verified technicians and transparent pricing.
          </p>
        </motion.div>

        <div className="included-grid">
          {includedServices.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
              }}
              whileHover={{ y: -5 }}
              className="included-card"
            >
              <div className="included-icon">
                <FiCheckCircle size={24} />
              </div>

              <p className="included-text">
                {item}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
          className="why-fixora-card"
        >
          <h3 className="why-fixora-title">
            Why Customers Choose Fixora
          </h3>

          <p className="why-fixora-description">
            Every technician is background verified, arrives with
            professional tools and follows Fixora quality standards.
            Enjoy transparent pricing, timely service and dedicated
            customer support with every booking.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default IncludedServices;