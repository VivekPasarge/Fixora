import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./UpcomingBooking.css";

import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiStar,
  FiX,
  FiUser,
} from "react-icons/fi";

import technician from "../../assets/hero/hero-right.png";

const UpcomingBooking = () => {
  const navigate = useNavigate();

  const [showReviews, setShowReviews] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Temporary demo booking ID.
  // Later this will come from real booking data.
  const bookingId = "YOUR_BOOKING_ID";

  const technicianPhone = "+91 98765 43210";

  const handleTrack = () => {
    if (bookingId === "YOUR_BOOKING_ID") {
      alert("No active booking is available for live tracking.");
      return;
    }

    navigate(`/track-booking/${bookingId}`);
  };

  const handleCall = () => {
    setShowCallModal(true);
  };

  const handleActualCall = () => {
    window.location.href = `tel:${technicianPhone}`;
  };

  return (
    <>
      <section className="upcoming-booking">

        <div className="booking-header">
          <div>
            <h2>Upcoming Booking</h2>

            <p>
              Your technician is confirmed and will arrive shortly.
            </p>
          </div>

          <span className="booking-status">
            Confirmed
          </span>
        </div>

        <div className="booking-body">

          <div className="technician-card">

            <img
              src={technician}
              alt="Rahul Sharma"
            />

            <h3>Rahul Sharma</h3>

            <p>Certified Electrician</p>

            {/* CLICKABLE RATING */}
           {/* CLICKABLE TECHNICIAN RATING */}
<button
  type="button"
  className="rating rating-button"
  onClick={() => setShowReviews(true)}
  aria-label="View Rahul Sharma's reviews"
>
  <span className="rating-stars">
    <FiStar />
    <FiStar />
    <FiStar />
    <FiStar />
    <FiStar />
  </span>

  <span className="rating-text">
    4.9 Rating
  </span>
</button>

          </div>

          <div className="booking-details">

            <div className="details-grid">

              <div className="detail-card">

                <div className="detail-icon">
                  <FiCalendar />
                </div>

                <div>
                  <span>Date</span>
                  <h4>12 July 2026</h4>
                </div>

              </div>

              <div className="detail-card">

                <div className="detail-icon">
                  <FiClock />
                </div>

                <div>
                  <span>Time</span>
                  <h4>10:30 AM</h4>
                </div>

              </div>

              <div className="detail-card full-width">

                <div className="detail-icon">
                  <FiMapPin />
                </div>

                <div>
                  <span>Address</span>

                  <h4>
                    24 MG Road, Bengaluru, Karnataka
                  </h4>
                </div>

              </div>

            </div>

            <div className="booking-buttons">

              <button
                type="button"
                className="track-btn"
                onClick={handleTrack}
              >
                <FiNavigation />
                Track Live
              </button>

              <button
                type="button"
                className="call-btn"
                onClick={handleCall}
              >
                <FiPhone />
                Call Technician
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ================================
          REVIEWS MODAL
      ================================= */}

      {showReviews && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setShowReviews(false)}
        >

          <div
            className="reviews-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="reviews-modal-close"
              onClick={() => setShowReviews(false)}
              aria-label="Close reviews"
            >
              <FiX />
            </button>

            <div className="reviews-modal-icon">
              <FiStar />
            </div>

            <span className="reviews-modal-badge">
              Verified Technician
            </span>

            <h2>Rahul Sharma</h2>

            <p className="reviews-role">
              Certified Electrician
            </p>

            <div className="overall-rating">

              <strong>4.9</strong>

              <div className="overall-stars">
                <FiStar />
                <FiStar />
                <FiStar />
                <FiStar />
                <FiStar />
              </div>

              <span>524 reviews</span>

            </div>

            <div className="review-item">

              <div className="review-top">
                <strong>Excellent Service</strong>
                <span>5.0</span>
              </div>

              <p>
                Very professional and completed the work on time.
              </p>

            </div>

            <div className="review-item">

              <div className="review-top">
                <strong>Highly Recommended</strong>
                <span>4.8</span>
              </div>

              <p>
                Friendly technician and good quality of work.
              </p>

            </div>

            <button
              type="button"
              className="reviews-done-btn"
              onClick={() => setShowReviews(false)}
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* ================================
          CALL TECHNICIAN MODAL
      ================================= */}

      {showCallModal && (
        <div
          className="call-modal-overlay"
          onClick={() => setShowCallModal(false)}
        >

          <div
            className="call-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              className="call-modal-close"
              onClick={() => setShowCallModal(false)}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className="call-modal-icon">
              <FiPhone />
            </div>

            <span className="call-modal-badge">
              Technician Assigned
            </span>

            <h2>
              Call Rahul Sharma
            </h2>

            <p>
              Your assigned technician is available for
              assistance regarding your upcoming service.
            </p>

            <div className="technician-contact">

              <div className="contact-avatar">
                <FiUser />
              </div>

              <div className="contact-info">
                <strong>Rahul Sharma</strong>
                <span>Certified Electrician</span>
                <b>{technicianPhone}</b>
              </div>

            </div>

            <button
              type="button"
              className="start-call-btn"
              onClick={handleActualCall}
            >
              <FiPhone />
              Call Now
            </button>

            <button
              type="button"
              className="cancel-call-btn"
              onClick={() => setShowCallModal(false)}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </>
  );
};

export default UpcomingBooking;