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
  // State
  // ==========================================

  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [accessMessage, setAccessMessage] = useState("");


  // ==========================================
  // Logged-In User
  // ==========================================

  const storedUser = localStorage.getItem("user");

  const user =
    storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;


  // ==========================================
  // Fetch Booking
  // ==========================================

  useEffect(() => {
    fetchBooking();
  }, [id]);


  const fetchBooking = async () => {
    try {
      setLoading(true);

      setAccessMessage("");

      const token =
        localStorage.getItem("token");


      // ========================================
      // No User
      // ========================================

      if (!user) {
        setAccessMessage(
          "Please login to access tracking."
        );

        return;
      }


      // ========================================
      // ADMIN
      // ========================================

      if (user.role === "admin") {
        setAccessMessage(
          "Live tracking is not available for administrators."
        );

        return;
      }


      let response;


      // ========================================
      // SPECIFIC BOOKING
      // /track/:id
      // ========================================

      if (id) {
        response = await api.get(
          `/bookings/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setBooking(
          response.data.booking
        );

        return;
      }


      // ========================================
      // ACTIVE BOOKING
      // /track
      // ========================================

      response = await api.get(
        "/bookings/active",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      // ========================================
      // NO ACTIVE BOOKING
      // ========================================

      if (!response.data.active) {
        setAccessMessage(
          response.data.message ||
            (
              user.role === "technician"
                ? "You don't have an active job right now."
                : "You don't have an active service right now."
            )
        );

        return;
      }


      // ========================================
      // ACTIVE BOOKING FOUND
      // ========================================

      setBooking(
        response.data.booking
      );

    } catch (error) {
      console.error(
        "Track Booking Error:",
        error
      );

      setAccessMessage(
        error.response?.data?.message ||
          "Unable to load tracking information."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // Cancel Booking
  // ==========================================

  const cancelBooking = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${booking._id}/cancel`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
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
  // Open Payment
  // ==========================================

  const openPayment = () => {
    navigate(
      `/payment/${booking._id}`
    );
  };


  // ==========================================
  // Download Invoice
  // ==========================================

  const downloadInvoice = () => {
    generateInvoice(booking);
  };


  // ==========================================
  // Write Review
  // ==========================================

  const writeReview = () => {
    navigate("/review", {
      state: {
        booking,
      },
    });
  };


  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="track-loading-page">

          <div className="track-loading-card">

            <div className="track-loading-spinner">
            </div>

            <h2>
              Loading Tracking...
            </h2>

            <p>
              Please wait while we
              load your booking.
            </p>

          </div>

        </div>
      </>
    );
  }


  // ==========================================
  // Tracking Access / Empty State
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


                if (
                  user.role === "admin"
                ) {
                  navigate(
                    "/admin-dashboard"
                  );

                  return;
                }


                if (
                  user.role === "technician"
                ) {
                  navigate(
                    "/technician-dashboard"
                  );

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
  // Booking Not Found
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
  // Main Page
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
              Header
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
              Booking Summary
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
                  booking.paymentStatus ===
                  "Paid"
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
              Booking Progress
          ================================== */}

          <div className="tracking-section">

            <h3>
              Booking Progress
            </h3>


            <div className="timeline">

              {/* Booked */}

              <div
                className={`timeline-step ${
                  booking.status !==
                    "Cancelled"
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


              {/* Accepted */}

              <div
                className={`timeline-step ${
                  [
                    "Accepted",
                    "In Progress",
                    "Completed",
                  ].includes(
                    booking.status
                  )
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


              {/* In Progress */}

              <div
                className={`timeline-step ${
                  [
                    "In Progress",
                    "Completed",
                  ].includes(
                    booking.status
                  )
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  3
                </div>

                <span>
                  In Progress
                </span>

              </div>


              {/* Completed */}

              <div
                className={`timeline-step ${
                  booking.status ===
                    "Completed"
                    ? "active"
                    : ""
                }`}
              >

                <div className="circle">
                  4
                </div>

                <span>
                  Completed
                </span>

              </div>

            </div>

          </div>


          {/* ==================================
              Current Status
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
                  {booking.otp}
                </div>

                <p>
                  Share this OTP only after
                  the technician arrives.
                </p>

              </div>

          )}


          {/* ==================================
              Information Grid
          ================================== */}

          <div className="info-grid">

            <div className="info-card">

              <h4>
                Estimated Arrival
              </h4>

              <p>

                {booking.status ===
                  "Pending" &&
                  "Waiting for technician"}

                {booking.status ===
                  "Accepted" &&
                  "Technician arriving in 20 minutes"}

                {booking.status ===
                  "In Progress" &&
                  "Technician is working at your location"}

                {booking.status ===
                  "Completed" &&
                  "Service completed"}

                {booking.status ===
                  "Cancelled" &&
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
              Address
          ================================== */}

          <p>

            <strong>
              Address :
            </strong>{" "}

            {booking.address}

          </p>


          {/* ==================================
              Technician
          ================================== */}

          {booking.technician && (

            <>

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


              {/* ==================================
                  LIVE LOCATION
              ================================== */}

              {booking.status ===
                "In Progress" && (

                <div className="live-tracking-wrapper">

                  <div className="live-tracking-heading">

                    <span className="live-dot">
                    </span>

                    <h3>
                      Live Technician Tracking
                    </h3>

                  </div>

                  <p className="live-tracking-subtitle">
                    The technician is currently
                    working on your service.
                  </p>

                  <LiveLocation
                    bookingId={
                      booking._id
                    }
                  />

                </div>

              )}

            </>

          )}


          {/* ==================================
              Actions
          ================================== */}

          <div className="track-actions">

            {/* Contact Technician */}

            {booking.technician && (

              <a
                href={`tel:${booking.technician.phone}`}
                className="contact-btn"
              >
                Contact Technician
              </a>

            )}


            {/* Cancel */}

            {booking.status ===
              "Pending" && (

              <button
                className="cancel-btn"
                onClick={cancelBooking}
              >
                Cancel Booking
              </button>

            )}


            {/* Payment */}

            {booking.status ===
              "Completed" &&
              booking.paymentStatus ===
                "Pending" && (

              <button
                className="payment-btn"
                onClick={openPayment}
              >
                Proceed to Payment
              </button>

            )}


            {/* Payment Completed */}

            {booking.paymentStatus ===
              "Paid" && (

              <>

                <button
                  className="payment-success-btn"
                  disabled
                >
                  Payment Completed
                </button>


                <button
                  className="invoice-btn"
                  onClick={
                    downloadInvoice
                  }
                >
                  Download Invoice
                </button>

              </>

            )}


            {/* Review */}

            {booking.status ===
              "Completed" &&
              booking.paymentStatus ===
                "Paid" && (

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