import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiEye,
} from "react-icons/fi";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";

import "./BookingHistory.css";


const BookingHistory = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // Fetch Customer Booking History
  // ==========================================

  useEffect(() => {
    fetchHistory();
  }, []);


  const fetchHistory = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response =
        await api.get(
          "/bookings/my-history",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setBookings(
        response.data.bookings || []
      );

    } catch (error) {

      console.error(
        "Booking History Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load booking history."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return "Not Available";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // Format Removed Date
  // ==========================================

  const formatRemovedDate = (date) => {

    if (!date) {
      return "Previously removed";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // Status Class
  // ==========================================

  const getStatusClass = (status) => {

    if (!status) {
      return "";
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  // ==========================================
  // Loading
  // ==========================================

  if (loading) {

    return (
      <>
        <Navbar />

        <main className="history-page">

          <div className="history-loading">

            <div className="history-spinner"></div>

            <h2>
              Loading Booking History...
            </h2>

            <p>
              Please wait while we fetch
              your previous bookings.
            </p>

          </div>

        </main>
      </>
    );
  }


  // ==========================================
  // Error
  // ==========================================

  if (error) {

    return (
      <>
        <Navbar />

        <main className="history-page">

          <div className="history-error">

            <div className="history-error-icon">
              !
            </div>

            <h2>
              Unable to Load History
            </h2>

            <p>
              {error}
            </p>

            <button
              className="history-retry-btn"
              onClick={fetchHistory}
            >
              Try Again
            </button>

            <Link
              to="/my-bookings"
              className="history-back-btn"
            >
              <FiArrowLeft />
              Back to My Bookings
            </Link>

          </div>

        </main>
      </>
    );
  }


  return (
    <>
      <Navbar />


      <main className="history-page">

        <div className="history-container">


          {/* ==================================
              HEADER
          ================================== */}

          <motion.div
            className="history-header"
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

            <Link
              to="/my-bookings"
              className="history-back-link"
            >
              <FiArrowLeft />
              Back to My Bookings
            </Link>


            <div className="history-title">

              <span className="history-label">
                CUSTOMER HISTORY
              </span>

              <h1>
                Booking History
              </h1>

              <p>
                View bookings you previously
                removed from your My Bookings page.
              </p>

            </div>

          </motion.div>


          {/* ==================================
              HISTORY INFO
          ================================== */}

          <motion.div
            className="history-info-card"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >

            <div className="history-info-icon">
              <FiEye />
            </div>

            <div>

              <h3>
                Your booking records are safe
              </h3>

              <p>
                Removing a booking from My Bookings
                does not permanently delete it.
                Your booking records remain stored
                securely for future reference.
              </p>

            </div>

          </motion.div>


          {/* ==================================
              EMPTY HISTORY
          ================================== */}

          {bookings.length === 0 ? (

            <motion.div
              className="history-empty"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >

              <div className="history-empty-icon">
                <FiCalendar />
              </div>

              <h2>
                No Booking History
              </h2>

              <p>
                You haven't removed any bookings
                from your My Bookings page yet.
              </p>

              <Link
                to="/my-bookings"
                className="history-primary-btn"
              >
                View My Bookings
              </Link>

            </motion.div>

          ) : (

            <div className="history-list">

              {bookings.map(
                (booking, index) => (

                  <motion.article
                    key={booking._id}
                    className="history-card"
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay:
                        index * 0.08,
                    }}
                  >


                    {/* ==========================
                        TOP
                    ========================== */}

                    <div className="history-card-top">

                      <div>

                        <h2>
                          {
                            booking.service?.name ||
                            "Fixora Service"
                          }
                        </h2>

                        <p className="history-booking-id">
                          Booking ID:
                          {" "}
                          {booking.bookingId ||
                            booking._id}
                        </p>

                      </div>


                      <span
                        className={
                          `history-status ${getStatusClass(
                            booking.status
                          )}`
                        }
                      >
                        {booking.status}
                      </span>

                    </div>


                    {/* ==========================
                        BOOKING DETAILS
                    ========================== */}

                    <div className="history-details">


                      <div className="history-detail">

                        <FiCalendar />

                        <div>

                          <span>
                            Service Date
                          </span>

                          <strong>
                            {formatDate(
                              booking.bookingDate
                            )}
                          </strong>

                        </div>

                      </div>


                      <div className="history-detail">

                        <FiClock />

                        <div>

                          <span>
                            Service Time
                          </span>

                          <strong>
                            {booking.bookingTime ||
                              "Not Available"}
                          </strong>

                        </div>

                      </div>


                      <div className="history-detail">

                        <FiMapPin />

                        <div>

                          <span>
                            Address
                          </span>

                          <strong>
                            {booking.address ||
                              "Not Available"}
                          </strong>

                        </div>

                      </div>


                      <div className="history-detail">

                        <span className="history-price-symbol">
                          ₹
                        </span>

                        <div>

                          <span>
                            Service Amount
                          </span>

                          <strong>
                            ₹
                            {Number(
                              booking.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* ==========================
                        TECHNICIAN
                    ========================== */}

                    {booking.technician && (

                      <div className="history-technician">

                        <div className="history-tech-heading">

                          <FiUser />

                          <h3>
                            Assigned Professional
                          </h3>

                        </div>


                        <div className="history-tech-grid">

                          <div className="history-tech-item">

                            <FiUser />

                            <div>

                              <span>
                                Name
                              </span>

                              <strong>
                                {
                                  booking
                                    .technician
                                    ?.name ||
                                  "Not Available"
                                }
                              </strong>

                            </div>

                          </div>


                          <div className="history-tech-item">

                            <FiPhone />

                            <div>

                              <span>
                                Phone
                              </span>

                              <strong>
                                {
                                  booking
                                    .technician
                                    ?.phone ||
                                  "Not Available"
                                }
                              </strong>

                            </div>

                          </div>


                          <div className="history-tech-item">

                            <FiBriefcase />

                            <div>

                              <span>
                                Profession
                              </span>

                              <strong>
                                {
                                  booking
                                    .technician
                                    ?.profession ||
                                  "Not Available"
                                }
                              </strong>

                            </div>

                          </div>

                        </div>

                      </div>

                    )}


                    {/* ==========================
                        PAYMENT
                    ========================== */}

                    <div className="history-payment">

                      <div>

                        <span>
                          Payment Status
                        </span>

                        <strong
                          className={
                            booking.paymentStatus ===
                            "Paid"
                              ? "payment-paid"
                              : "payment-pending"
                          }
                        >
                          {
                            booking.paymentStatus ||
                            "Pending"
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Removed From My Bookings
                        </span>

                        <strong>
                          {formatRemovedDate(
                            booking.customerRemovedAt
                          )}
                        </strong>

                      </div>

                    </div>


                    {/* ==========================
                        FOOTER
                    ========================== */}

                    <div className="history-card-footer">

                      <Link
                        to={`/booking-details?id=${booking._id}`}
                        state={{
                          booking,
                        }}
                        className="history-view-btn"
                      >
                        <FiEye />
                        View Details
                      </Link>

                    </div>


                  </motion.article>

                )
              )}

            </div>

          )}

        </div>

      </main>
    </>
  );
};


export default BookingHistory;