
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiGrid } from "react-icons/fi";

import AssignedJobs from "../components/TechnicianDashboard/AssignedJobs";
import "./TechnicianTrack.css";

const TechnicianTrack = () => {
  const navigate = useNavigate();

  return (
    <main className="technician-track-page">
      <header className="technician-track-header">
        <button
          type="button"
          className="track-back-btn"
          onClick={() => navigate("/technician-home")}
        >
          <FiArrowLeft />
          Home
        </button>

        <div className="track-page-brand">
          <span className="track-brand-mark">F</span>
          <span>FIXORA</span>
        </div>

        <button
          type="button"
          className="track-dashboard-btn"
          onClick={() => navigate("/technician-dashboard")}
        >
          <FiGrid />
          Dashboard
        </button>
      </header>

      <section className="technician-track-intro">
        <span className="track-eyebrow">WORK MANAGEMENT</span>
        <h1>Track Your Jobs</h1>
        <p>
          View assigned service requests, customer addresses,
          job progress and available tracking information.
        </p>
      </section>

      <section className="technician-track-content">
        <AssignedJobs />
      </section>
    </main>
  );
};

export default TechnicianTrack;
