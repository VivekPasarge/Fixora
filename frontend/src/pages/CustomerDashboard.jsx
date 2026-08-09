import { useEffect, useState } from "react";
import api from "../api/axios";

import DashboardHero from "../components/CustomerDashboard/DashboardHero";
import StatsCards from "../components/CustomerDashboard/StatsCards";
import UpcomingBooking from "../components/CustomerDashboard/UpcomingBooking";
import LiveTrackingCard from "../components/CustomerDashboard/LiveTrackingCard";
import QuickActions from "../components/CustomerDashboard/QuickActions";
import BookingHistory from "../components/CustomerDashboard/BookingHistory";
import RecentActivity from "../components/CustomerDashboard/RecentActivity";
import ProfileSummary from "../components/CustomerDashboard/ProfileSummary";

import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.user);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">

        {/* Welcome Section */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2>
            Welcome, {profile ? profile.name : "Loading..."} 👋
          </h2>

          {profile && (
            <>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>

              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>

              <p>
                <strong>Role:</strong> {profile.role}
              </p>
            </>
          )}
        </div>

        <DashboardHero />

        <StatsCards />

        <UpcomingBooking />

        <LiveTrackingCard />

        <QuickActions />

        <BookingHistory />

        <div className="dashboard-bottom">
          <RecentActivity />

          <ProfileSummary />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;