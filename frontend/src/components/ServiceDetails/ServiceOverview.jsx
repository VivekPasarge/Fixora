
import { motion } from "framer-motion";
import { FiAward, FiShield, FiTool } from "react-icons/fi";

import "./ServiceOverview.css";

const defaultBenefits = [
  {
    title: "Verified Professionals",
    description: "Background-verified technicians.",
    icon: FiShield,
  },
  {
    title: "Quality Service",
    description: "Professional tools and workmanship.",
    icon: FiTool,
  },
  {
    title: "Customer Satisfaction",
    description: "Reliable service and clear pricing.",
    icon: FiAward,
  },
];

const ServiceOverview = ({ service }) => {
  const benefits =
    Array.isArray(service.whyChoose) &&
    service.whyChoose.length > 0
      ? service.whyChoose.slice(0, 3)
      : defaultBenefits;

  return (
    <section className="service-overview-panel">
      <div className="overview-panel-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overview-intro"
        >
          <span className="overview-badge">
            ABOUT THIS SERVICE
          </span>

          <h2 className="overview-title">
            Professional {service.name} Services
          </h2>

          <p className="overview-description">
            {service.description ||
              `Book trusted professionals for your ${service.name.toLowerCase()} needs with Fixora.`}
          </p>
        </motion.div>

        <div className="overview-benefits">
          {benefits.map((item, index) => {
            const Icon = item.icon || FiShield;

            return (
              <motion.div
                key={item.title || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
                className="overview-benefit"
              >
                <div className="overview-benefit-icon">
                  <Icon size={21} />
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
