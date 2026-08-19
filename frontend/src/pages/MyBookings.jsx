import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiX,
  FiAlertTriangle,
  FiTrash2,
} from "react-icons/fi";

import api from "../api/axios";
import socket from "../socket";
import Navbar from "../components/Navbar/Navbar";

import "./MyBookings.css";

const MyBookings = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [bookings, setBookings] = useState([]);

  const [reviewedBookings, setReviewedBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  // Current selected tab
  const [activeTab, setActiveTab] = useState("Upcoming");

  // Remove booking loading state
  const [removingBookingId, setRemovingBookingId] =
    useState(null);

  // Technician cancellation popup
  const [
    technicianCancelledBooking,
    setTechnicianCancelledBooking,
  ] = useState(null);

  const [
    showTechnicianCancelPopup,
    setShowTechnicianCancelPopup,
  ] = useState(false);


  // =========================================================
  // FETCH BOOKINGS WHEN PAGE LOADS
  // =========================================================

  useEffect(() => {
    fetchBookings();
  }, []);


  // =========================================================
  // SOCKET.IO
  //
  // Technician cancellation should appear immediately.
  // The customer does NOT need to refresh My Bookings.
  // =========================================================

  useEffect(() => {

    const handleTechnicianCancellation = (data) => {

      console.log(
        "Technician cancellation received:",
        data
      );


      // -----------------------------------------------------
      // Create temporary booking information for popup
      // -----------------------------------------------------

      const cancelledBooking = {
        _id: data.bookingId,

        bookingId:
          data.bookingNumber ||
          data.bookingId,

        service: {
          name:
            data.service ||
            "Home Service",
        },

        bookingDate:
          data.bookingDate ||
          null,

        status: "Pending",

        technicianCancelled: true,
      };


      setTechnicianCancelledBooking(
        cancelledBooking
      );


      setShowTechnicianCancelPopup(
        true
      );


      // -----------------------------------------------------
      // Refresh bookings in background
      // -----------------------------------------------------

      fetchBookings();

    };


    // Listen for technician cancellation
    socket.on(
      "technician-job-cancelled",
      handleTechnicianCancellation
    );


    // Cleanup listener
    return () => {

      socket.off(
        "technician-job-cancelled",
        handleTechnicianCancellation
      );

    };

  }, []);


  // =========================================================
  // FETCH CUSTOMER BOOKINGS
  // =========================================================

  const fetchBookings = async () => {

    try {

      setLoading(true);


      const token =
        localStorage.getItem("token");


      if (!token) {

        console.error(
          "No authentication token found."
        );

        setBookings([]);

        return;
      }


      const response =
        await api.get(
          "/bookings/my-bookings",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const bookingsData =
        response.data.bookings || [];


      console.log(
        "Customer bookings:",
        bookingsData
      );


      setBookings(
        bookingsData
      );


      // =====================================================
      // CHECK REVIEWS
      // =====================================================

      const completedPaidBookings =
        bookingsData.filter(
          (booking) =>
            booking.status ===
              "Completed" &&
            booking.paymentStatus ===
              "Paid"
        );


      if (
        completedPaidBookings.length >
        0
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
                          Authorization:
                            `Bearer ${token}`,
                        },
                      }
                    );


                  return reviewResponse
                    .data
                    .reviewed
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


  // =========================================================
  // TAB CLICK FUNCTIONS
  // =========================================================

  const handleUpcomingClick = () => {

    setActiveTab("Upcoming");

  };


  const handleActiveClick = () => {

    setActiveTab("Active");

  };


  const handleCompletedClick = () => {

    setActiveTab("Completed");

  };


  const handleCancelledClick = () => {

    setActiveTab("Cancelled");

  };


  // =========================================================
  // FILTER BOOKINGS BASED ON ACTIVE TAB
  // =========================================================

  const filteredBookings = useMemo(() => {

    if (activeTab === "Upcoming") {

      return bookings.filter(
        (booking) =>
          booking.status ===
          "Pending"
      );

    }


    if (activeTab === "Active") {

      return bookings.filter(
        (booking) =>
          [
            "Accepted",
            "On The Way",
            "In Progress",
          ].includes(
            booking.status
          )
      );

    }


    if (activeTab === "Completed") {

      return bookings.filter(
        (booking) =>
          booking.status ===
          "Completed"
      );

    }


    if (activeTab === "Cancelled") {

      return bookings.filter(
        (booking) =>
          booking.status ===
          "Cancelled"
      );

    }


    return bookings;

  }, [
    bookings,
    activeTab,
  ]);


  // =========================================================
  // REMOVE BOOKING FROM MY BOOKINGS
  //
  // IMPORTANT:
  //
  // This is a SOFT DELETE.
  //
  // The booking is NOT permanently deleted.
  //
  // It should remain available in Booking History.
  // =========================================================

  const removeFromMyBookings =
    async (booking) => {

      // -----------------------------------------------------
      // Safety check
      // -----------------------------------------------------

      if (!booking?._id) {

        alert(
          "Invalid booking."
        );

        return;

      }


      // -----------------------------------------------------
      // Confirmation
      // -----------------------------------------------------

      const confirmed =
        window.confirm(
          "Remove this booking from My Bookings?\n\nThe booking will not be permanently deleted. You can still view it in Booking History."
        );


      if (!confirmed) {

        return;

      }


      try {

        setRemovingBookingId(
          booking._id
        );


        const token =
          localStorage.getItem(
            "token"
          );


        if (!token) {

          alert(
            "Please login again."
          );

          return;

        }


        // ---------------------------------------------------
        // SOFT DELETE API
        // ---------------------------------------------------

        await api.put(

          `/bookings/${booking._id}/remove-from-my-bookings`,

          {},

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );


        // ---------------------------------------------------
        // Immediately remove from current UI
        // ---------------------------------------------------

        setBookings(
          (previousBookings) =>
            previousBookings.filter(
              (item) =>
                item._id !==
                booking._id
            )
        );


        // ---------------------------------------------------
        // Remove from review tracking too
        // ---------------------------------------------------

        setReviewedBookings(
          (previousReviewed) =>
            previousReviewed.filter(
              (id) =>
                id !== booking._id
            )
        );


        console.log(
          "Booking removed from My Bookings:",
          booking._id
        );


      } catch (error) {

        console.error(
          "Remove Booking Error:",
          error
        );


        alert(
          error?.response?.data?.message ||
          "Failed to remove booking from My Bookings."
        );

      } finally {

        setRemovingBookingId(
          null
        );

      }

    };


  // =========================================================
  // CLOSE TECHNICIAN CANCEL POPUP
  // =========================================================

  const closeTechnicianCancelPopup =
    () => {

      setShowTechnicianCancelPopup(
        false
      );

      setTechnicianCancelledBooking(
        null
      );

    };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {

      return "Date not available";

    }


    try {

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }
      );

    } catch {

      return "Date not available";

    }

  };


  // =========================================================
  // EMPTY TAB MESSAGE
  // =========================================================

  const getEmptyMessage = () => {

    if (
      activeTab ===
      "Upcoming"
    ) {

      return {
        title:
          "No Upcoming Bookings",
        text:
          "You don't have any pending bookings right now.",
      };

    }


    if (
      activeTab ===
      "Active"
    ) {

      return {
        title:
          "No Active Bookings",
        text:
          "You don't have any active service bookings right now.",
      };

    }


    if (
      activeTab ===
      "Completed"
    ) {

      return {
        title:
          "No Completed Bookings",
        text:
          "You don't have any completed bookings yet.",
      };

    }


    return {
      title:
        "No Cancelled Bookings",
      text:
        "You don't have any cancelled bookings.",
    };

  };


  // =========================================================
  // LOADING SCREEN
  // =========================================================

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


  // =========================================================
  // EMPTY MESSAGE
  // =========================================================

  const emptyMessage =
    getEmptyMessage();


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <>

      <Navbar />


      {/* ===================================================
          TECHNICIAN CANCELLATION POPUP
      =================================================== */}

      {showTechnicianCancelPopup &&
        technicianCancelledBooking && (

        <div
          className="technician-cancel-overlay"

          onClick={
            closeTechnicianCancelPopup
          }
        >

          <motion.div

            className="technician-cancel-popup"

            initial={{
              opacity: 0,
              scale: 0.9,
            }}

            animate={{
              opacity: 1,
              scale: 1,
            }}

            transition={{
              duration: 0.25,
            }}

            onClick={(event) =>
              event.stopPropagation()
            }

          >

            {/* Close */}

            <button
              type="button"

              className="technician-cancel-close"

              onClick={
                closeTechnicianCancelPopup
              }

            >

              <FiX />

            </button>


            {/* Icon */}

            <div className="technician-cancel-icon">

              <FiAlertTriangle />

            </div>


            {/* Heading */}

            <h2>
              Technician Cancelled
            </h2>


            <p className="technician-cancel-service">

              {
                technicianCancelledBooking
                  .service?.name ||
                "Home Service"
              }

            </p>


            {/* Message */}

            <p className="technician-cancel-message">

              The assigned technician
              cancelled this request.

            </p>


            <div className="technician-cancel-info">

              We are trying to find
              another technician for you.

            </div>


            {/* Booking */}

            {technicianCancelledBooking.bookingId && (

              <p className="technician-cancel-booking-id">

                Booking ID:{" "}

                <strong>
                  {
                    technicianCancelledBooking
                      .bookingId
                  }
                </strong>

              </p>

            )}


            {/* Button */}

            <button

              type="button"

              className="technician-cancel-ok"

              onClick={
                closeTechnicianCancelPopup
              }

            >

              Okay

            </button>

          </motion.div>

        </div>

      )}


      {/* ===================================================
          PAGE
      =================================================== */}

      <main className="bookings-page">

        <div className="bookings-container">


          {/* =================================================
              HEADER
          ================================================= */}

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

            <h1>
              My Bookings
            </h1>


            <p>
              View and manage all your
              Fixora service bookings.
            </p>

          </motion.div>


          {/* =================================================
              TABS
          ================================================= */}

          <div className="booking-tabs">


            {/* UPCOMING */}

            <button

              type="button"

              className={
                activeTab ===
                "Upcoming"
                  ? "active-tab"
                  : ""
              }

              onClick={
                handleUpcomingClick
              }

            >

              Upcoming

            </button>


            {/* ACTIVE */}

            <button

              type="button"

              className={
                activeTab ===
                "Active"
                  ? "active-tab"
                  : ""
              }

              onClick={
                handleActiveClick
              }

            >

              Active

            </button>


            {/* COMPLETED */}

            <button

              type="button"

              className={
                activeTab ===
                "Completed"
                  ? "active-tab"
                  : ""
              }

              onClick={
                handleCompletedClick
              }

            >

              Completed

            </button>


            {/* CANCELLED */}

            <button

              type="button"

              className={
                activeTab ===
                "Cancelled"
                  ? "active-tab"
                  : ""
              }

              onClick={
                handleCancelledClick
              }

            >

              Cancelled

            </button>


          </div>


          {/* =================================================
              BOOKINGS LIST
          ================================================= */}

          <div className="bookings-list">


            {/* =================================================
                NO BOOKINGS
            ================================================= */}

            {filteredBookings.length === 0 ? (

              <motion.div

                className="no-bookings"

                initial={{
                  opacity: 0,
                  y: 20,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

              >

                <h2>
                  {emptyMessage.title}
                </h2>


                <p>
                  {emptyMessage.text}
                </p>

              </motion.div>

            ) : (


              /* =================================================
                 BOOKINGS
              ================================================= */

              filteredBookings.map(
                (booking, index) => (

                  <motion.div

                    key={
                      booking._id
                    }

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


                    {/* =================================================
                        BOOKING HEADER
                    ================================================= */}

                    <div className="booking-header-row">


                      <div className="booking-service">

                        <h2>

                          {
                            booking
                              .service
                              ?.name ||
                            "Home Service"
                          }

                        </h2>


                        <p>

                          Booking ID:{" "}

                          <strong>
                            {
                              booking
                                .bookingId ||
                              booking._id
                            }
                          </strong>

                        </p>

                      </div>


                      {/* STATUS */}

                      <div

                        className={
                          `booking-status status-${String(
                            booking.status ||
                            ""
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`
                        }

                      >

                        {
                          booking.status ||
                          "Pending"
                        }

                      </div>

                    </div>


                    {/* =================================================
                        BOOKING DETAILS
                    ================================================= */}

                    <div className="booking-details-grid">


                      {/* DATE */}

                      <div className="booking-detail-item">

                        <FiCalendar />

                        <div>

                          <span>
                            Date
                          </span>

                          <strong>

                            {
                              formatDate(
                                booking.bookingDate
                              )
                            }

                          </strong>

                        </div>

                      </div>


                      {/* TIME */}

                      <div className="booking-detail-item">

                        <FiClock />

                        <div>

                          <span>
                            Time
                          </span>

                          <strong>

                            {
                              booking.bookingTime ||
                              "Time not available"
                            }

                          </strong>

                        </div>

                      </div>


                      {/* ADDRESS */}

                      <div className="booking-detail-item">

                        <FiMapPin />

                        <div>

                          <span>
                            Address
                          </span>

                          <strong>

                            {
                              booking.address ||
                              "Address not available"
                            }

                          </strong>

                        </div>

                      </div>


                      {/* PRICE */}

                      <div className="booking-detail-item">

                        <div className="price-symbol">
                          ₹
                        </div>

                        <div>

                          <span>
                            Price
                          </span>

                          <strong>

                            ₹
                            {
                              Number(
                                booking.price ||
                                0
                              ).toLocaleString(
                                "en-IN"
                              )
                            }

                          </strong>

                        </div>

                      </div>


                    </div>


                    {/* =================================================
                        ASSIGNED TECHNICIAN
                    ================================================= */}

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
                                .name ||
                              "Technician"
                            }

                          </span>

                        </div>


                        <div className="tech-info">

                          <FiPhone />

                          <span>

                            {
                              booking
                                .technician
                                .phone ||
                              "Phone not available"
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
                              "Professional"
                            }

                          </span>

                        </div>

                      </div>

                    )}


                    {/* =================================================
                        STATUS PROGRESS
                    ================================================= */}

                    <div className="status-progress">


                      {/* PENDING */}

                      <div

                        className={
                          `step ${
                            booking.status !==
                            "Cancelled"
                              ? "active"
                              : ""
                          }`
                        }

                      >

                        Pending

                      </div>


                      {/* ACCEPTED */}

                      <div

                        className={
                          `step ${
                            [
                              "Accepted",
                              "On The Way",
                              "In Progress",
                              "Completed",
                            ].includes(
                              booking.status
                            )
                              ? "active"
                              : ""
                          }`
                        }

                      >

                        Accepted

                      </div>


                      {/* IN PROGRESS */}

                      <div

                        className={
                          `step ${
                            [
                              "In Progress",
                              "Completed",
                            ].includes(
                              booking.status
                            )
                              ? "active"
                              : ""
                          }`
                        }

                      >

                        In Progress

                      </div>


                      {/* COMPLETED */}

                      <div

                        className={
                          `step ${
                            booking.status ===
                            "Completed"
                              ? "active"
                              : ""
                          }`
                        }

                      >

                        Completed

                      </div>


                    </div>


                    {/* =================================================
                        FOOTER BUTTONS
                    ================================================= */}

                    <div className="booking-footer">


                      {/* =================================================
                          TRACK BOOKING
                      ================================================= */}

                      <Link

                        to={
                          `/track-booking/${booking._id}`
                        }

                        className="details-btn"

                      >

                        Track Booking

                      </Link>


                      {/* =================================================
                          REVIEW
                      ================================================= */}

                      {booking.status ===
                        "Completed" &&
                        booking.paymentStatus ===
                          "Paid" && (

                        reviewedBookings.includes(
                          booking._id
                        ) ? (

                          <button

                            type="button"

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


                      {/* =================================================
                          REMOVE FROM MY BOOKINGS
                      ================================================= */}

                      <button

                        type="button"

                        className="remove-history-btn"

                        disabled={
                          removingBookingId ===
                          booking._id
                        }

                        onClick={() =>
                          removeFromMyBookings(
                            booking
                          )
                        }

                      >

                        <FiTrash2 />

                        {
                          removingBookingId ===
                          booking._id
                            ? "Removing..."
                            : "Remove"
                        }

                      </button>


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


// =========================================================
// IMPORTANT
// This fixes:
// "does not provide an export named 'default'"
// =========================================================

export default MyBookings;