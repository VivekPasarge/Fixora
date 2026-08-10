import { useState } from "react";
import "./QuickActions.css";
import {
  FiPlusCircle,
  FiClipboard,
  FiCreditCard,
  FiHeadphones,
  FiX,
  FiClock,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    id: 1,
    title: "Book Service",
    description: "Schedule a new home service.",
    icon: <FiPlusCircle />,
    color: "blue",
    path: "/services",
  },
  {
    id: 2,
    title: "My Bookings",
    description: "View all current and past bookings.",
    icon: <FiClipboard />,
    color: "green",
    path: "/my-bookings",
  },
  {
    id: 3,
    title: "Payments",
    description: "Manage invoices and payment history.",
    icon: <FiCreditCard />,
    color: "orange",
    isComingSoon: true,
  },
  {
    id: 4,
    title: "Support",
    description: "Need help? Contact our support team.",
    icon: <FiHeadphones />,
    color: "purple",
    path: "/contact",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleAction = (action) => {
    if (action.isComingSoon) {
      setShowPaymentModal(true);
      return;
    }

    navigate(action.path);
  };

  return (
    <>
      <section className="quick-actions">

        <div className="section-heading">
          <h2>Quick Actions</h2>

          <p>
            Access your most-used features with one click.
          </p>
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

              <button
                type="button"
                onClick={() => handleAction(action)}
              >
                {action.isComingSoon ? "Coming Soon" : "Open"}
              </button>

            </div>

          ))}

        </div>

      </section>

      {showPaymentModal && (
        <div
          className="payment-modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >

          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="payment-modal-close"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className="payment-modal-icon">
              <FiCreditCard />
            </div>

            <span className="payment-coming-badge">
              Coming Soon
            </span>

            <h2>
              Payments Are Coming Soon
            </h2>

            <p>
              We are currently working on secure online payment
              integration for Fixora.
            </p>

            <div className="payment-features">

              <div className="payment-feature">
                <div className="payment-feature-icon">
                  <FiShield />
                </div>

                <div>
                  <strong>Secure Payments</strong>
                  <span>
                    Safe and protected transactions
                  </span>
                </div>
              </div>

              <div className="payment-feature">
                <div className="payment-feature-icon">
                  <FiClock />
                </div>

                <div>
                  <strong>Coming Soon</strong>
                  <span>
                    Online payment options are being prepared
                  </span>
                </div>
              </div>

            </div>

            <button
              type="button"
              className="payment-modal-button"
              onClick={() => setShowPaymentModal(false)}
            >
              Got It
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default QuickActions;