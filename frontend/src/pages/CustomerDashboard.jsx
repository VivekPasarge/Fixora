
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import Navbar from "../components/Navbar/Navbar";

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

  // =========================================
  // EXTRACT BOOKINGS
  // =========================================

  const getBookings = (data) => {
    if (Array.isArray(data?.bookings)) return data.bookings;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;

    return [];
  };

  // =========================================
  // FETCH BOOKINGS
  // =========================================

  const fetchBookings = useCallback(async () => {
    const response = await api.get("/bookings/my-bookings");

    setBookings(getBookings(response.data));
  }, []);

  // =========================================
  // FETCH DASHBOARD DATA
  // =========================================

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

      const [profileResult, bookingsResult] =
        await Promise.allSettled([
          api.get("/auth/profile", { headers }),
          api.get("/bookings/my-bookings", { headers }),
        ]);

      // PROFILE DATA

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value.data;
        const user = data?.user || data?.data || data;

        setProfile(user || null);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        console.error(
          "Profile fetch failed:",
          profileResult.reason
        );

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          try {
            setProfile(JSON.parse(savedUser));
          } catch {
            setProfile(null);
          }
        }
      }

      // BOOKING DATA

      if (bookingsResult.status === "fulfilled") {
        setBookings(getBookings(bookingsResult.value.data));
      } else {
        console.error(
          "Bookings fetch failed:",
          bookingsResult.reason
        );

        setBookings([]);
      }
    } catch (error) {
      console.error("Customer Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =========================================
  // REFRESH BOOKINGS
  // =========================================

  const refreshBookings = async () => {
    try {
      await fetchBookings();
    } catch (error) {
      console.error("Refresh Bookings Error:", error);
    }
  };

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="customer-dashboard-loading">
          <div className="dashboard-loader" />

          <h2>Loading your dashboard...</h2>

          <p>
            Fetching your bookings and account information.
          </p>
        </div>
      </>
    );
  }

  // =========================================
  // CUSTOMER DASHBOARD
  // =========================================

  return (
    <>
      {/* NAVBAR */}
      <Navbar />

      <main className="customer-dashboard">
        <div className="dashboard-container">

          {/* CUSTOMER WELCOME SECTION */}

          <section className="customer-welcome">
            <div className="welcome-content">

              <div className="welcome-text">
                <span className="welcome-label">
                  CUSTOMER DASHBOARD
                </span>

                <h1>
                  Welcome,
                  <span> {profile?.name || "Customer"}</span>
                </h1>

                <p>
                  Manage your home services, bookings and
                  technician tracking from one place.
                </p>
              </div>

              {/* CUSTOMER PROFILE */}

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

          {/* DASHBOARD HERO */}

          <DashboardHero />

          {/* STATS */}

          <StatsCards
            profile={profile}
            bookings={bookings}
          />

          {/* UPCOMING BOOKING */}

          <UpcomingBooking
            bookings={bookings}
            onBookingUpdated={refreshBookings}
          />

          {/* LIVE TRACKING */}

          <LiveTrackingCard />

          {/* QUICK ACTIONS */}

          <QuickActions />

          {/* BOOKING HISTORY */}

          <BookingHistory bookings={bookings} />

          {/* BOTTOM CONTENT */}

          <div className="dashboard-bottom">
            <RecentActivity />

            <ProfileSummary />
          </div>

        </div>
      </main>
    </>
  );
};

export default CustomerDashboard;
