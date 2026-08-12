import {
  useEffect,
  useState,
  useRef,
} from "react";

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

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import api from "../../api/axios";

import socket from "../../socket";

import "./ActiveJob.css";


/* =========================================================
   TECHNICIAN MAP ICON
========================================================= */

const technicianIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});


/* =========================================================
   MAP RECENTER COMPONENT
========================================================= */

const RecenterTechnicianMap = ({
  latitude,
  longitude,
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      Math.max(map.getZoom(), 16),
      {
        animate: true,
      }
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
};


/* =========================================================
   ACTIVE JOB
========================================================= */

const ActiveJob = () => {

  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [locationSharing, setLocationSharing] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  /*
    NEW

    Stores the technician's current
    latitude and longitude.

    Every time GPS gives a new position,
    this state changes and the marker
    moves automatically.
  */

  const [
    technicianLocation,
    setTechnicianLocation,
  ] = useState(null);


  /*
    Store browser GPS watch ID.
  */

  const watchIdRef =
    useRef(null);


  /*
    Store current booking ID.
  */

  const bookingIdRef =
    useRef(null);


  /*
    Prevent duplicate GPS watchers.
  */

  const trackingStartedRef =
    useRef(false);


  /* =========================================================
     FETCH ACTIVE BOOKING
  ========================================================= */

  useEffect(() => {

    fetchActiveBooking();

    /*
      Automatically check the server
      every 5 seconds.
    */

    const interval =
      setInterval(() => {

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

  const fetchActiveBooking = async (
    silent = false
  ) => {

    try {

      if (!silent) {
        setLoading(true);
      }

      const token =
        localStorage.getItem("token");


      const response =
        await api.get(
          "/bookings/technician/assigned",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
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


      setBooking(
        (currentBooking) => {

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

          return (
            activeBooking ||
            null
          );
        }
      );


      /*
        If backend says technician
        is already On The Way or
        In Progress, make sure GPS
        tracking is running.
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
      Prevent duplicate watchers.
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
        "❌ Cannot start tracking without booking ID"
      );

      return;

    }


    /*
      Browser GPS support.
    */

    if (
      !navigator.geolocation
    ) {

      console.log(
        "❌ Geolocation not supported"
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
      Socket connection.
    */

    if (!socket.connected) {

      console.log(
        "🔄 Socket disconnected. Connecting..."
      );

      socket.connect();

    }


    /*
      Join booking room.
    */

    const joinBookingRoom =
      () => {

        console.log(
          "🚪 Technician joining booking room:",
          bookingId
        );

        socket.emit(
          "join-booking",
          bookingId
        );

      };


    if (socket.connected) {

      joinBookingRoom();

    }


    /*
      Rejoin after reconnect.
    */

    socket.on(
      "connect",
      joinBookingRoom
    );


    /* =====================================================
       GPS WATCH
    ===================================================== */

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
            Validate GPS.
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
            Prevent old booking
            from sending location.
          */

          if (
            bookingIdRef.current !==
            bookingId
          ) {

            console.log(
              "⚠️ Ignoring GPS from old booking"
            );

            return;

          }


          /*
            =========================================
            THIS MOVES THE TECHNICIAN MAP
            =========================================
          */

          setTechnicianLocation({
            latitude,
            longitude,
          });


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
            Send same location
            to customer through Socket.IO.
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


        /* =================================================
           GPS ERROR
        ================================================= */

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


        /* =================================================
           GPS OPTIONS
        ================================================= */

        {
          enableHighAccuracy: true,

          maximumAge: 3000,

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

  const stopLocationTracking =
    () => {

      console.log(
        "🛑 Stopping technician location tracking..."
      );


      /*
        Stop GPS.
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
        Tell backend.
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
        Remove only our
        connect listener.
      */

      /*
        We intentionally don't use
        socket.off("connect") here
        because that could remove
        listeners registered by
        other components.
      */


      trackingStartedRef.current =
        false;


      setLocationSharing(
        false
      );


      bookingIdRef.current =
        null;


      setTechnicianLocation(
        null
      );


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


      const response =
        await api.put(

          `/bookings/${booking._id}/status`,

          {
            status:
              "On The Way",
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );


      console.log(
        "✅ Start Journey Response:",
        response.data
      );


      /*
        Update UI immediately.
      */

      setBooking(
        (currentBooking) => {

          if (!currentBooking) {
            return currentBooking;
          }

          return {
            ...currentBooking,

            status:
              "On The Way",
          };

        }
      );


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
        Verify backend in background.
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


      const response =
        await api.put(

          `/bookings/${booking._id}/status`,

          {
            status:
              "Completed",
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );


      console.log(
        "✅ Complete Job Response:",
        response.data
      );


      /*
        Stop GPS.
      */

      stopLocationTracking();


      /*
        Update UI immediately.
      */

      setBooking(
        (currentBooking) => {

          if (!currentBooking) {
            return currentBooking;
          }

          return {
            ...currentBooking,

            status:
              "Completed",
          };

        }
      );


      alert(
        response.data.message ||
          "Job completed successfully."
      );


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

  const navigateToCustomer =
    () => {

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
     CLEANUP
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
          STATUS
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


        {(
          booking.status ===
            "On The Way" ||
          booking.status ===
            "In Progress"
        ) && (

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
          TECHNICIAN LIVE MAP
      ===================================================== */}

      {(
        booking.status ===
          "On The Way" ||
        booking.status ===
          "In Progress"
      ) && (

        <div
          className="technician-live-map-card"
          style={{
            marginTop: "24px",
            background: "#ffffff",
            borderRadius: "22px",
            padding: "20px",
            boxShadow:
              "0 15px 40px rgba(15, 23, 42, 0.10)",
            border:
              "1px solid rgba(148, 163, 184, 0.18)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing:
                    "0.08em",
                  color: "#2563eb",
                  marginBottom: "5px",
                }}
              >
                LIVE LOCATION
              </span>

              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "22px",
                }}
              >
                Your Current Location
              </h3>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                This map moves automatically
                as you move.
              </p>

            </div>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "8px 13px",
                borderRadius:
                  "999px",
                background:
                  locationSharing
                    ? "rgba(22, 163, 74, 0.10)"
                    : "rgba(245, 158, 11, 0.10)",
                color:
                  locationSharing
                    ? "#16a34a"
                    : "#d97706",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >

              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius:
                    "50%",
                  background:
                    locationSharing
                      ? "#16a34a"
                      : "#d97706",
                }}
              ></span>

              {locationSharing
                ? "GPS ACTIVE"
                : "STARTING GPS"}

            </div>

          </div>


          {/* =================================================
              MAP
          ================================================= */}

          <div
            style={{
              width: "100%",
              height: "420px",
              borderRadius: "18px",
              overflow: "hidden",
              background:
                "#e2e8f0",
            }}
          >

            {technicianLocation ? (

              <MapContainer

                center={[
                  technicianLocation.latitude,
                  technicianLocation.longitude,
                ]}

                zoom={16}

                scrollWheelZoom={true}

                style={{
                  width: "100%",
                  height: "100%",
                }}

              >

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />


                <RecenterTechnicianMap

                  latitude={
                    technicianLocation.latitude
                  }

                  longitude={
                    technicianLocation.longitude
                  }

                />


                <Marker

                  position={[
                    technicianLocation.latitude,
                    technicianLocation.longitude,
                  ]}

                  icon={
                    technicianIcon
                  }

                >

                  <Popup>

                    <strong>
                      You are here
                    </strong>

                    <br />

                    Your live technician
                    location.

                  </Popup>

                </Marker>

              </MapContainer>

            ) : (

              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  flexDirection:
                    "column",
                  gap: "10px",
                  color: "#64748b",
                  textAlign: "center",
                  padding: "20px",
                }}
              >

                <FiMapPin
                  size={35}
                />

                <strong
                  style={{
                    color: "#0f172a",
                  }}
                >
                  Waiting for GPS location
                </strong>

                <span
                  style={{
                    fontSize: "14px",
                  }}
                >
                  Allow location permission
                  and your position will appear
                  automatically.
                </span>

              </div>

            )}

          </div>


          {/* =================================================
              COORDINATES
          ================================================= */}

          {technicianLocation && (

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "10px",
                flexWrap: "wrap",
                fontSize: "12px",
                color: "#64748b",
              }}
            >

              <span>
                Latitude:{" "}
                {technicianLocation.latitude.toFixed(
                  6
                )}
              </span>

              <span>
                Longitude:{" "}
                {technicianLocation.longitude.toFixed(
                  6
                )}
              </span>

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          MAIN INFORMATION GRID
      ===================================================== */}

      <div className="active-job-grid">


        {/* ===================================================
            LEFT
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
            RIGHT
        =================================================== */}

        <div className="active-job-actions">


          {/* ACCEPTED */}

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


          {/* ON THE WAY */}

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


          {/* IN PROGRESS */}

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


          {/* LOCATION SHARING */}

          {(
            booking.status ===
              "On The Way" ||
            booking.status ===
              "In Progress"
          ) && (

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


          {/* OTP */}

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


          {/* ACTIONS */}

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