import "./TechnicianDashboard.css";

import DashboardHero from "../components/TechnicianDashboard/DashboardHero";
import ActiveJob from "../components/TechnicianDashboard/ActiveJob";
import TodaySchedule from "../components/TechnicianDashboard/TodaySchedule";
import EarningsCard from "../components/TechnicianDashboard/EarningsCard";
import AvailabilityCard from "../components/TechnicianDashboard/AvailabilityCard";
import ReviewsCard from "../components/TechnicianDashboard/ReviewsCard";
import WalletCard from "../components/TechnicianDashboard/WalletCard";
import AvailableJobs from "../components/TechnicianDashboard/AvailableJobs";
import AssignedJobs from "../components/TechnicianDashboard/AssignedJobs";
import TechnicianStats from "../components/TechnicianDashboard/TechnicianStats";

const TechnicianDashboard = () => {
  return (
    <main className="technician-dashboard">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="tech-hero">
        <DashboardHero />
      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="tech-stats">
        <TechnicianStats />
      </section>


      {/* =====================================================
          MAIN WORK AREA
      ===================================================== */}

      <section className="tech-main-grid">

        {/* ================================================
            ACTIVE JOB
        ================================================ */}

        <div
          id="active-job"
          className="tech-card-area tech-active-job"
        >
          <ActiveJob />
        </div>


        {/* ================================================
            AVAILABILITY
        ================================================ */}

        <div className="tech-card-area tech-availability">

          <AvailabilityCard />

        </div>


        {/* ================================================
            TODAY'S SCHEDULE
        ================================================ */}

        <div className="tech-card-area">

          <TodaySchedule />

        </div>


        {/* ================================================
            EARNINGS
        ================================================ */}

        <div
          id="earnings"
          className="tech-card-area"
        >

          <EarningsCard />

        </div>

      </section>


      {/* =====================================================
          JOB MANAGEMENT
      ===================================================== */}

      <section className="tech-section-heading">

        <div>

          <span>
            WORK MANAGEMENT
          </span>

          <h2>
            Your Jobs
          </h2>

          <p>
            Find new service requests and manage your assigned work.
          </p>

        </div>

      </section>


      <section className="tech-jobs-grid">

        {/* ================================================
            AVAILABLE JOBS
        ================================================ */}

        <div
          id="available-jobs"
          className="tech-card-area"
        >

          <AvailableJobs />

        </div>


        {/* ================================================
            WALLET
        ================================================ */}

        <div className="tech-card-area">

          <WalletCard />

        </div>

      </section>


      {/* =====================================================
          ASSIGNED JOBS
      ===================================================== */}

      <section
        id="assigned-jobs"
        className="tech-full-section"
      >
<AvailableJobs />
       <section
  id="assigned-jobs"
  className="tech-full-section"
>
  <AssignedJobs />
</section>

      </section>


      {/* =====================================================
          REVIEWS
      ===================================================== */}

      <section className="tech-full-section">

        <ReviewsCard />

      </section>

    </main>
  );
};

export default TechnicianDashboard;