import "./StatsCards.css";
import {
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

const stats = [
  {
    id: 1,
    value: "03",
    title: "Active Bookings",
    icon: <FiCalendar />,
    color: "blue",
  },
  {
    id: 2,
    value: "28",
    title: "Completed Services",
    icon: <FiCheckCircle />,
    color: "green",
  },
  {
    id: 3,
    value: "04",
    title: "Saved Addresses",
    icon: <FiMapPin />,
    color: "orange",
  },
  {
    id: 4,
    value: "₹18,450",
    title: "Total Spent",
    icon: <FiCreditCard />,
    color: "purple",
  },
];

const StatsCards = () => {
  return (
    <section className="stats-section">

      <div className="stats-grid">

        {stats.map((item) => (

          <div
            key={item.id}
            className={`stats-card ${item.color}`}
          >

            <div className="stats-top">

              <div className="stats-icon">

                {item.icon}

              </div>

              <span className="stats-number">

                {item.value}

              </span>

            </div>

            <p className="stats-title">

              {item.title}

            </p>

          </div>

        ))}

      </div>

    </section>
  );
};

export default StatsCards;