import { useEffect, useState, useRef } from "react";

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

import socket from "../../socket";

import "./ActiveJob.css";

const ActiveJob = () => {
  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [locationSharing, setLocationSharing] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  /*
    Store the browser GPS watch ID.

    We use useRef because changing this value
    should NOT cause a React re-render.
  */

  const watchIdRef = useRef(null);

  /*
    Store the current booking ID.

    This prevents old GPS callbacks from
    sending locations for another booking.
  */

  const bookingIdRef = useRef(null);

  /*
    Prevent multiple GPS watchers.
  */

  const trackingStartedRef = useRef(false);

  /* =========================================================
     FETCH ACTIVE BOOKING
  ========================================================= */

  useEffect(() => {
    fetchActiveBooking();

    /*
      Keep checking the server every 5 seconds.

      This is useful if the customer/admin changes
      something from another device.

      It is NOT required for Start Journey anymore
      because we update React state immediately.
    */

    const interval = setInterval(() => {
      fetchActiveBooking(true);
    }, 5000);

    return () => {
      clearInterval(interval);

      stopLocationTracking();
    };
  }, []);

  /* =========================================================
     FETCH ACTIVE BOOKING
  ========================================================= */

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

      const bookings =
        response.data?.bookings || [];

      const activeBooking =
        bookings.find(
          (item) =>
            item.status === "Accepted" ||
            item.status === "On The Way" ||
            item.status === "In Progress"
        );

      /*
        Update booking state.

        If we already started tracking locally,
        don't accidentally remove the booking
        because of a temporary stale response.
      */

      setBooking((currentBooking) => {
        if (
          !activeBooking &&
          currentBooking &&
          (
            currentBooking.status ===
              "On The Way" ||
            currentBooking.status ===
              "In Progress"
          )
        ) {
          return currentBooking;
        }

        return activeBooking || null;
      });

      /*
        If server says On The Way, make sure
        GPS tracking is running.
      */

      if (
        activeBooking &&
        (
          activeBooking.status ===
            "On The Way" ||
          activeBooking.status ===
            "In Progress"
        )
      ) {
        bookingIdRef.current =
          activeBooking._id;

        /*
          Start tracking if it isn't already running.
        */

        if (
          !trackingStartedRef.current
        ) {
          startLocationTracking(
            activeBooking._id
          );
        }
      }
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
     START LOCATION TRACKING
  ========================================================= */

  const startLocationTracking = (
    bookingId
  ) => {
    /*
      Prevent duplicate GPS watchers.
    */

    if (
      trackingStartedRef.current
    ) {
      console.log(
        "📍 Location tracking already active"
      );

      return;
    }

    if (!bookingId) {
      console.log(
        "❌ Cannot start location tracking without booking ID"
      );

      return;
    }

    /*
      Check browser support.
    */

    if (
      !navigator.geolocation
    ) {
      console.log(
        "❌ Geolocation is not supported by this browser."
      );

      setLocationError(
        "Your browser does not support location tracking."
      );

      return;
    }

    console.log(
      "📍 Starting technician location tracking..."
    );

    console.log(
      "📦 Tracking booking:",
      bookingId
    );

    bookingIdRef.current =
      bookingId;

    trackingStartedRef.current =
      true;

    setLocationSharing(true);

    setLocationError("");

    /*
      Make sure Socket.IO is connected.
    */

    if (!socket.connected) {
      console.log(
        "🔄 Socket is disconnected. Connecting..."
      );

      socket.connect();
    }

    /*
      Join the booking room.

      This allows the backend to associate
      this technician with the booking room.
    */

    const joinBookingRoom = () => {
      console.log(
        "🚪 Technician joining booking room:",
        bookingId
      );

      socket.emit(
        "join-booking",
        bookingId
      );
    };

    /*
      If already connected, join immediately.
    */

    if (socket.connected) {
      joinBookingRoom();
    }

    /*
      Also join when Socket.IO reconnects.
    */

    socket.on(
      "connect",
      joinBookingRoom
    );

    /*
      Start browser GPS watcher.

      watchPosition continuously receives
      location changes.
    */

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const latitude =
            Number(
              position.coords.latitude
            );

          const longitude =
            Number(
              position.coords.longitude
            );

          const accuracy =
            Number(
              position.coords.accuracy
            );

          /*
            Validate coordinates.
          */

          if (
            !Number.isFinite(
              latitude
            ) ||
            !Number.isFinite(
              longitude
            )
          ) {
            console.log(
              "❌ Invalid GPS coordinates"
            );

            return;
          }

          /*
            Make sure this callback still
            belongs to the current booking.
          */

          if (
            bookingIdRef.current !==
            bookingId
          ) {
            console.log(
              "⚠️ Ignoring GPS update for old booking"
            );

            return;
          }

          console.log(
            "📍 TECHNICIAN GPS:",
            {
              bookingId,
              latitude,
              longitude,
              accuracy,
            }
          );

          /*
            Send location to backend.
          */

          socket.emit(
            "send-location",
            {
              bookingId,

              latitude,

              longitude,

              accuracy,

              timestamp:
                new Date().toISOString(),
            }
          );

          console.log(
            "📤 Location sent to server"
          );
        },

        (error) => {
          console.log(
            "❌ GPS Error:",
            error
          );

          let message =
            "Unable to access your location.";

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            message =
              "Location permission was denied. Please allow location access for Fixora.";
          }

          if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            message =
              "Your current location is unavailable.";
          }

          if (
            error.code ===
            error.TIMEOUT
          ) {
            message =
              "Location request timed out. Trying again...";
          }

          setLocationError(
            message
          );
        },

        {
          enableHighAccuracy: true,

          maximumAge: 5000,

          timeout: 15000,
        }
      );

    watchIdRef.current =
      watchId;

    console.log(
      "✅ GPS tracking started. Watch ID:",
      watchId
    );
  };

  /* =========================================================
     STOP LOCATION TRACKING
  ========================================================= */

  const stopLocationTracking = () => {
    console.log(
      "🛑 Stopping technician location tracking..."
    );

    /*
      Stop browser GPS watcher.
    */

    if (
      watchIdRef.current !==
      null
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current =
        null;
    }

    /*
      Tell backend to stop tracking.
    */

    if (
      bookingIdRef.current
    ) {
      socket.emit(
        "stop-location",
        bookingIdRef.current
      );
    }

    /*
      Remove reconnect listener.
    */

    socket.off(
      "connect"
    );

    /*
      Reset tracking state.
    */

    trackingStartedRef.current =
      false;

    setLocationSharing(false);

    bookingIdRef.current =
      null;

    setLocationError("");

    console.log(
      "✅ Technician location tracking stopped"
    );
  };

  /* =========================================================
     START JOURNEY
  ========================================================= */

  const startJourney = async () => {
    if (!booking) {
      return;
    }

    try {
      setActionLoading(true);

      setLocationError("");

      const token =
        localStorage.getItem("token");

      console.log(
        "🚀 Starting journey for:",
        booking._id
      );

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

      console.log(
        "✅ Start Journey Response:",
        response.data
      );

      /*
        IMPORTANT:
        Update React state immediately.

        This removes the need to refresh the page.
      */

      setBooking((currentBooking) => {
        if (!currentBooking) {
          return currentBooking;
        }

        return {
          ...currentBooking,

          status: "On The Way",
        };
      });

      /*
        Store booking ID.
      */

      bookingIdRef.current =
        booking._id;

      /*
        Start GPS immediately.
      */

      startLocationTracking(
        booking._id
      );

      alert(
        response.data.message ||
          "Journey started successfully."
      );

      /*
        Refresh from server in the background.

        This verifies that the backend state
        matches the frontend state.
      */

      fetchActiveBooking(true);
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
    if (!booking) {
      return;
    }

    try {
      setActionLoading(true);

      const token =
        localStorage.getItem("token");

      console.log(
        "🏁 Completing booking:",
        booking._id
      );

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

      console.log(
        "✅ Complete Job Response:",
        response.data
      );

      /*
        Stop GPS immediately.
      */

      stopLocationTracking();

      /*
        Update UI immediately.

        No refresh required.
      */

      setBooking((currentBooking) => {
        if (!currentBooking) {
          return currentBooking;
        }

        return {
          ...currentBooking,

          status: "Completed",
        };
      });

      alert(
        response.data.message ||
          "Job completed successfully."
      );

      /*
        Check server state in background.
      */

      fetchActiveBooking(true);
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
     CLEANUP WHEN COMPONENT UNMOUNTS
  ========================================================= */

  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

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
          LOCATION ERROR
      ===================================================== */}

      {locationError && (

        <div
          style={{
            marginTop: "15px",
            padding: "12px 16px",
            borderRadius: "12px",
            background:
              "rgba(239, 68, 68, 0.08)",
            color: "#dc2626",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {locationError}
        </div>

      )}


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
              LOCATION SHARING STATUS
          ================================================= */}

          {booking.status ===
            "On The Way" && (

            <div
              className="tracking-active-message"
              style={{
                marginTop: "15px",
              }}
            >

              <span className="tracking-dot"></span>

              {locationSharing
                ? "Live location sharing is active."
                : "Starting live location sharing..."}

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

                {locationSharing
                  ? "Live location sharing is active."
                  : "Waiting for GPS permission..."}

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