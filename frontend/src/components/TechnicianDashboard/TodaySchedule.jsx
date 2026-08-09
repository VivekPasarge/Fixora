import { motion } from "framer-motion";
import { FiClock, FiMapPin, FiChevronRight } from "react-icons/fi";

import "./TodaySchedule.css";

const jobs = [
  {
    id: 1,
    time: "09:00 AM",
    service: "AC Repair",
    customer: "Vivek Pasarge",
    location: "MG Road",
    status: "Completed",
  },
  {
    id: 2,
    time: "11:30 AM",
    service: "Washing Machine Repair",
    customer: "Rahul Kumar",
    location: "Indiranagar",
    status: "Active",
  },
  {
    id: 3,
    time: "03:00 PM",
    service: "Electrical Inspection",
    customer: "Priya Sharma",
    location: "Whitefield",
    status: "Upcoming",
  },
];

const TodaySchedule = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="schedule-card"
    >
      <h2 className="schedule-title">
        Today's Schedule
      </h2>

      <p className="schedule-subtitle">
        Your assigned jobs for today.
      </p>

      <div className="schedule-list">

        {jobs.map((job) => (
          <div
            key={job.id}
            className="schedule-item"
          >
            <div className="schedule-item-header">

              <div>

                <h3 className="schedule-service">
                  {job.service}
                </h3>

                <p className="schedule-customer">
                  {job.customer}
                </p>

                <div className="schedule-info">
                  <FiClock />
                  <span>{job.time}</span>
                </div>

                <div className="schedule-info">
                  <FiMapPin />
                  <span>{job.location}</span>
                </div>

              </div>

              <div className="schedule-right">

                <span className={`schedule-status ${job.status.toLowerCase()}`}>
                  {job.status}
                </span>

                <button className="details-btn">
                  Details
                  <FiChevronRight />
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </motion.div>
  );
};

export default TodaySchedule;