import { useEffect, useState } from "react";
import {
  FiClipboard,
  FiCheckCircle,
  FiDollarSign,
  FiStar,
} from "react-icons/fi";
import api from "../../api/axios";
import "./TechnicianStats.css";

const TechnicianStats = () => {

  const [stats, setStats] = useState({
    assignedJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  useEffect(() => {

    fetchStats();

  }, []);

  const fetchStats = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats({
        assignedJobs: response.data.assignedJobs,
        completedJobs: response.data.completedJobs,
        totalEarnings: response.data.totalEarnings,
        averageRating:
          response.data.averageRating || 0,
      });

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="tech-stats">

      <div className="tech-stat-card">

        <FiClipboard className="tech-icon" />

        <h3>Assigned Jobs</h3>

        <h2>{stats.assignedJobs}</h2>

      </div>

      <div className="tech-stat-card">

        <FiCheckCircle className="tech-icon" />

        <h3>Completed Jobs</h3>

        <h2>{stats.completedJobs}</h2>

      </div>

      <div className="tech-stat-card">

        <FiDollarSign className="tech-icon" />

        <h3>Total Earnings</h3>

        <h2>₹{stats.totalEarnings}</h2>

      </div>

      <div className="tech-stat-card">

        <FiStar className="tech-icon" />

        <h3>Average Rating</h3>

        <h2>⭐ {stats.averageRating}</h2>

      </div>

    </div>

  );

};

export default TechnicianStats;