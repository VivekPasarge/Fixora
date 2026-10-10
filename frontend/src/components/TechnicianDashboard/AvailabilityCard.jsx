import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiPower,
  FiClock,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import api from "../../api/axios";
import "./AvailabilityCard.css";

const AvailabilityCard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const getStatus = (data) => {
    if (typeof data?.isAvailable === "boolean") {
      return data.isAvailable;
    }

    if (typeof data?.isOnline === "boolean") {
      return data.isOnline;
    }

    return null;
  };

  const notifyAvailabilityChange = (status) => {
    localStorage.setItem("technicianOnline", String(status));

    window.dispatchEvent(
      new CustomEvent("technicianAvailabilityChanged", {
        detail: { isOnline: status },
      })
    );
  };

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

      const status = getStatus(response.data);

      if (status !== null) {
        setIsOnline(status);
        localStorage.setItem("technicianOnline", String(status));
      } else {
        console.error(
          "Availability response is missing a Boolean status:",
          response.data
        );
      }
    } catch (error) {
      console.error(
        "Availability Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
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

  const toggleAvailability = async () => {
    if (updating || loading) return;

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

      const updatedStatus = getStatus(response.data);

      if (updatedStatus === null) {
        throw new Error(
          "The server did not return a valid availability status."
        );
      }

      setIsOnline(updatedStatus);
      notifyAvailabilityChange(updatedStatus);
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="availability-card"
      >
        <div className="availability-header">
          <div>
            <h2 className="availability-title">Availability</h2>
            <p className="availability-subtitle">
              Checking your working status...
            </p>
          </div>

          <div className="availability-status-icon online">
            <FiWifi size={24} />
          </div>
        </div>

        <div className="availability-loading">
          <div className="loading-spinner" />
          <p>Loading availability...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`availability-card ${
        isOnline ? "availability-online" : "availability-offline"
      }`}
    >
      <div className="availability-header">
        <div>
          <h2 className="availability-title">Availability</h2>
          <p className="availability-subtitle">
            Control your working status.
          </p>
        </div>

        <div
          className={`availability-status-icon ${
            isOnline ? "online" : "offline"
          }`}
        >
          {isOnline ? (
            <FiWifi size={24} />
          ) : (
            <FiWifiOff size={24} />
          )}
        </div>
      </div>

      <div className="status-card">
        <div className="status-header">
          <div>
            <p className="status-label">Current Status</p>

            <div className="status-value-row">
              <span
                className={`status-dot ${
                  isOnline ? "online-dot" : "offline-dot"
                }`}
              />

              <h3 className="status-text">
                {isOnline ? "Online" : "Offline"}
              </h3>
            </div>
          </div>

          <div
            className={`status-icon ${
              isOnline ? "online" : "offline"
            }`}
          >
            <FiPower size={26} />
          </div>
        </div>

        <p className="status-description">
          {isOnline
            ? "You are available to receive new service requests."
            : "You are offline and will not receive new service requests."}
        </p>
      </div>

      <div className="availability-details">
        <div className="detail-row">
          <span className="detail-label">Working Hours</span>
          <strong>09:00 AM - 08:00 PM</strong>
        </div>

        <div className="detail-row">
          <span className="detail-label">Break Time</span>
          <strong>01:00 PM - 02:00 PM</strong>
        </div>

        <div className="detail-row">
          <span className="detail-label">Today's Availability</span>
          <strong
            className={
              isOnline ? "available-text" : "unavailable-text"
            }
          >
            {isOnline ? "Available" : "Unavailable"}
          </strong>
        </div>
      </div>

      <button
        type="button"
        className={`availability-toggle-btn ${
          isOnline ? "go-offline" : "go-online"
        }`}
        onClick={toggleAvailability}
        disabled={updating || loading}
      >
        {updating ? (
          <>
            <span className="button-spinner" />
            Updating...
          </>
        ) : isOnline ? (
          <>
            <FiClock />
            Go Offline
          </>
        ) : (
          <>
            <FiPower />
            Go Online
          </>
        )}
      </button>
    </motion.div>
  );
};

export default AvailabilityCard;
