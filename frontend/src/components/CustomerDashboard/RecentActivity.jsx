import { useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiStar,
  FiCreditCard,
  FiX,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";

import "./RecentActivity.css";

const activities = [
  {
    id: 1,
    icon: <FiCheckCircle />,
    title: "AC Repair Completed",
    description:
      "Your AC repair service was completed successfully.",
    time: "Today • 09:45 AM",
    color: "green",
    type: "booking",
  },
  {
    id: 2,
    icon: <FiClock />,
    title: "Booking Confirmed",
    description:
      "Electrician booking has been confirmed.",
    time: "Yesterday • 04:20 PM",
    color: "blue",
    type: "booking",
  },
  {
    id: 3,
    icon: <FiStar />,
    title: "Rating Submitted",
    description:
      "You rated Rahul Sharma 5 stars.",
    time: "24 Jul • 08:15 PM",
    color: "orange",
    type: "review",
  },
  {
    id: 4,
    icon: <FiCreditCard />,
    title: "Payment Successful",
    description:
      "₹1,250 paid using UPI.",
    time: "22 Jul • 11:10 AM",
    color: "purple",
    type: "payment",
  },
];

const RecentActivity = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  return (
    <>
      <section className="recent-activity">

        <div className="activity-header">

          <h2>Recent Activity</h2>

          <p>
            Your latest Fixora updates.
          </p>

        </div>

        <div className="activity-list">

          {activities.map((activity) => (

            <button
              type="button"
              className="activity-card"
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
            >

              <div
                className={`activity-icon ${activity.color}`}
              >
                {activity.icon}
              </div>

              <div className="activity-content">

                <h3>
                  {activity.title}
                </h3>

                <p>
                  {activity.description}
                </p>

                <span>
                  {activity.time}
                </span>

              </div>

              <div className="activity-arrow">
                →
              </div>

            </button>

          ))}

        </div>

      </section>


      {/* =========================================
          ACTIVITY DETAILS MODAL
      ========================================= */}

      {selectedActivity && (
        <div
          className="activity-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="activity-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              className="activity-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <FiX />
            </button>


            <div
              className={`activity-modal-icon ${selectedActivity.color}`}
            >
              {selectedActivity.icon}
            </div>


            <span className="activity-modal-badge">
              Recent Activity
            </span>


            <h2>
              {selectedActivity.title}
            </h2>


            <p className="activity-modal-description">
              {selectedActivity.description}
            </p>


            <div className="activity-modal-info">

              <div className="activity-info-row">

                <FiCalendar />

                <div>
                  <span>Date & Time</span>

                  <strong>
                    {selectedActivity.time}
                  </strong>
                </div>

              </div>


              <div className="activity-info-row">

                <FiInfo />

                <div>
                  <span>Activity Type</span>

                  <strong>
                    {selectedActivity.type === "booking"
                      ? "Booking"
                      : selectedActivity.type === "review"
                      ? "Review"
                      : "Payment"}
                  </strong>
                </div>

              </div>

            </div>


            {selectedActivity.type === "payment" && (
              <div className="activity-coming-soon">
                <FiCreditCard />

                <div>
                  <strong>
                    Online Payment Integration
                  </strong>

                  <span>
                    Payment gateway integration is coming soon.
                  </span>
                </div>
              </div>
            )}


            {selectedActivity.type === "review" && (
              <div className="activity-review-box">

                <div className="activity-stars">
                  <FiStar />
                  <FiStar />
                  <FiStar />
                  <FiStar />
                  <FiStar />
                </div>

                <strong>
                  5.0 Rating
                </strong>

                <span>
                  You rated Rahul Sharma.
                </span>

              </div>
            )}


            <button
              type="button"
              className="activity-modal-button"
              onClick={closeModal}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </>
  );
};

export default RecentActivity;