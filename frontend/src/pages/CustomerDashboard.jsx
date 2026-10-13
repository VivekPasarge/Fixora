
import { useCallback, useEffect, useState } from "react";
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

  const getBookings = (data) => {
    if (Array.isArray(data?.bookings)) return data.bookings;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchBookings = useCallback(async () => {
    const response = await api.get("/bookings/my-bookings");
    setBookings(getBookings(response.data));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResult, bookingsResult] = await Promise.allSettled([
        api.get("/auth/profile", { headers }),
        api.get("/bookings/my-bookings", { headers }),
      ]);

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value.data;
        const user = data?.user || data?.data || data;
        setProfile(user || null);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        console.error("Profile fetch failed:", profileResult.reason);
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setProfile(JSON.parse(savedUser));
          } catch {
            setProfile(null);
          }
        }
      }

      if (bookingsResult.status === "fulfilled") {
        setBookings(getBookings(bookingsResult.value.data));
      } else {
        console.error("Bookings fetch failed:", bookingsResult.reason);
        setBookings([]);
      }
    } catch (error) {
      console.error("Customer Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshBookings = async () => {
    try {
      await fetchBookings();
    } catch (error) {
      console.error("Refresh Bookings Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="customer-dashboard-loading">
        <div className="dashboard-loader" />
        <h2>Loading your dashboard...</h2>
        <p>Fetching your bookings and account information.</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">
        <section className="customer-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <span className="welcome-label">CUSTOMER DASHBOARD</span>
              <h1>
                Welcome,
                <span> {profile?.name || "Customer"}</span>
              </h1>
              <p>
                Manage your home services, bookings and technician tracking
                from one place.
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
                <strong>{profile?.name || "Customer"}</strong>
                <span>{profile?.email || "Account"}</span>
              </div>
            </div>
          </div>
        </section>

        <DashboardHero />

        <StatsCards profile={profile} bookings={bookings} />

        <UpcomingBooking
          bookings={bookings}
          onBookingUpdated={refreshBookings}
        />

        <LiveTrackingCard />

        <QuickActions />

        {/* The dashboard has one Booking History section. */}
        <BookingHistory bookings={bookings} />

        <div className="dashboard-bottom">
          <RecentActivity />
          <ProfileSummary />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
