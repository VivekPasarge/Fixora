import "./RecentActivity.css";
import {
  FiCheckCircle,
  FiClock,
  FiStar,
  FiCreditCard,
} from "react-icons/fi";

const activities = [
  {
    id: 1,
    icon: <FiCheckCircle />,
    title: "AC Repair Completed",
    description: "Your AC repair service was completed successfully.",
    time: "Today • 09:45 AM",
    color: "green",
  },
  {
    id: 2,
    icon: <FiClock />,
    title: "Booking Confirmed",
    description: "Electrician booking has been confirmed.",
    time: "Yesterday • 04:20 PM",
    color: "blue",
  },
  {
    id: 3,
    icon: <FiStar />,
    title: "Rating Submitted",
    description: "You rated Rahul Sharma 5 stars.",
    time: "24 Jul • 08:15 PM",
    color: "orange",
  },
  {
    id: 4,
    icon: <FiCreditCard />,
    title: "Payment Successful",
    description: "₹1,250 paid using UPI.",
    time: "22 Jul • 11:10 AM",
    color: "purple",
  },
];

const RecentActivity = () => {
  return (
    <section className="recent-activity">

      <div className="activity-header">

        <h2>Recent Activity</h2>

        <p>Your latest Fixora updates.</p>

      </div>

      <div className="activity-list">

        {activities.map((activity) => (

          <div
            className="activity-card"
            key={activity.id}
          >

            <div className={`activity-icon ${activity.color}`}>

              {activity.icon}

            </div>

            <div className="activity-content">

              <h3>{activity.title}</h3>

              <p>{activity.description}</p>

              <span>{activity.time}</span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default RecentActivity;