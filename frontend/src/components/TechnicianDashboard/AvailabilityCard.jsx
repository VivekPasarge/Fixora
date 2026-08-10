import { useEffect, useState } from "react";
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

  /* =========================================================
     GET AVAILABILITY FROM BACKEND
  ========================================================= */

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/availability",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOnline(
        response.data.isOnline === true
      );

    } catch (error) {
      console.log(
        "Availability Error:",
        error
      );

      /*
        Safety fallback:
        if backend cannot be reached,
        technician is treated as offline.
      */

      setIsOnline(false);

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     LOAD STATUS WHEN COMPONENT MOUNTS
  ========================================================= */

  useEffect(() => {
    fetchAvailability();
  }, []);


  /* =========================================================
     LISTEN FOR STATUS CHANGES FROM OTHER COMPONENTS
  ========================================================= */

  useEffect(() => {

    const handleAvailabilityChange = (
      event
    ) => {

      if (
        event?.detail &&
        typeof event.detail.isOnline === "boolean"
      ) {
        setIsOnline(
          event.detail.isOnline
        );
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
     TOGGLE AVAILABILITY
  ========================================================= */

  const toggleAvailability = async () => {

    if (updating) {
      return;
    }

    try {

      setUpdating(true);

      const token =
        localStorage.getItem("token");

      const newStatus =
        !isOnline;


      /* =========================================
         UPDATE BACKEND
      ========================================= */

      const response =
        await api.put(
          "/bookings/technician/availability",
          {
            isOnline: newStatus,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const updatedStatus =
        response.data.isOnline === true;


      /* =========================================
         UPDATE LOCAL STATE
      ========================================= */

      setIsOnline(
        updatedStatus
      );


      /* =========================================
         KEEP DASHBOARD HERO SYNCHRONIZED
      ========================================= */

      window.dispatchEvent(
        new CustomEvent(
          "technicianAvailabilityChanged",
          {
            detail: {
              isOnline:
                updatedStatus,
            },
          }
        )
      );


      /* =========================================
         OPTIONAL LOCAL STORAGE
      ========================================= */

      localStorage.setItem(
        "technicianOnline",
        String(updatedStatus)
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
     LOADING UI
  ========================================================= */

  if (loading) {

    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="availability-card"
      >

        <div className="availability-header">

          <div>

            <h2 className="availability-title">
              Availability
            </h2>

            <p className="availability-subtitle">
              Checking your working status...
            </p>

          </div>


          <div className="availability-status-icon online">

            <FiWifi size={24} />

          </div>

        </div>


        <div className="availability-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading availability...
          </p>

        </div>

      </motion.div>
    );

  }


  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className={`availability-card ${
        isOnline
          ? "availability-online"
          : "availability-offline"
      }`}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="availability-header">

        <div>

          <h2 className="availability-title">
            Availability
          </h2>

          <p className="availability-subtitle">
            Control your working status.
          </p>

        </div>


        <div
          className={`availability-status-icon ${
            isOnline
              ? "online"
              : "offline"
          }`}
        >

          {isOnline ? (
            <FiWifi size={24} />
          ) : (
            <FiWifiOff size={24} />
          )}

        </div>

      </div>


      {/* =====================================================
          CURRENT STATUS
      ===================================================== */}

      <div className="status-card">

        <div className="status-header">

          <div>

            <p className="status-label">
              Current Status
            </p>


            <div className="status-value-row">

              <span
                className={`status-dot ${
                  isOnline
                    ? "online-dot"
                    : "offline-dot"
                }`}
              />


              <h3 className="status-text">

                {isOnline
                  ? "Online"
                  : "Offline"}

              </h3>

            </div>

          </div>


          <div
            className={`status-icon ${
              isOnline
                ? "online"
                : "offline"
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


      {/* =====================================================
          WORKING DETAILS
      ===================================================== */}

      <div className="availability-details">

        <div className="detail-row">

          <span className="detail-label">
            Working Hours
          </span>

          <strong>
            09:00 AM - 08:00 PM
          </strong>

        </div>


        <div className="detail-row">

          <span className="detail-label">
            Break Time
          </span>

          <strong>
            01:00 PM - 02:00 PM
          </strong>

        </div>


        <div className="detail-row">

          <span className="detail-label">
            Today's Availability
          </span>

          <strong
            className={
              isOnline
                ? "available-text"
                : "unavailable-text"
            }
          >

            {isOnline
              ? "Available"
              : "Unavailable"}

          </strong>

        </div>

      </div>


      {/* =====================================================
          TOGGLE BUTTON
      ===================================================== */}

      <button
        type="button"
        className={`availability-toggle-btn ${
          isOnline
            ? "go-offline"
            : "go-online"
        }`}
        onClick={toggleAvailability}
        disabled={updating}
      >

        {updating ? (

          <>
            <span className="button-spinner"></span>

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