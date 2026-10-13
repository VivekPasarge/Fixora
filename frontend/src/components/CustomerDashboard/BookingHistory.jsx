
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";

import "./BookingHistory.css";

const getServiceName = (booking) =>
  booking?.service?.name ||
  booking?.service?.title ||
  booking?.serviceName ||
  (typeof booking?.service === "string" ? booking.service : null) ||
  "Home Service";

const getBookingDate = (booking) =>
  booking?.bookingDate || booking?.createdAt || booking?.updatedAt || null;

const formatDate = (dateValue) => {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBookingId = (booking) => {
  const id = booking?._id || booking?.id;

  if (!id) return "N/A";

  return `#FX${String(id).slice(-6).toUpperCase()}`;
};

const getAmount = (booking) =>
  Number(
    booking?.price ?? booking?.totalAmount ?? booking?.amount ?? 0
  ) || 0;

const formatAmount = (booking) =>
  getAmount(booking).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const getStatusClass = (status) =>
  String(status || "Pending")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const BookingHistory = ({ bookings = [] }) => {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const recentBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    return [...bookings]
      .sort((a, b) => {
        const dateA = new Date(getBookingDate(a) || 0).getTime();
        const dateB = new Date(getBookingDate(b) || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [bookings]);

  const handleViewAll = () => {
    navigate("/my-bookings");
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
            <p>Your most recent Fixora service bookings.</p>
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

          {recentBookings.length === 0 ? (
            <div className="history-empty">
              <p>No bookings yet.</p>
              <button
                type="button"
                className="details-btn"
                onClick={() => navigate("/services")}
              >
                Browse Services
              </button>
            </div>
          ) : (
            recentBookings.map((booking) => {
              const status = booking?.status || "Pending";

              return (
                <div
                  className="table-row"
                  key={booking._id || booking.id}
                >
                  <span>{getBookingId(booking)}</span>
                  <span>{getServiceName(booking)}</span>
                  <span>{formatDate(getBookingDate(booking))}</span>
                  <span>{formatAmount(booking)}</span>

                  <span className={`status ${getStatusClass(status)}`}>
                    {status}
                  </span>

                  <button
                    type="button"
                    className="details-btn"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedBooking && (
        <div
          className="booking-details-overlay"
          onClick={closeDetails}
        >
          <div
            className="booking-details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
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

            <h2 id="booking-details-title">
              {getServiceName(selectedBooking)}
            </h2>

            <p className="booking-id-text">
              {getBookingId(selectedBooking)}
            </p>

            <div className="booking-info-grid">
              <div className="booking-info-card">
                <FiCalendar />
                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(getBookingDate(selectedBooking))}
                  </strong>
                </div>
              </div>

              <div className="booking-info-card">
                <FiClock />
                <div>
                  <span>Status</span>
                  <strong>{selectedBooking.status || "Pending"}</strong>
                </div>
              </div>

              <div className="booking-info-card">
                <FiCreditCard />
                <div>
                  <span>Amount</span>
                  <strong>{formatAmount(selectedBooking)}</strong>
                </div>
              </div>

              <div className="booking-info-card">
                <FiMapPin />
                <div>
                  <span>Service Location</span>
                  <strong>
                    {typeof selectedBooking.address === "string"
                      ? selectedBooking.address
                      : selectedBooking.address?.fullAddress ||
                        selectedBooking.address?.address ||
                        "Not provided"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="booking-details-status">
              <span>Payment Status</span>
              <strong
                className={`status ${getStatusClass(
                  selectedBooking.paymentStatus || "Pending"
                )}`}
              >
                {selectedBooking.paymentStatus || "Pending"}
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
