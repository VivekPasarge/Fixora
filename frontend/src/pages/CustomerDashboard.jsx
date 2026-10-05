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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH CUSTOMER DATA
  // ==========================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, bookingsResponse] =
          await Promise.all([
            api.get("/auth/profile", {
              headers,
            }),

            api.get("/bookings/my-bookings", {
              headers,
            }),
          ]);

        setProfile(
          profileResponse.data?.user || null
        );

        setBookings(
          Array.isArray(
            bookingsResponse.data?.bookings
          )
            ? bookingsResponse.data.bookings
            : []
        );
      } catch (error) {
        console.error(
          "Customer Dashboard Error:",
          error
        );

        setProfile(null);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==========================================
  // REFRESH BOOKINGS
  // ==========================================

  const refreshBookings = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      const response = await api.get(
        "/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(
        Array.isArray(
          response.data?.bookings
        )
          ? response.data.bookings
          : []
      );
    } catch (error) {
      console.error(
        "Refresh Bookings Error:",
        error
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="customer-dashboard-loading">
        <div className="dashboard-loader"></div>

        <h2>Loading your dashboard...</h2>

        <p>
          Fetching your bookings and account
          information.
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">

        {/* ======================================
            WELCOME
        ====================================== */}

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
                Manage your home services,
                bookings and technician tracking
                from one place.
              </p>
            </div>

            <div className="welcome-profile">
              <div className="welcome-avatar">
                {profile?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {profile?.name ||
                    "Customer"}
                </strong>

                <span>
                  {profile?.email ||
                    "Account"}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================
            HERO
        ====================================== */}

        <DashboardHero />

        {/* ======================================
            STATS
        ====================================== */}

        <StatsCards />

        {/* ======================================
            UPCOMING BOOKING
        ====================================== */}

        <UpcomingBooking
          bookings={bookings}
          onBookingUpdated={refreshBookings}
        />

        {/* ======================================
            LIVE TRACKING
        ====================================== */}

        <LiveTrackingCard />

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <QuickActions />

        {/* ======================================
            BOOKING HISTORY
        ====================================== */}

        <BookingHistory />

        {/* ======================================
            BOTTOM
        ====================================== */}

        <div className="dashboard-bottom">
          <RecentActivity />

          <ProfileSummary />
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;