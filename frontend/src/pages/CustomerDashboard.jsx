
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, bookingsResponse] =
          await Promise.all([
            api.get("/auth/profile", { headers }),
            api.get("/bookings/my-bookings", { headers }),
          ]);

        setProfile(profileResponse.data?.user || null);

        setBookings(
          Array.isArray(bookingsResponse.data?.bookings)
            ? bookingsResponse.data.bookings
            : []
        );
      } catch (error) {
        console.error("Customer Dashboard Error:", error);

        setProfile(null);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const refreshBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await api.get("/bookings/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(
        Array.isArray(response.data?.bookings)
          ? response.data.bookings
          : []
      );
    } catch (error) {
      console.error("Refresh Bookings Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="customer-dashboard-loading">
        <div className="dashboard-loader"></div>
        <h2>Loading your dashboard...</h2>
        <p>
          Fetching your bookings and account information.
        </p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">
        <section className="customer-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <span className="welcome-label">
                CUSTOMER DASHBOARD
              </span>

              <h1>
                Welcome,
                <span>
                  {" "}
                  {profile?.name || "Customer"}
                </span>
              </h1>

              <p>
                Manage your home services, bookings and
                technician tracking from one place.
              </p>

              <button
                type="button"
                className="dashboard-home-btn"
                onClick={() => navigate("/")}
              >
                ← Home
              </button>
            </div>

            <div className="welcome-profile">
              <div className="welcome-avatar">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {profile?.name || "Customer"}
                </strong>

                <span>
                  {profile?.email || "Account"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <DashboardHero />

        <StatsCards />

        <UpcomingBooking
          bookings={bookings}
          onBookingUpdated={refreshBookings}
        />

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
