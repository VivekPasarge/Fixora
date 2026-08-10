import "./CustomerDashboard.css";

import DashboardHero from "../components/CustomerDashboard/DashboardHero";
import StatsCards from "../components/CustomerDashboard/StatsCards";
import UpcomingBooking from "../components/CustomerDashboard/UpcomingBooking";
import LiveTrackingCard from "../components/CustomerDashboard/LiveTrackingCard";
import QuickActions from "../components/CustomerDashboard/QuickActions";
import BookingHistory from "../components/CustomerDashboard/BookingHistory";
import RecentActivity from "../components/CustomerDashboard/RecentActivity";
import ProfileSummary from "../components/CustomerDashboard/ProfileSummary";

const CustomerDashboard = () => {
  return (
    <main className="customer-dashboard">

      {/* ================================
          HERO
      ================================= */}

      <section className="dashboard-hero-section">
        <DashboardHero />
      </section>


      {/* ================================
          STATS
      ================================= */}

      <section className="dashboard-stats-section">
        <StatsCards />
      </section>


      {/* ================================
          UPCOMING BOOKING
      ================================= */}

      <section className="dashboard-section">
        <UpcomingBooking />
      </section>


      {/* ================================
          LIVE TRACKING
      ================================= */}

      <section className="dashboard-section">
        <LiveTrackingCard />
      </section>


      {/* ================================
          QUICK ACTIONS
      ================================= */}

      <section className="dashboard-section">
        <QuickActions />
      </section>


      {/* ================================
          BOTTOM CONTENT
      ================================= */}

      <section className="dashboard-bottom">

        <div className="dashboard-left">

          <div className="dashboard-section">
            <BookingHistory />
          </div>

          <div className="dashboard-section">
            <RecentActivity />
          </div>

        </div>


        <aside className="dashboard-right">
          <ProfileSummary />
        </aside>

      </section>

    </main>
  );
};

export default CustomerDashboard;