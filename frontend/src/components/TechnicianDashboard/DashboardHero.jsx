import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiPower } from "react-icons/fi";

import api from "../../api/axios";

import "./DashboardHero.css";

const DashboardHero = () => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("Failed to read user:", error);
      }
    }
  }, []);

  const userName = user?.name || "User";

  /* =========================================================
     GET CURRENT AVAILABILITY
  ========================================================= */

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/availability",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOnline(response.data.isOnline === true);
    } catch (error) {
      console.log(
        "Dashboard Availability Error:",
        error
      );

      setIsOnline(false);
    }
  };

  /* =========================================================
     INITIAL AVAILABILITY
  ========================================================= */

  useEffect(() => {
    fetchAvailability();
  }, []);

  /* =========================================================
     LISTEN TO AVAILABILITY CARD
  ========================================================= */

  useEffect(() => {
    const handleAvailabilityChange = (event) => {
      if (
        event?.detail &&
        typeof event.detail.isOnline === "boolean"
      ) {
        setIsOnline(event.detail.isOnline);
      }
    };

    window.addEventListener(
      "technicianAvailabilityChanged",
      handleAvailabilityChange
    );

    return () => {
      window.removeEventListener(
        "technicianAvailabilityChanged",
        handleAvailabilityChange
      );
    };
  }, []);

  /* =========================================================
     VIEW TODAY'S JOBS
  ========================================================= */

  const handleViewTodaysJobs = () => {
    const assignedJobsSection =
      document.getElementById("assigned-jobs");

    if (assignedJobsSection) {
      assignedJobsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.log(
        "Assigned Jobs section not found."
      );
    }
  };

  /* =========================================================
     OPEN NAVIGATION
  ========================================================= */

  const handleOpenNavigation = () => {
    if (!navigator.geolocation) {
      alert(
        "Location is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const googleMapsUrl =
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        window.open(
          googleMapsUrl,
          "_blank",
          "noopener,noreferrer"
        );
      },

      (error) => {
        console.log(
          "Location error:",
          error
        );

        alert(
          "Unable to get your current location. Please allow location access."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* =========================================================
     TOGGLE ONLINE / OFFLINE
  ========================================================= */

  const toggleAvailability = async () => {
    if (updating) {
      return;
    }

    try {
      setUpdating(true);

      const token =
        localStorage.getItem("token");

      const newStatus = !isOnline;

      const response = await api.put(
        "/bookings/technician/availability",
        {
          isOnline: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedStatus =
        response.data.isOnline === true;

      setIsOnline(updatedStatus);

      /* =========================================
         SAVE LOCAL STATUS
      ========================================= */

      localStorage.setItem(
        "technicianOnline",
        String(updatedStatus)
      );

      /* =========================================
         NOTIFY OTHER COMPONENTS
      ========================================= */

      window.dispatchEvent(
        new CustomEvent(
          "technicianAvailabilityChanged",
          {
            detail: {
              isOnline: updatedStatus,
            },
          }
        )
      );
    } catch (error) {
      console.log(
        "Update Availability Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update availability"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="dashboard-hero"
    >

      {/* =====================================================
          BLUE HERO CARD
      ===================================================== */}

      <div className="dashboard-hero-card">

        {/* =================================================
            CONTENT WRAPPER
        ================================================= */}

        <div className="dashboard-content">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="hero-dashboard-left">

            <p className="dashboard-welcome">
              Welcome Back 👋
            </p>

            <h1 className="dashboard-name">
              {userName}
            </h1>

            <p className="dashboard-description">
              Manage today's bookings, accept new jobs,
              navigate to customers, and track your
              earnings from one place.
            </p>

            {/* =============================================
                BUTTONS
            ============================================= */}

            <div className="dashboard-buttons">

              {/* TODAY'S JOBS */}

              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={handleViewTodaysJobs}
              >
                View Today's Jobs
              </button>


              {/* NAVIGATION */}

              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={handleOpenNavigation}
              >
                <FiMapPin />

                <span>
                  Open Navigation
                </span>
              </button>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="hero-dashboard-right">

            {/* =============================================
                PROFILE IMAGE
            ============================================= */}

            <div className="dashboard-avatar">

              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}&background=2563eb&color=fff&size=220`}
                alt={userName}
                className="dashboard-avatar-image"
              />

            </div>


            {/* =============================================
                ONLINE / OFFLINE BUTTON
            ============================================= */}

            <button
              type="button"
              disabled={updating}
              onClick={toggleAvailability}
              className={`dashboard-status ${
                isOnline
                  ? "status-online"
                  : "status-offline"
              }`}
            >

              <FiPower />

              <span>
                {updating
                  ? "Updating..."
                  : isOnline
                  ? "Online"
                  : "Offline"}
              </span>

            </button>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default DashboardHero;