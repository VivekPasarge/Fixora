import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";

import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      // ==========================================
      // Get all bookings
      // ==========================================

      const response = await api.get(
        "/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const bookingsData =
        response.data.bookings || [];

      setBookings(bookingsData);

      // ==========================================
      // Check reviews in parallel
      // ==========================================
      //
      // OLD:
      //
      // for (...) {
      //   await checkReview()
      // }
      //
      // This was making requests one by one.
      //
      // NEW:
      // Promise.all() sends them together.
      //

      const completedPaidBookings =
        bookingsData.filter(
          (booking) =>
            booking.status === "Completed" &&
            booking.paymentStatus === "Paid"
        );

      if (
        completedPaidBookings.length > 0
      ) {
        const reviewResults =
          await Promise.all(
            completedPaidBookings.map(
              async (booking) => {
                try {
                  const reviewResponse =
                    await api.get(
                      `/reviews/check/${booking._id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                  return reviewResponse.data.reviewed
                    ? booking._id
                    : null;
                } catch (error) {
                  console.log(
                    "Review check failed:",
                    error
                  );

                  return null;
                }
              }
            )
          );

        setReviewedBookings(
          reviewResults.filter(Boolean)
        );
      } else {
        setReviewedBookings([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch bookings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="bookings-page">
          <div className="bookings-container">
            <div className="bookings-loading">
              <div className="loading-spinner"></div>

              <h2>
                Loading your bookings...
              </h2>

              <p>
                Please wait while we fetch
                your booking details.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bookings-page">

        <div className="bookings-container">

          {/* ==========================================
              Header
          ========================================== */}

          <motion.div
            className="bookings-header"
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
          >
            <h1>My Bookings</h1>

            <p>
              View and manage all your
              Fixora service bookings.
            </p>
          </motion.div>

          {/* ==========================================
              Tabs
          ========================================== */}

          <div className="booking-tabs">

            <button className="active-tab">
              Upcoming
            </button>

            <button>
              Active
            </button>

            <button>
              Completed
            </button>

            <button>
              Cancelled
            </button>

          </div>

          {/* ==========================================
              Bookings
          ========================================== */}

          <div className="bookings-list">

            {bookings.length === 0 ? (

              <div className="no-bookings">
                <h2>
                  No Bookings Found
                </h2>

                <p>
                  You haven't made any
                  service bookings yet.
                </p>
              </div>

            ) : (

              bookings.map(
                (booking, index) => (

                  <motion.div
                    key={booking._id}
                    className="booking-card"

                    initial={{
                      opacity: 0,
                      y: 25,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      duration: 0.35,
                      delay:
                        Math.min(
                          index * 0.05,
                          0.3
                        ),
                    }}
                  >

                    {/* ==========================================
                        Booking Header
                    ========================================== */}

                    <div className="booking-top">

                      <div>

                        <h2>
                          {booking.service?.name}
                        </h2>

                        <p className="booking-id">
                          Booking ID :{" "}
                          {booking.bookingId}
                        </p>

                      </div>

                      <span
                        className={`status-badge ${
                          booking.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )
                        }`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    {/* ==========================================
                        Booking Details
                    ========================================== */}

                    <div className="booking-details">

                      <div className="detail-item">

                        <FiCalendar />

                        <span>
                          {new Date(
                            booking.bookingDate
                          ).toLocaleDateString()}
                        </span>

                      </div>

                      <div className="detail-item">

                        <FiClock />

                        <span>
                          {booking.bookingTime}
                        </span>

                      </div>

                      <div className="detail-item">

                        <FiMapPin />

                        <span>
                          {booking.address}
                        </span>

                      </div>

                    </div>

                    {/* ==========================================
                        Technician
                    ========================================== */}

                    {booking.technician && (

                      <div className="technician-card">

                        <h3>
                          Assigned Professional
                        </h3>

                        <div className="tech-info">

                          <FiUser />

                          <span>
                            {
                              booking
                                .technician
                                .name
                            }
                          </span>

                        </div>

                        <div className="tech-info">

                          <FiPhone />

                          <span>
                            {
                              booking
                                .technician
                                .phone
                            }
                          </span>

                        </div>

                        <div className="tech-info">

                          <FiBriefcase />

                          <span>
                            {
                              booking
                                .technician
                                .profession ||
                              "Not Available"
                            }
                          </span>

                        </div>

                      </div>

                    )}

                    {/* ==========================================
                        Status Progress
                    ========================================== */}

                    <div className="status-progress">

                      <div
                        className={`step ${
                          booking.status !==
                          "Cancelled"
                            ? "active"
                            : ""
                        }`}
                      >
                        Pending
                      </div>

                      <div
                        className={`step ${
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
                        Accepted
                      </div>

                      <div
                        className={`step ${
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
                        In Progress
                      </div>

                      <div
                        className={`step ${
                          booking.status ===
                          "Completed"
                            ? "active"
                            : ""
                        }`}
                      >
                        Completed
                      </div>

                    </div>

                    {/* ==========================================
                        Footer
                    ========================================== */}

                    <div className="booking-footer">

                      <Link
                        to={`/track-booking/${booking._id}`}
                        className="details-btn"
                      >
                        Track Booking
                      </Link>

                      {/* ==========================================
                          Review
                      ========================================== */}

                      {booking.status ===
                        "Completed" &&
                        booking.paymentStatus ===
                          "Paid" && (

                          reviewedBookings.includes(
                            booking._id
                          ) ? (

                            <button
                              className="review-submitted-btn"
                              disabled
                            >
                              Review Submitted
                            </button>

                          ) : (

                            <Link
                              to="/review"
                              state={{
                                booking,
                              }}
                              className="review-btn"
                            >
                              Rate Service
                            </Link>

                          )
                        )}

                    </div>

                  </motion.div>

                )
              )
            )}

          </div>

        </div>

      </main>
    </>
  );
};

export default MyBookings;