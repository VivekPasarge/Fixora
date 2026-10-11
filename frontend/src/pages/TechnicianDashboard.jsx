
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import DashboardHero from "../components/TechnicianDashboard/DashboardHero";
import TechnicianStats from "../components/TechnicianDashboard/TechnicianStats";
import ActiveJob from "../components/TechnicianDashboard/ActiveJob";
import TodaySchedule from "../components/TechnicianDashboard/TodaySchedule";
import EarningsCard from "../components/TechnicianDashboard/EarningsCard";
import AvailabilityCard from "../components/TechnicianDashboard/AvailabilityCard";
import ReviewsCard from "../components/TechnicianDashboard/ReviewsCard";
import WalletCard from "../components/TechnicianDashboard/WalletCard";
import AvailableJobs from "../components/TechnicianDashboard/AvailableJobs";
import AssignedJobs from "../components/TechnicianDashboard/AssignedJobs";

import "./TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const location = useLocation();

  useEffect(() => {
    const sectionId =
      location.state?.scrollToSection ||
      location.hash.replace(/^#/, "");

    if (!sectionId) return;

    let attempts = 0;
    let frameId;

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      // Retry briefly if the section has not rendered yet.
      if (attempts < 10) {
        attempts += 1;
        frameId = requestAnimationFrame(scrollToSection);
      }
    };

    frameId = requestAnimationFrame(scrollToSection);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [location.key, location.hash, location.state]);

  return (
    <main className="technician-dashboard">
      <DashboardHero />

      <TechnicianStats />

      <section
        id="active-job"
        className="dashboard-section"
        style={{ scrollMarginTop: "100px" }}
      >
        <ActiveJob />
      </section>

      <section className="dashboard-overview">
        <TodaySchedule />
        <EarningsCard />
      </section>

      <AvailabilityCard />

      <ReviewsCard />

      <WalletCard />

      <section
        id="available-jobs"
        className="dashboard-section"
        style={{ scrollMarginTop: "100px" }}
      >
        <AvailableJobs />
      </section>

      {/* AssignedJobs already has id="assigned-jobs". */}
      <section
        className="dashboard-section"
        style={{ scrollMarginTop: "100px" }}
      >
        <AssignedJobs />
      </section>
    </main>
  );
};

export default TechnicianDashboard;
