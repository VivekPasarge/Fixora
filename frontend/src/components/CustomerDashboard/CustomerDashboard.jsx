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
    <div className="customer-dashboard">

      <DashboardHero />

      <StatsCards />

      <UpcomingBooking />

      <LiveTrackingCard />

      <QuickActions />

      <div className="dashboard-bottom">

        <div className="dashboard-left">

          <BookingHistory />

          <RecentActivity />

        </div>

        <div className="dashboard-right">

          <ProfileSummary />

        </div>

      </div>

    </div>
  );
};

export default CustomerDashboard;