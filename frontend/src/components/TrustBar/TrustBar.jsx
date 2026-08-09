import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiShield,
  FiClock,
  FiStar,
  FiCreditCard,
} from "react-icons/fi";

import "./TrustBar.css";

const features = [
  {
    icon: <FiShield />,
    title: "Verified Experts",
    subtitle: "100% Background Checked",
  },
  {
    icon: <FiClock />,
    title: "Fast Arrival",
    subtitle: "Reach in 15–30 Minutes",
  },
  {
    icon: <FiStar />,
    title: "Top Rated",
    subtitle: "4.9★ From 20K+ Reviews",
  },
  {
    icon: <FiCreditCard />,
    title: "Secure Payments",
    subtitle: "100% Safe Transactions",
  },
  {
    icon: <FiCheckCircle />,
    title: "Happy Customers",
    subtitle: "10,000+ Successful Bookings",
  },
];

const TrustBar = () => {
  return (
    <section className="trust-bar">
      <div className="trust-container">
        <div className="trust-grid">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              className="trust-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.12,
                duration: 0.45,
              }}
              whileHover={{
                y: -8,
              }}
            >
              <div className="trust-icon">
                {item.icon}
              </div>

              <div className="trust-content">
                <h3 className="trust-title">
                  {item.title}
                </h3>

                <p className="trust-subtitle">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;