import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiPower } from "react-icons/fi";
import api from "../../api/axios";
import "./DashboardHero.css";

const DashboardHero = () => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const userName = user?.name || "User";

  const getToken = () => localStorage.getItem("token");

  const readAvailability = (data) => {
    if (typeof data?.isAvailable === "boolean") {
      return data.isAvailable;
    }

    if (typeof data?.isOnline === "boolean") {
      return data.isOnline;
    }

    return null;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to read user:", error);
      }
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        setIsOnline(false);
        return;
      }

      const response = await api.get(
        "/bookings/technician/availability",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const status = readAvailability(response.data);

      if (status !== null) {
        setIsOnline(status);
        localStorage.setItem("technicianOnline", String(status));
      }
    } catch (error) {
      console.error(
        "Dashboard Availability Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    const handleAvailabilityChange = (event) => {
      if (typeof event.detail?.isOnline === "boolean") {
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

  const handleViewTodaysJobs = () => {
    const assignedJobsSection =
      document.getElementById("assigned-jobs");

    if (assignedJobsSection) {
      assignedJobsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.warn("Assigned Jobs section not found.");
    }
  };

  const handleOpenNavigation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const googleMapsUrl =
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        window.open(
          googleMapsUrl,
          "_blank",
          "noopener,noreferrer"
        );
      },
      (error) => {
        console.error("Location error:", error);

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

  const toggleAvailability = async () => {
    if (updating || loadingAvailability) return;

    const token = getToken();

    if (!token) {
      alert("Please log in again.");
      return;
    }

    const newStatus = !isOnline;
    setUpdating(true);

    try {
      const response = await api.put(
        "/bookings/technician/availability",
        {
          isAvailable: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const returnedStatus = readAvailability(response.data);

      if (returnedStatus === null) {
        throw new Error(
          "The server did not return a valid availability status."
        );
      }

      setIsOnline(returnedStatus);

      localStorage.setItem(
        "technicianOnline",
        String(returnedStatus)
      );

      window.dispatchEvent(
        new CustomEvent("technicianAvailabilityChanged", {
          detail: {
            isOnline: returnedStatus,
          },
        })
      );
    } catch (error) {
      console.error(
        "Update Availability Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update availability."
      );

      await fetchAvailability();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-hero"
    >
      <div className="dashboard-hero-card">
        <div className="dashboard-content">
          <div className="hero-dashboard-left">
            <p className="dashboard-welcome">
              Welcome Back 👋
            </p>

            <h1 className="dashboard-name">{userName}</h1>

            <p className="dashboard-description">
              Manage today's bookings, accept new jobs,
              navigate to customers, and track your
              earnings from one place.
            </p>

            <div className="dashboard-buttons">
              <button
                type="button"
                className="dashboard-primary-btn"
                onClick={handleViewTodaysJobs}
              >
                View Today's Jobs
              </button>

              <button
                type="button"
                className="dashboard-secondary-btn"
                onClick={handleOpenNavigation}
              >
                <FiMapPin />
                <span>Open Navigation</span>
              </button>
            </div>
          </div>

          <div className="hero-dashboard-right">
            <div className="dashboard-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}&background=2563eb&color=fff&size=220`}
                alt={userName}
                className="dashboard-avatar-image"
              />
            </div>

            <button
              type="button"
              disabled={updating || loadingAvailability}
              onClick={toggleAvailability}
              className={`dashboard-status ${
                isOnline ? "status-online" : "status-offline"
              }`}
            >
              <FiPower />

              <span>
                {loadingAvailability
                  ? "Loading..."
                  : updating
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
