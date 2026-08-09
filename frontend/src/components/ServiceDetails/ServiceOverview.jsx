import { motion } from "framer-motion";
import { FiAward, FiShield, FiTool } from "react-icons/fi";

import "./ServiceOverview.css";

const ServiceOverview = ({ service }) => {
  const whyChoose =
    service.whyChoose && service.whyChoose.length > 0
      ? service.whyChoose
      : [
          {
            title: "Verified Professionals",
            description:
              "Every technician is background verified before joining Fixora.",
            icon: FiShield,
          },
          {
            title: "Quality Service",
            description:
              "Professional tools and industry-standard workmanship.",
            icon: FiTool,
          },
          {
            title: "Customer Satisfaction",
            description:
              "Transparent pricing and dedicated customer support.",
            icon: FiAward,
          },
        ];

  return (
    <section className="service-overview">
      <div className="overview-container">

        <div className="overview-grid">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overview-left"
          >
            <span className="overview-badge">
              ABOUT SERVICE
            </span>

            <h2 className="overview-title">
              Professional {service.name} Services
            </h2>

            <p className="overview-description">
              {service.description}
            </p>

            <p className="overview-description">
              Every Fixora professional is background verified,
              highly trained and equipped with professional tools.
              We focus on transparent pricing, punctual arrival,
              and high-quality workmanship for every booking.
            </p>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.15,
              duration: 0.6,
            }}
            className="overview-cards"
          >
            {whyChoose.map((item, index) => {
              const Icon = item.icon || FiShield;

              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                  className="overview-card"
                >
                  <div className="overview-icon">
                    <Icon size={30} />
                  </div>

                  <h3 className="overview-card-title">
                    {item.title}
                  </h3>

                  <p className="overview-card-description">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;