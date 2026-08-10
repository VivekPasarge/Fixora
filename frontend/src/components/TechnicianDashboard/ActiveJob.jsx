import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiShield,
  FiClock,
  FiUser,
  FiMap,
} from "react-icons/fi";

import api from "../../api/axios";

import "./ActiveJob.css";

const ActiveJob = () => {
  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  /* =========================================================
     FETCH ACTIVE BOOKING
  ========================================================= */

  useEffect(() => {
    fetchActiveBooking();

    const interval = setInterval(() => {
      fetchActiveBooking(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchActiveBooking = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const activeBooking =
        response.data.bookings.find(
          (item) =>
            item.status === "Accepted" ||
            item.status === "On The Way" ||
            item.status === "In Progress"
        );

      setBooking(
        activeBooking || null
      );
    } catch (error) {
      console.log(
        "Fetch Active Booking Error:",
        error
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /* =========================================================
     START JOURNEY
  ========================================================= */

  const startJourney = async () => {
    if (!booking) return;

    try {
      setActionLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${booking._id}/status`,
        {
          status: "On The Way",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Journey started successfully."
      );

      await fetchActiveBooking();
    } catch (error) {
      console.log(
        "Start Journey Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to start journey."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     COMPLETE JOB
  ========================================================= */

  const completeJob = async () => {
    if (!booking) return;

    try {
      setActionLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${booking._id}/status`,
        {
          status: "Completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Job completed successfully."
      );

      await fetchActiveBooking();
    } catch (error) {
      console.log(
        "Complete Job Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete job."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     NAVIGATE TO CUSTOMER
  ========================================================= */

  const navigateToCustomer = () => {
    if (!booking?.address) {
      alert(
        "Customer address not available."
      );

      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        booking.address
      )}`,
      "_blank"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="active-job-section">
        <div className="active-job-loading">
          Loading active job...
        </div>
      </section>
    );
  }

  /* =========================================================
     NO ACTIVE JOB
  ========================================================= */

  if (!booking) {
    return (
      <section className="active-job-section">

        <div className="no-active-job">

          <div className="no-active-job-icon">
            <FiMap />
          </div>

          <h2>
            No Active Job
          </h2>

          <p>
            You currently don't have an
            active service assignment.
          </p>

        </div>

      </section>
    );
  }

  /* =========================================================
     MAIN PAGE
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
      className="active-job-section"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="active-job-header">

        <div>

          <span className="active-job-badge">
            Active Job
          </span>

          <h2 className="active-job-title">
            {booking.service?.name ||
              "Home Service"}
          </h2>

          <p className="active-job-subtitle">
            Your current assigned booking.
          </p>

        </div>

        <div className="job-id">
          <span>
            {booking.bookingId}
          </span>
        </div>

      </div>


      {/* =====================================================
          STATUS BANNER
      ===================================================== */}

      <div
        className={`job-status-banner ${
          booking.status
            ?.toLowerCase()
            .replaceAll(" ", "-")
        }`}
      >

        <div className="status-banner-left">

          <span className="status-pulse"></span>

          <div>

            <span>
              Current Status
            </span>

            <strong>
              {booking.status}
            </strong>

          </div>

        </div>


        {booking.status ===
          "On The Way" && (

          <span className="live-status-label">
            LIVE JOURNEY
          </span>

        )}

      </div>


      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="active-job-grid">


        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="job-info">


          {/* CUSTOMER */}

          <div className="info-card">

            <div className="info-row">

              <FiUser
                className="info-icon"
              />

              <div>

                <p className="info-label">
                  Customer
                </p>

                <h3 className="info-value">
                  {booking.customer?.name ||
                    "N/A"}
                </h3>

              </div>

            </div>

          </div>


          {/* SERVICE TIME */}

          <div className="info-card">

            <div className="info-row">

              <FiClock
                className="info-icon"
              />

              <div>

                <p className="info-label">
                  Service Time
                </p>

                <h3 className="info-value">

                  {booking.bookingDate
                    ? new Date(
                        booking.bookingDate
                      ).toLocaleDateString()
                    : "N/A"}

                  {" • "}

                  {booking.bookingTime ||
                    "N/A"}

                </h3>

              </div>

            </div>

          </div>


          {/* ADDRESS */}

          <div className="info-card">

            <div className="info-row">

              <FiMapPin
                className="info-icon"
              />

              <div>

                <p className="info-label">
                  Customer Address
                </p>

                <h3 className="info-value">
                  {booking.address ||
                    "N/A"}
                </h3>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="active-job-actions">


          {/* =================================================
              ACCEPTED
          ================================================= */}

          {booking.status ===
            "Accepted" && (

            <div className="journey-start-card">

              <div className="journey-icon">
                <FiNavigation />
              </div>

              <div>

                <h3>
                  Ready to Travel?
                </h3>

                <p>
                  Start your journey to
                  the customer's location.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              ON THE WAY
          ================================================= */}

          {booking.status ===
            "On The Way" && (

            <div className="journey-live-card">

              <div className="journey-live-icon">
                <FiNavigation />
              </div>

              <div>

                <h3>
                  Journey in Progress
                </h3>

                <p>
                  Your live location is
                  being shared with the
                  customer.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              IN PROGRESS
          ================================================= */}

          {booking.status ===
            "In Progress" && (

            <div className="service-progress-card">

              <div className="service-progress-icon">
                ✓
              </div>

              <div>

                <h3>
                  Service in Progress
                </h3>

                <p>
                  Customer OTP has been
                  verified. You can now
                  perform the service.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              OTP
          ================================================= */}

          {booking.status ===
            "In Progress" && (

            <div className="otp-card">

              <div className="info-row">

                <FiShield
                  className="otp-icon"
                />

                <div>

                  <p className="info-label">
                    Customer OTP
                  </p>

                  <h2 className="otp-code">
                    {booking.otp ||
                      "----"}
                  </h2>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="job-actions">


            {/* START JOURNEY */}

            {booking.status ===
              "Accepted" && (

              <button
                type="button"
                className="start-btn"
                onClick={
                  startJourney
                }
                disabled={
                  actionLoading
                }
              >

                <FiNavigation />

                {actionLoading
                  ? "Starting..."
                  : "Start Journey"}

              </button>

            )}


            {/* ON THE WAY */}

            {booking.status ===
              "On The Way" && (

              <div className="tracking-active-message">

                <span className="tracking-dot"></span>

                Live location sharing is active.

              </div>

            )}


            {/* COMPLETE */}

            {booking.status ===
              "In Progress" && (

              <button
                type="button"
                className="complete-btn"
                onClick={
                  completeJob
                }
                disabled={
                  actionLoading
                }
              >

                {actionLoading
                  ? "Completing..."
                  : "Complete Job"}

              </button>

            )}


            {/* CALL CUSTOMER */}

            <a
              href={`tel:${
                booking.customer?.phone ||
                ""
              }`}
              className="outline-btn"
            >

              <FiPhone />

              Call Customer

            </a>


            {/* NAVIGATE */}

            <button
              type="button"
              className="outline-btn"
              onClick={
                navigateToCustomer
              }
            >

              <FiNavigation />

              Navigate

            </button>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default ActiveJob;