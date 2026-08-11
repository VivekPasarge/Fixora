import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import LiveLocation from "../components/LiveTracking/LiveLocation";

import api from "../api/axios";
import generateInvoice from "../utils/invoiceGenerator";

import "./TrackBooking.css";

const TrackBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessMessage, setAccessMessage] = useState("");

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user =
      storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
  } catch (error) {
    console.error("User Parse Error:", error);
    user = null;
  }

  // ==========================================
  // FETCH BOOKING
  // ==========================================

  useEffect(() => {
    fetchBooking();

    // Automatically refresh booking status.
    // This allows the customer page to detect:
    //
    // Accepted → On The Way
    // On The Way → In Progress
    // In Progress → Completed
    //
    // without manually refreshing the page.

    const interval = setInterval(() => {
      fetchBooking(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  // ==========================================
  // FETCH BOOKING FUNCTION
  // ==========================================

  const fetchBooking = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      if (!silent) {
        setAccessMessage("");
      }

      const token = localStorage.getItem("token");

      // ========================================
      // NO USER
      // ========================================

      if (!user) {
        setAccessMessage("Please login to access tracking.");

        if (!silent) {
          setLoading(false);
        }

        return;
      }

      // ========================================
      // ADMIN
      // ========================================

      if (user.role === "admin") {
        setAccessMessage(
          "Live tracking is not available for administrators."
        );

        if (!silent) {
          setLoading(false);
        }

        return;
      }

      let response;

      // ========================================
      // SPECIFIC BOOKING
      // /track/:id
      // ========================================

      if (id) {
        response = await api.get(`/bookings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBooking(response.data.booking);

        if (!silent) {
          setAccessMessage("");
        }

        return;
      }

      // ========================================
      // ACTIVE BOOKING
      // /track
      // ========================================

      response = await api.get("/bookings/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ========================================
      // NO ACTIVE BOOKING
      // ========================================

      if (!response.data.active) {
        setAccessMessage(
          response.data.message ||
            (user.role === "technician"
              ? "You don't have an active job right now."
              : "You don't have an active service right now.")
        );

        setBooking(null);

        return;
      }

      // ========================================
      // ACTIVE BOOKING FOUND
      // ========================================

      setBooking(response.data.booking);

      if (!silent) {
        setAccessMessage("");
      }
    } catch (error) {
      console.error("Track Booking Error:", error);

      // Do not destroy the existing booking
      // during a silent refresh if the server
      // temporarily fails.

      if (!silent) {
        setAccessMessage(
          error.response?.data?.message ||
            "Unable to load tracking information."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${booking._id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      fetchBooking();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel booking"
      );
    }
  };

  // ==========================================
  // OPEN PAYMENT
  // ==========================================

  const openPayment = () => {
    navigate(`/payment/${booking._id}`);
  };

  // ==========================================
  // DOWNLOAD INVOICE
  // ==========================================

  const downloadInvoice = () => {
    generateInvoice(booking);
  };

  // ==========================================
  // WRITE REVIEW
  // ==========================================

  const writeReview = () => {
    navigate("/review", {
      state: {
        booking,
      },
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="track-loading-page">
          <div className="track-loading-card">

            <div className="track-loading-spinner"></div>

            <h2>
              Loading Tracking...
            </h2>

            <p>
              Please wait while we load your booking.
            </p>

          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // ACCESS MESSAGE
  // ==========================================

  if (accessMessage) {
    return (
      <>
        <Navbar />

        <div className="track-access-page">

          <div className="track-access-card">

            <div className="track-access-icon">
              {user?.role === "admin"
                ? "🔒"
                : "📍"}
            </div>

            <span className="track-access-label">
              LIVE TRACKING
            </span>

            <h2>
              {user?.role === "admin"
                ? "Tracking Unavailable"
                : user?.role === "technician"
                ? "No Active Job"
                : "No Active Service"}
            </h2>

            <p>
              {accessMessage}
            </p>

            <button
              className="track-access-btn"
              onClick={() => {

                if (!user) {
                  navigate("/login");
                  return;
                }

                if (user.role === "admin") {
                  navigate("/admin-dashboard");
                  return;
                }

                if (user.role === "technician") {
                  navigate("/technician-dashboard");
                  return;
                }

                navigate("/my-bookings");
              }}
            >
              {!user
                ? "Login"
                : user.role === "admin"
                ? "Go to Dashboard"
                : user.role === "technician"
                ? "Go to Dashboard"
                : "View My Bookings"}
            </button>

          </div>

        </div>
      </>
    );
  }

  // ==========================================
  // BOOKING NOT FOUND
  // ==========================================

  if (!booking) {
    return (
      <>
        <Navbar />

        <div className="track-access-page">

          <div className="track-access-card">

            <div className="track-access-icon">
              ⚠️
            </div>

            <span className="track-access-label">
              TRACKING
            </span>

            <h2>
              Booking Not Found
            </h2>

            <p>
              We couldn't find the booking
              you're trying to track.
            </p>

            <button
              className="track-access-btn"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              View My Bookings
            </button>

          </div>

        </div>
      </>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <>
      <Navbar />

      <div className="track-page">

        <h1>
          Track Booking
        </h1>

        <div className="track-card">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="track-header">

            <div>

              <h2>
                {booking.service?.name}
              </h2>

              <p>
                Booking ID :{" "}
                <strong>
                  {booking.bookingId}
                </strong>
              </p>

            </div>

            <span
              className={`status-badge ${
                booking.status
                  ?.toLowerCase()
                  .replace(" ", "-")
              }`}
            >
              {booking.status}
            </span>

          </div>

          <hr />

          {/* ==================================
              BOOKING SUMMARY
          ================================== */}

          <div className="summary">

            <div className="summary-row">

              <span>
                Service
              </span>

              <strong>
                {booking.service?.name}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Price
              </span>

              <strong>
                ₹{booking.price}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Payment Method
              </span>

              <strong>
                {booking.paymentMethod}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Payment Status
              </span>

              <strong
                className={
                  booking.paymentStatus === "Paid"
                    ? "paid"
                    : "pending-payment"
                }
              >
                {booking.paymentStatus}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Date
              </span>

              <strong>
                {new Date(
                  booking.bookingDate
                ).toLocaleDateString()}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Time
              </span>

              <strong>
                {booking.bookingTime}
              </strong>

            </div>

          </div>

          {/* ==================================
              BOOKING PROGRESS
          ================================== */}

          <div className="tracking-section">

            <h3>
              Booking Progress
            </h3>

            <div className="timeline">

              {/* BOOKED */}

              <div
                className={`timeline-step ${
                  booking.status !== "Cancelled"
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  1
                </div>

                <span>
                  Booked
                </span>

              </div>

              {/* ACCEPTED */}

              <div
                className={`timeline-step ${
                  [
                    "Accepted",
                    "On The Way",
                    "In Progress",
                    "Completed",
                  ].includes(booking.status)
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  2
                </div>

                <span>
                  Accepted
                </span>

              </div>

              {/* ON THE WAY */}

              <div
                className={`timeline-step ${
                  [
                    "On The Way",
                    "In Progress",
                    "Completed",
                  ].includes(booking.status)
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  3
                </div>

                <span>
                  On The Way
                </span>

              </div>

              {/* IN PROGRESS */}

              <div
                className={`timeline-step ${
                  [
                    "In Progress",
                    "Completed",
                  ].includes(booking.status)
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  4
                </div>

                <span>
                  In Progress
                </span>

              </div>

              {/* COMPLETED */}

              <div
                className={`timeline-step ${
                  booking.status === "Completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  5
                </div>

                <span>
                  Completed
                </span>

              </div>

            </div>

          </div>

          {/* ==================================
              CURRENT STATUS
          ================================== */}

          <div className="status-box">

            <h3>
              Current Status
            </h3>

            <p>
              {booking.status}
            </p>

          </div>

          {/* ==================================
              OTP
          ================================== */}

          {booking.status !== "Pending" &&
            booking.status !== "Cancelled" && (

              <div className="otp-card">

                <h3>
                  Service Verification OTP
                </h3>

                <div className="otp-number">
                  {booking.otp || "----"}
                </div>

                <p>
                  Share this OTP only after
                  the technician arrives.
                </p>

              </div>

          )}

          {/* ==================================
              INFORMATION GRID
          ================================== */}

          <div className="info-grid">

            <div className="info-card">

              <h4>
                Estimated Arrival
              </h4>

              <p>

                {booking.status === "Pending" &&
                  "Waiting for technician"}

                {booking.status === "Accepted" &&
                  "Technician accepted your booking"}

                {booking.status === "On The Way" &&
                  "Technician is on the way"}

                {booking.status === "In Progress" &&
                  "Technician is working at your location"}

                {booking.status === "Completed" &&
                  "Service completed"}

                {booking.status === "Cancelled" &&
                  "Booking cancelled"}

              </p>

            </div>

            <div className="info-card">

              <h4>
                Payment Status
              </h4>

              <p>
                {booking.paymentStatus}
              </p>

            </div>

          </div>

          {/* ==================================
              ADDRESS
          ================================== */}

          <div className="booking-address">

            <p>

              <strong>
                Address :
              </strong>{" "}

              {booking.address}

            </p>

          </div>

          {/* ==================================
              ASSIGNED TECHNICIAN
          ================================== */}

          {booking.technician && (

            <div className="technician-section">

              <hr />

              <h3>
                Assigned Professional
              </h3>

              <p>

                <strong>
                  Name :
                </strong>{" "}

                {booking.technician.name}

              </p>

              <p>

                <strong>
                  Phone :
                </strong>{" "}

                {booking.technician.phone}

              </p>

              <p>

                <strong>
                  Profession :
                </strong>{" "}

                {booking.technician.profession ||
                  "Not Available"}

              </p>

            </div>

          )}

          {/* ==================================
              LIVE TRACKING
          ================================== */}

          <div className="live-tracking-wrapper">

            {/* ==================================
                ON THE WAY
            ================================== */}

            {booking.status === "On The Way" && (

              <>

                <div className="live-tracking-heading">

                  <span className="live-dot"></span>

                  <h3>
                    Live Technician Tracking
                  </h3>

                  <span className="tracking-live-badge">
                    LIVE
                  </span>

                </div>

                <p className="live-tracking-subtitle">

                  Your technician is on the way.
                  You can view their live location
                  below.

                </p>

                <LiveLocation
                  bookingId={booking._id}
                />

              </>

            )}

            {/* ==================================
                IN PROGRESS
            ================================== */}

            {booking.status === "In Progress" && (

              <>

                <div className="live-tracking-heading">

                  <span className="live-dot"></span>

                  <h3>
                    Live Technician Tracking
                  </h3>

                  <span className="tracking-live-badge">
                    LIVE
                  </span>

                </div>

                <p className="live-tracking-subtitle">

                  Your technician is currently
                  working on your service. You can
                  view their live location below.

                </p>

                <LiveLocation
                  bookingId={booking._id}
                />

              </>

            )}

            {/* ==================================
                ACCEPTED
            ================================== */}

            {booking.status === "Accepted" && (

              <div className="tracking-message accepted-message">

                <div className="tracking-message-icon">
                  📍
                </div>

                <div>

                  <h3>
                    Technician Accepted
                  </h3>

                  <p>

                    Your technician has accepted
                    the booking. Live location will
                    appear here when the technician
                    starts the journey.

                  </p>

                </div>

              </div>

            )}

            {/* ==================================
                PENDING
            ================================== */}

            {booking.status === "Pending" && (

              <div className="tracking-message pending-message">

                <div className="tracking-message-icon">
                  ⏳
                </div>

                <div>

                  <h3>
                    Waiting for Technician
                  </h3>

                  <p>

                    We are finding a technician
                    for your service. Live tracking
                    will become available once a
                    technician accepts your booking.

                  </p>

                </div>

              </div>

            )}

            {/* ==================================
                COMPLETED
            ================================== */}

            {booking.status === "Completed" && (

              <div className="tracking-message completed-message">

                <div className="tracking-message-icon">
                  ✓
                </div>

                <div>

                  <h3>
                    Service Completed
                  </h3>

                  <p>

                    Your service has been completed
                    successfully. Live technician
                    tracking has ended.

                  </p>

                </div>

              </div>

            )}

            {/* ==================================
                CANCELLED
            ================================== */}

            {booking.status === "Cancelled" && (

              <div className="tracking-message cancelled-message">

                <div className="tracking-message-icon">
                  ✕
                </div>

                <div>

                  <h3>
                    Booking Cancelled
                  </h3>

                  <p>

                    This booking has been cancelled.
                    Live technician tracking is no
                    longer available.

                  </p>

                </div>

              </div>

            )}

          </div>

          {/* ==================================
              ACTIONS
          ================================== */}

          <div className="track-actions">

            {/* CONTACT TECHNICIAN */}

            {booking.technician && (

              <a
                href={`tel:${booking.technician.phone}`}
                className="contact-btn"
              >
                Contact Technician
              </a>

            )}

            {/* CANCEL */}

            {booking.status === "Pending" && (

              <button
                className="cancel-btn"
                onClick={cancelBooking}
              >
                Cancel Booking
              </button>

            )}

            {/* PAYMENT */}

            {booking.status === "Completed" &&
              booking.paymentStatus === "Pending" && (

                <button
                  className="payment-btn"
                  onClick={openPayment}
                >
                  Proceed to Payment
                </button>

            )}

            {/* PAYMENT COMPLETED */}

            {booking.paymentStatus === "Paid" && (

              <>

                <button
                  className="payment-success-btn"
                  disabled
                >
                  Payment Completed
                </button>

                <button
                  className="invoice-btn"
                  onClick={downloadInvoice}
                >
                  Download Invoice
                </button>

              </>

            )}

            {/* REVIEW */}

            {booking.status === "Completed" &&
              booking.paymentStatus === "Paid" && (

                <button
                  className="review-btn"
                  onClick={writeReview}
                >
                  Write Review
                </button>

            )}

          </div>

        </div>

      </div>
    </>
  );
};

export default TrackBooking;