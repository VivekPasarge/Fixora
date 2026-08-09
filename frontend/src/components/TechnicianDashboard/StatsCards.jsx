import { motion } from "framer-motion";
import {
  FiTool,
  FiCheckCircle,
  FiDollarSign,
  FiStar,
} from "react-icons/fi";

import "./StatsCards.css";

const stats = [
  {
    id: 1,
    title: "Today's Jobs",
    value: "08",
    icon: <FiTool />,
    color: "blue",
  },
  {
    id: 2,
    title: "Completed Jobs",
    value: "126",
    icon: <FiCheckCircle />,
    color: "green",
  },
  {
    id: 3,
    title: "Today's Earnings",
    value: "₹3,850",
    icon: <FiDollarSign />,
    color: "yellow",
  },
  {
    id: 4,
    title: "Rating",
    value: "4.9 ★",
    icon: <FiStar />,
    color: "purple",
  },
];

const StatsCards = () => {
  return (
    <section className="stats-section">

      <div className="stats-grid">

        {stats.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -8,
              scale: 1.03,
            }}
            className="stats-card"
          >
            <div className={`stats-icon ${item.color}`}>
              {item.icon}
            </div>

            <h2 className="stats-value">
              {item.value}
            </h2>

            <p className="stats-title">
              {item.title}
            </p>

          </motion.div>
        ))}

      </div>

    </section>
  );
};

export default StatsCards;