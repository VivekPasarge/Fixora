import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";

import "./BookingHistory.css";

const bookings = [
  {
    id: "#FX1001",
    service: "AC Repair",
    date: "28 Jul 2026",
    amount: "₹1,250",
    status: "Completed",
  },
  {
    id: "#FX1002",
    service: "House Cleaning",
    date: "24 Jul 2026",
    amount: "₹2,100",
    status: "Pending",
  },
  {
    id: "#FX1003",
    service: "Plumbing",
    date: "20 Jul 2026",
    amount: "₹850",
    status: "Cancelled",
  },
  {
    id: "#FX1004",
    service: "Electrician",
    date: "15 Jul 2026",
    amount: "₹1,450",
    status: "Completed",
  },
];

const BookingHistory = () => {
  const navigate = useNavigate();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAllBookings, setShowAllBookings] = useState(false);

  const handleViewAll = () => {
    navigate("/my-bookings");
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <>
      <section className="booking-history">

        <div className="history-header">
          <div>
            <h2>Booking History</h2>

            <p>
              Your recent Fixora service bookings.
            </p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={handleViewAll}
          >
            View All
          </button>
        </div>

        <div className="history-table">

          <div className="table-head">
            <span>Booking ID</span>
            <span>Service</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {bookings.map((booking) => (

            <div
              className="table-row"
              key={booking.id}
            >

              <span>{booking.id}</span>

              <span>{booking.service}</span>

              <span>{booking.date}</span>

              <span>{booking.amount}</span>

              <span
                className={`status ${booking.status.toLowerCase()}`}
              >
                {booking.status}
              </span>

              <button
                type="button"
                className="details-btn"
                onClick={() => handleViewDetails(booking)}
              >
                View Details
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* ================================
          BOOKING DETAILS MODAL
      ================================= */}

      {selectedBooking && (
        <div
          className="booking-details-overlay"
          onClick={closeDetails}
        >

          <div
            className="booking-details-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              className="booking-details-close"
              onClick={closeDetails}
              aria-label="Close booking details"
            >
              <FiX />
            </button>

            <div className="booking-details-icon">
              <FiCalendar />
            </div>

            <span className="booking-details-label">
              Booking Details
            </span>

            <h2>
              {selectedBooking.service}
            </h2>

            <p className="booking-id-text">
              {selectedBooking.id}
            </p>

            <div className="booking-info-grid">

              <div className="booking-info-card">

                <FiCalendar />

                <div>
                  <span>Date</span>
                  <strong>
                    {selectedBooking.date}
                  </strong>
                </div>

              </div>

              <div className="booking-info-card">

                <FiClock />

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedBooking.status}
                  </strong>
                </div>

              </div>

              <div className="booking-info-card">

                <FiCreditCard />

                <div>
                  <span>Amount</span>
                  <strong>
                    {selectedBooking.amount}
                  </strong>
                </div>

              </div>

              <div className="booking-info-card">

                <FiMapPin />

                <div>
                  <span>Service Location</span>
                  <strong>
                    Bengaluru
                  </strong>
                </div>

              </div>

            </div>

            <div className="booking-details-status">

              <span>
                Booking Status
              </span>

              <strong
                className={`status ${selectedBooking.status.toLowerCase()}`}
              >
                {selectedBooking.status}
              </strong>

            </div>

            <button
              type="button"
              className="booking-details-done"
              onClick={closeDetails}
            >
              Close
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default BookingHistory;