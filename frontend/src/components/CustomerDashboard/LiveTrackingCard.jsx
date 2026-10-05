import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

import {
  FiMapPin,
  FiNavigation,
  FiClock,
  FiArrowRight,
  FiPhone,
  FiMessageCircle,
  FiShield,
  FiStar,
  FiCalendar,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

import "./LiveTrackingCard.css";

const LiveTrackingCard = () => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ACTIVE BOOKING
  // ==========================================

  const fetchActiveBooking = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setBooking(null);
        return;
      }

      const response = await api.get("/bookings/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.active && response.data?.booking) {
        setBooking(response.data.booking);
      } else {
        setBooking(null);
      }
    } catch (error) {
      console.error(
        "Live Tracking Booking Error:",
        error
      );

      // Do not show fake data if API fails.
      setBooking(null);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    fetchActiveBooking();

    const interval = setInterval(() => {
      fetchActiveBooking(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="live-tracking tracking-empty-section">
        <div className="tracking-empty-card">
          <div className="tracking-loading-icon">
            <FiLoader />
          </div>

          <h2>Checking your booking</h2>

          <p>
            We're checking whether you have an active
            service.
          </p>
        </div>
      </section>
    );
  }

  // ==========================================
  // NO BOOKING
  // ==========================================

  if (!booking) {
    return (
      <section className="live-tracking tracking-empty-section">
        <div className="tracking-empty-card">
          <div className="tracking-empty-icon">
            <FiMapPin />
          </div>

          <h2>No active booking</h2>

          <p>
            You don't have an active service right now.
            Book a service to see your technician here.
          </p>

          <button
            className="empty-track-button"
            onClick={() => navigate("/services")}
          >
            Book a Service
            <FiArrowRight />
          </button>
        </div>
      </section>
    );
  }

  // ==========================================
  // REAL BOOKING DATA
  // ==========================================

  const technician = booking.technician;

  const technicianName =
    technician?.name ||
    "Technician not assigned";

  const technicianPhone =
    technician?.phone || "";

  const technicianRating =
    technician?.rating ??
    technician?.averageRating ??
    null;

  const technicianJobs =
    technician?.completedJobs ??
    technician?.totalJobs ??
    null;

  const serviceName =
    booking.service?.name ||
    booking.serviceName ||
    "Home Service";

  const bookingStatus =
    booking.status || "Pending";

  const bookingId =
    booking._id || "";

  // ==========================================
  // STATUS CHECK
  // ==========================================

  const technicianAccepted =
    ["Accepted", "On The Way", "In Progress"].includes(
      bookingStatus
    ) && !!technician;

  const trackingStarted =
    booking.trackingActive === true ||
    (
      booking.technicianLocation &&
      booking.technicianLocation.latitude !== null &&
      booking.technicianLocation.longitude !== null
    );

  // ==========================================
  // DATE
  // ==========================================

  const formattedDate = booking.bookingDate
    ? new Date(
        booking.bookingDate
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  // ==========================================
  // TIME
  // ==========================================

  const formattedTime =
    booking.bookingTime || "Not available";

  // ==========================================
  // ADDRESS
  // ==========================================

  const customerAddress =
    booking.address ||
    booking.location ||
    booking.serviceAddress ||
    booking.customerAddress ||
    "Service address";

  // ==========================================
  // TRACKING STATUS MESSAGE
  // ==========================================

  const getTrackingMessage = () => {
    if (!technicianAccepted) {
      return "Your booking is waiting for technician confirmation.";
    }

    if (!trackingStarted) {
      return "Your technician has accepted the booking. Live location will appear when the technician starts sharing it.";
    }

    if (bookingStatus === "On The Way") {
      return "Your technician is on the way.";
    }

    if (bookingStatus === "In Progress") {
      return "Your service is currently in progress.";
    }

    return "Your technician is ready for your service.";
  };

  // ==========================================
  // OPEN TRACKING
  // ==========================================

  const openTracking = () => {
    if (!bookingId) {
      return;
    }

    navigate(`/track/${bookingId}`);
  };

  // ==========================================
  // CALL TECHNICIAN
  // ==========================================

  const callTechnician = () => {
    if (!technicianPhone) {
      alert("Technician phone number is not available.");
      return;
    }

    window.location.href = `tel:${technicianPhone}`;
  };

  // ==========================================
  // AVATAR
  // ==========================================

  const technicianInitials =
    technicianName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ==========================================
  // WAITING FOR TECHNICIAN
  // ==========================================

  if (!technicianAccepted) {
    return (
      <section className="live-tracking tracking-waiting-section">
        <div className="tracking-header">
          <div>
            <h2>Live Technician Tracking</h2>

            <p>
              Your tracking information will appear
              after your booking is confirmed.
            </p>
          </div>

          <div className="tracking-status pending">
            <span></span>
            WAITING
          </div>
        </div>

        <div className="tracking-waiting-card">
          <div className="waiting-icon">
            <FiClock />
          </div>

          <div className="waiting-content">
            <span className="waiting-label">
              {serviceName}
            </span>

            <h3>
              Your booking is awaiting confirmation
            </h3>

            <p>
              {getTrackingMessage()}
            </p>

            <div className="booking-mini-details">
              <div>
                <FiCalendar />

                <span>
                  {formattedDate}
                </span>
              </div>

              <div>
                <FiClock />

                <span>
                  {formattedTime}
                </span>
              </div>

              <div>
                <FiCheckCircle />

                <span>
                  {bookingStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // TECHNICIAN ACCEPTED
  // ==========================================

  return (
    <section className="live-tracking">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="tracking-header">

        <div>
          <div className="tracking-title-row">

            <h2>
              {trackingStarted
                ? "Live Technician Tracking"
                : "Booking Confirmed"}
            </h2>

            {trackingStarted && (
              <span className="live-badge">
                <span className="pulse"></span>
                LIVE
              </span>
            )}

          </div>

          <p>
            {getTrackingMessage()}
          </p>
        </div>

        <div
  className={`confirmed-status ${
    trackingStarted
      ? "status-live"
      : bookingStatus === "Accepted"
      ? "status-confirmed"
      : ""
  }`}
>
  {trackingStarted ? (
    <>
      <span className="status-live-dot"></span>
      LIVE
    </>
  ) : bookingStatus === "Accepted" ? (
    <>
      <FiCheckCircle />
      CONFIRMED
    </>
  ) : (
    <>
      <FiClock />
      {bookingStatus.toUpperCase()}
    </>
  )}
</div>

      </div>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <div className="tracking-container">

        {/* ======================================
            LEFT SIDE
        ====================================== */}

        <div className="tracking-map">

          {trackingStarted ? (
            <>
              <div className="map-placeholder-content">

                <div className="map-live-icon">
                  <FiNavigation />
                </div>

                <h3>
                  Technician location is live
                </h3>

                <p>
                  Follow your technician in real time
                  using the live tracking page.
                </p>

                <button
                  className="map-track-button"
                  onClick={openTracking}
                >
                  Open Live Map
                  <FiArrowRight />
                </button>

              </div>

              <div className="map-coordinates">

                <FiMapPin />

                <span>
                  {booking.technicianLocation?.latitude
                    ?.toFixed(5)}
                  {" , "}
                  {booking.technicianLocation?.longitude
                    ?.toFixed(5)}
                </span>

              </div>
            </>
          ) : (
            <div className="map-waiting">

              <div className="map-waiting-icon">
                <FiMapPin />
              </div>

              <h3>
                Technician accepted
              </h3>

              <p>
                Live location will appear here when
                location sharing starts.
              </p>

              <div className="waiting-status-line">
                <span></span>
                Waiting for live location
              </div>

            </div>
          )}

        </div>

        {/* ======================================
            RIGHT SIDE
        ====================================== */}

        <div className="tracking-info">

          {/* ====================================
              TECHNICIAN PROFILE
          ==================================== */}

          <div className="technician-profile">

            <div className="technician-avatar">

              {technician?.profileImage ? (
                <img
                  src={technician.profileImage}
                  alt={technicianName}
                />
              ) : (
                <span>
                  {technicianInitials}
                </span>
              )}

            </div>

            <div className="tech-content">

              <span className="tech-label">
                Your Technician
              </span>

              <h3>
                {technicianName}
              </h3>

              <p>
                {technician?.specialization ||
                  technician?.serviceType ||
                  serviceName}
              </p>

              <div className="badges">

                <span className="verified">
                  <FiShield />
                  Verified
                </span>

                {technicianRating !== null && (
                  <span className="rating">
                    <FiStar />
                    {Number(
                      technicianRating
                    ).toFixed(1)}
                  </span>
                )}

                {technicianJobs !== null && (
                  <span className="jobs">
                    {technicianJobs} Jobs
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* ====================================
              BOOKING STATUS
          ==================================== */}

          <div className="journey-card">

            <div className="journey-top">

              <span>
                Booking Status
              </span>

              <strong>
                {bookingStatus}
              </strong>

            </div>

            <div className="status-progress">

              <div
                className={`status-progress-fill ${
                  trackingStarted
                    ? "active"
                    : ""
                }`}
              ></div>

            </div>

            <small>
              {getTrackingMessage()}
            </small>

          </div>

          {/* ====================================
              BOOKING DETAILS
          ==================================== */}

          <div className="location-card">

            <div className="location-item">

              <div className="location-icon">
                <FiCalendar />
              </div>

              <div>
                <span>
                  Service Date
                </span>

                <h4>
                  {formattedDate}
                </h4>
              </div>

            </div>

            <div className="location-item">

              <div className="location-icon">
                <FiClock />
              </div>

              <div>
                <span>
                  Service Time
                </span>

                <h4>
                  {formattedTime}
                </h4>
              </div>

            </div>

            <div className="location-item">

              <div className="location-icon">
                <FiNavigation />
              </div>

              <div>
                <span>
                  Service
                </span>

                <h4>
                  {serviceName}
                </h4>
              </div>

            </div>

          </div>

          {/* ====================================
              BOOKING ID
          ==================================== */}

          <div className="booking-card">

            <div>
              <span>
                Booking ID
              </span>

              <h4>
                {booking.bookingNumber ||
                  booking.bookingId ||
                  booking._id}
              </h4>
            </div>

            <div>
              <span>
                Status
              </span>

              <h4>
                {bookingStatus}
              </h4>
            </div>

          </div>

          {/* ====================================
              BUTTONS
          ==================================== */}

          <div className="button-group">

            <button
              className="call-btn"
              onClick={callTechnician}
            >
              <FiPhone />
              Call
            </button>

            <button
              className="chat-btn"
              type="button"
              onClick={() =>
                alert(
                  "Chat with technician will be available soon."
                )
              }
            >
              <FiMessageCircle />
              Chat
            </button>

            <button
              className={`track-btn ${
                !trackingStarted
                  ? "disabled"
                  : ""
              }`}
              onClick={openTracking}
              disabled={!trackingStarted}
            >
              {trackingStarted
                ? "Track Live"
                : "Waiting for Location"}

              <FiArrowRight />
            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default LiveTrackingCard;