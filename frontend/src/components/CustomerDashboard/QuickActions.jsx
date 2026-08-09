import "./QuickActions.css";
import {
  FiPlusCircle,
  FiClipboard,
  FiCreditCard,
  FiHeadphones,
} from "react-icons/fi";

const actions = [
  {
    id: 1,
    title: "Book Service",
    description: "Schedule a new home service.",
    icon: <FiPlusCircle />,
    color: "blue",
  },
  {
    id: 2,
    title: "My Bookings",
    description: "View all current and past bookings.",
    icon: <FiClipboard />,
    color: "green",
  },
  {
    id: 3,
    title: "Payments",
    description: "Manage invoices and payment history.",
    icon: <FiCreditCard />,
    color: "orange",
  },
  {
    id: 4,
    title: "Support",
    description: "Need help? Contact our support team.",
    icon: <FiHeadphones />,
    color: "purple",
  },
];

const QuickActions = () => {
  return (
    <section className="quick-actions">

      <div className="section-heading">
        <h2>Quick Actions</h2>
        <p>Access your most-used features with one click.</p>
      </div>

      <div className="actions-grid">

        {actions.map((action) => (

          <div
            key={action.id}
            className={`action-card ${action.color}`}
          >

            <div className="action-icon">
              {action.icon}
            </div>

            <h3>{action.title}</h3>

            <p>{action.description}</p>

            <button>
              Open
            </button>

          </div>

        ))}

      </div>

    </section>
  );
};

export default QuickActions;