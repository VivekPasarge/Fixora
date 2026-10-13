
import "./StatsCards.css";
import {
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

const ACTIVE_STATUSES = [
  "pending",
  "accepted",
  "confirmed",
  "on the way",
  "in progress",
  "in-progress",
];

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getAmount = (booking) =>
  Number(booking?.price ?? booking?.totalAmount ?? booking?.amount ?? 0) || 0;

const getSavedAddressCount = (profile) => {
  const addresses =
    profile?.savedAddresses ??
    profile?.addresses ??
    profile?.address;

  if (Array.isArray(addresses)) {
    return addresses.length;
  }

  // A single address object/string counts as one saved address.
  if (addresses && typeof addresses === "object") {
    return 1;
  }

  if (typeof addresses === "string" && addresses.trim()) {
    return 1;
  }

  return 0;
};

const StatsCards = ({ profile, bookings = [] }) => {
  const activeCount = bookings.filter((booking) =>
    ACTIVE_STATUSES.includes(normalizeStatus(booking.status))
  ).length;

  const completedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  );

  const completedCount = completedBookings.length;

  const savedAddressCount = getSavedAddressCount(profile);

  const totalSpent = completedBookings.reduce((total, booking) => {
    const paymentStatus = normalizeStatus(booking.paymentStatus);

    // Count only completed bookings with confirmed payment.
    if (paymentStatus !== "paid") {
      return total;
    }

    return total + getAmount(booking);
  }, 0);

  const stats = [
    {
      id: 1,
      value: String(activeCount).padStart(2, "0"),
      title: "Active Bookings",
      icon: <FiCalendar />,
      color: "blue",
    },
    {
      id: 2,
      value: String(completedCount).padStart(2, "0"),
      title: "Completed Services",
      icon: <FiCheckCircle />,
      color: "green",
    },
    {
      id: 3,
      value: String(savedAddressCount).padStart(2, "0"),
      title: "Saved Addresses",
      icon: <FiMapPin />,
      color: "orange",
    },
    {
      id: 4,
      value: totalSpent.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
      title: "Total Spent",
      icon: <FiCreditCard />,
      color: "purple",
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`stats-card ${item.color}`}
          >
            <div className="stats-top">
              <div className="stats-icon">{item.icon}</div>
              <span className="stats-number">{item.value}</span>
            </div>
            <p className="stats-title">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsCards;
