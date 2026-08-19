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
  FiX,
  FiAlertTriangle,
  FiTrash2,
} from "react-icons/fi";

import api from "../api/axios";
import socket from "../socket";
import Navbar from "../components/Navbar/Navbar";

import "./MyBookings.css";


// =========================================================
// MY BOOKINGS
// =========================================================

const MyBookings = () => {

  // =======================================================
  // BOOKINGS
  // =======================================================

  const [bookings, setBookings] =
    useState([]);


  // =======================================================
  // REVIEWED BOOKINGS
  // =======================================================

  const [reviewedBookings, setReviewedBookings] =
    useState([]);


  // =======================================================
  // LOADING
  // =======================================================

  const [loading, setLoading] =
    useState(true);


  // =======================================================
  // ACTIVE TAB
  // =======================================================
  //
  // Upcoming
  // Active
  // Completed
  // Cancelled
  //
  // =======================================================

  const [activeTab, setActiveTab] =
    useState("Upcoming");


  // =======================================================
  // REMOVING BOOKING
  // =======================================================

  const [removingBookingId, setRemovingBookingId] =
    useState(null);


  // =======================================================
  // TECHNICIAN CANCELLATION POPUP
  // =======================================================

  const [
    technicianCancelledBooking,
    setTechnicianCancelledBooking,
  ] = useState(null);


  const [
    showTechnicianCancelPopup,
    setShowTechnicianCancelPopup,
  ] = useState(false);


  // =======================================================
  // FETCH BOOKINGS
  // =======================================================

  useEffect(() => {

    fetchBookings();

  }, []);


  // =======================================================
  // CUSTOMER JOINS BOOKING SOCKET ROOMS
  // =======================================================

  useEffect(() => {

    if (
      !bookings ||
      bookings.length === 0
    ) {
      return;
    }


    bookings.forEach(
      (booking) => {

        if (
          booking &&
          booking._id
        ) {

          socket.emit(
            "join-booking",
            booking._id
          );


          console.log(
            "📦 Customer joined booking room:",
            booking._id
          );

        }

      }
    );

  }, [bookings]);


  // =======================================================
  // REAL-TIME TECHNICIAN CANCELLATION
  // =======================================================

  useEffect(() => {

    const handleTechnicianCancellation =
      (data) => {

        console.log(
          "🔔 Technician cancellation received:",
          data
        );


        // -----------------------------------------------
        // Safety check
        // -----------------------------------------------

        if (
          !data ||
          !data.bookingId
        ) {

          console.log(
            "Invalid technician cancellation data"
          );

          return;

        }


        // -----------------------------------------------
        // Create popup booking information
        // -----------------------------------------------

        const cancelledBooking = {

          _id:
            data.bookingId,

          bookingId:
            data.bookingNumber ||
            "",

          service: {

            name:
              data.service ||
              "Home Service",

          },

          bookingDate:
            data.bookingDate ||
            null,

          status:
            "Pending",

          technicianCancelled:
            true,

        };


        // -----------------------------------------------
        // Save popup data
        // -----------------------------------------------

        setTechnicianCancelledBooking(
          cancelledBooking
        );


        // -----------------------------------------------
        // Show popup immediately
        // -----------------------------------------------

        setShowTechnicianCancelPopup(
          true
        );


        // -----------------------------------------------
        // Refresh booking list
        // -----------------------------------------------

        fetchBookings();

      };


    // -----------------------------------------------
    // Socket listener
    // -----------------------------------------------

    socket.on(
      "technician-job-cancelled",
      handleTechnicianCancellation
    );


    // -----------------------------------------------
    // Cleanup
    // -----------------------------------------------

    return () => {

      socket.off(
        "technician-job-cancelled",
        handleTechnicianCancellation
      );

    };

  }, []);


  // =======================================================
  // FETCH CUSTOMER BOOKINGS
  // =======================================================

  const fetchBookings = async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


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


      // -----------------------------------------------
      // Store bookings
      // -----------------------------------------------

      setBookings(
        bookingsData
      );


      // =================================================
      // CHECK REVIEWS
      // =================================================

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
          reviewResults.filter(
            Boolean
          )
        );


      } else {

        setReviewedBookings(
          []
        );

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


  // =======================================================
  // TAB CLICK FUNCTION
  // =======================================================
  //
  // This is the function that makes:
  //
  // Upcoming
  // Active
  // Completed
  // Cancelled
  //
  // clickable.
  //
  // =======================================================

  const handleTabChange =
    (tab) => {

      console.log(
        "Booking tab changed to:",
        tab
      );


      setActiveTab(
        tab
      );

    };


  // =======================================================
  // FILTER BOOKINGS
  // =======================================================
  //
  // Upcoming:
  // Pending
  //
  // Active:
  // Accepted
  // On The Way
  // In Progress
  //
  // Completed:
  // Completed
  //
  // Cancelled:
  // Cancelled
  //
  // =======================================================

  const filteredBookings =
    bookings.filter(
      (booking) => {

        // -----------------------------------------------
        // UPCOMING
        // -----------------------------------------------

        if (
          activeTab ===
          "Upcoming"
        ) {

          return (
            booking.status ===
            "Pending"
          );

        }


        // -----------------------------------------------
        // ACTIVE
        // -----------------------------------------------

        if (
          activeTab ===
          "Active"
        ) {

          return [
            "Accepted",
            "On The Way",
            "In Progress",
          ].includes(
            booking.status
          );

        }


        // -----------------------------------------------
        // COMPLETED
        // -----------------------------------------------

        if (
          activeTab ===
          "Completed"
        ) {

          return (
            booking.status ===
            "Completed"
          );

        }


        // -----------------------------------------------
        // CANCELLED
        // -----------------------------------------------

        if (
          activeTab ===
          "Cancelled"
        ) {

          return (
            booking.status ===
            "Cancelled"
          );

        }


        return true;

      }
    );


  // =======================================================
  // REMOVE BOOKING FROM MY BOOKINGS
  // =======================================================
  //
  // This is a SOFT DELETE.
  //
  // The booking remains in MongoDB.
  //
  // It disappears from My Bookings.
  //
  // It can remain available in Booking History.
  //
  // =======================================================

  const removeFromMyBookings =
    async (booking) => {

      // -----------------------------------------------
      // Only completed/cancelled bookings
      // -----------------------------------------------

      if (
        booking.status !==
          "Completed" &&
        booking.status !==
          "Cancelled"
      ) {

        alert(
          "Only completed or cancelled bookings can be removed from My Bookings."
        );

        return;

      }


      // -----------------------------------------------
      // Confirmation
      // -----------------------------------------------

      const confirmed =
        window.confirm(
          "Remove this booking from My Bookings?\n\nThe booking will not be permanently deleted. You can still view it in Booking History."
        );


      if (!confirmed) {

        return;

      }


      try {

        // ---------------------------------------------
        // Loading state
        // ---------------------------------------------

        setRemovingBookingId(
          booking._id
        );


        const token =
          localStorage.getItem(
            "token"
          );


        // ---------------------------------------------
        // Backend soft-delete request
        // ---------------------------------------------

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


        // ---------------------------------------------
        // Remove from current UI
        // ---------------------------------------------

        setBookings(
          (previousBookings) =>
            previousBookings.filter(
              (item) =>
                item._id !==
                booking._id
            )
        );


        // ---------------------------------------------
        // Remove from review list
        // ---------------------------------------------

        setReviewedBookings(
          (previousReviewed) =>
            previousReviewed.filter(
              (id) =>
                id !== booking._id
            )
        );


      } catch (error) {

        console.error(
          "Remove Booking Error:",
          error
        );


        alert(
          error.response?.data?.message ||
          "Failed to remove booking from My Bookings."
        );


      } finally {

        setRemovingBookingId(
          null
        );

      }

    };


  // =======================================================
  // CLOSE TECHNICIAN CANCEL POPUP
  // =======================================================

  const closeTechnicianCancelPopup =
    () => {

      setShowTechnicianCancelPopup(
        false
      );

      setTechnicianCancelledBooking(
        null
      );

    };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <>

        <Navbar />

        <main className="bookings-page">

          <div className="bookings-container">

            <div className="bookings-loading">

              <div
                className="loading-spinner"
              ></div>

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


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <>

      <Navbar />


      {/* =================================================
          TECHNICIAN CANCELLED POPUP
      ================================================= */}

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
              y: 20,
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}

            transition={{
              duration: 0.25,
            }}

            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* -----------------------------------------
                CLOSE
            ----------------------------------------- */}

            <button
              type="button"

              className="technician-cancel-close"

              onClick={
                closeTechnicianCancelPopup
              }
            >

              <FiX />

            </button>


            {/* -----------------------------------------
                WARNING ICON
            ----------------------------------------- */}

            <div
              className="technician-cancel-icon"
            >

              <FiAlertTriangle />

            </div>


            {/* -----------------------------------------
                TITLE
            ----------------------------------------- */}

            <h2>
              Technician Cancelled
            </h2>


            {/* -----------------------------------------
                MESSAGE
            ----------------------------------------- */}

            <p>

              The assigned technician has
              cancelled this booking.

            </p>


            {/* -----------------------------------------
                SEARCHING
            ----------------------------------------- */}

            <div
              className="technician-searching-box"
            >

              <div
                className="searching-dot"
              ></div>


              <div>

                <strong>
                  Finding another technician
                </strong>

                <span>

                  Don't worry. Fixora is trying
                  to find another available
                  technician for you.

                </span>

              </div>

            </div>


            {/* -----------------------------------------
                BOOKING DETAILS
            ----------------------------------------- */}

            <div
              className="cancelled-booking-info"
            >

              <div>

                <span>
                  Service
                </span>

                <strong>

                  {
                    technicianCancelledBooking
                      .service?.name ||
                    "Home Service"
                  }

                </strong>

              </div>


              {technicianCancelledBooking
                .bookingDate && (

                <div>

                  <span>
                    Service Date
                  </span>

                  <strong>

                    {new Date(
                      technicianCancelledBooking
                        .bookingDate
                    ).toLocaleDateString()}

                  </strong>

                </div>

              )}

            </div>


            {/* -----------------------------------------
                OK
            ----------------------------------------- */}

            <button
              type="button"

              className="technician-cancel-ok-btn"

              onClick={
                closeTechnicianCancelPopup
              }
            >

              Okay

            </button>

          </motion.div>

        </div>

      )}


      {/* =================================================
          BOOKINGS PAGE
      ================================================= */}

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
              CLICKABLE TABS
          ================================================= */}

          <div className="booking-tabs">


            {/* -----------------------------------------------
                UPCOMING
            ----------------------------------------------- */}

            <button

              type="button"

              className={
                activeTab ===
                "Upcoming"
                  ? "active-tab"
                  : ""
              }

              onClick={() =>
                handleTabChange(
                  "Upcoming"
                )
              }
            >

              Upcoming

            </button>


            {/* -----------------------------------------------
                ACTIVE
            ----------------------------------------------- */}

            <button

              type="button"

              className={
                activeTab ===
                "Active"
                  ? "active-tab"
                  : ""
              }

              onClick={() =>
                handleTabChange(
                  "Active"
                )
              }
            >

              Active

            </button>


            {/* -----------------------------------------------
                COMPLETED
            ----------------------------------------------- */}

            <button

              type="button"

              className={
                activeTab ===
                "Completed"
                  ? "active-tab"
                  : ""
              }

              onClick={() =>
                handleTabChange(
                  "Completed"
                )
              }
            >

              Completed

            </button>


            {/* -----------------------------------------------
                CANCELLED
            ----------------------------------------------- */}

            <button

              type="button"

              className={
                activeTab ===
                "Cancelled"
                  ? "active-tab"
                  : ""
              }

              onClick={() =>
                handleTabChange(
                  "Cancelled"
                )
              }
            >

              Cancelled

            </button>


          </div>


          {/* =================================================
              BOOKINGS LIST
          ================================================= */}

          <div className="bookings-list">


            {filteredBookings.length === 0 ? (

              <div
                className="no-bookings"
              >

                <h2>

                  No {activeTab} Bookings

                </h2>

                <p>

                  You don't have any{" "}
                  {activeTab.toLowerCase()}{" "}
                  bookings.

                </p>

              </div>

            ) : (

              filteredBookings.map(
                (
                  booking,
                  index
                ) => (

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
                          index *
                            0.05,
                          0.3
                        ),
                    }}
                  >


                    {/* =========================================
                        BOOKING HEADER
                    ========================================= */}

                    <div
                      className="booking-top"
                    >

                      <div>

                        <h2>

                          {
                            booking
                              .service
                              ?.name ||
                            "Home Service"
                          }

                        </h2>


                        <p
                          className="booking-id"
                        >

                          Booking ID :{" "}

                          {
                            booking
                              .bookingId
                          }

                        </p>

                      </div>


                      <span
                        className={
                          `status-badge ${
                            booking.status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )
                          }`
                        }
                      >

                        {
                          booking.status
                        }

                      </span>

                    </div>


                    {/* =========================================
                        TECHNICIAN CANCELLED BANNER
                    ========================================= */}

                    {booking
                      .technicianCancelled &&
                      booking.status ===
                        "Pending" && (

                      <div
                        className="technician-cancelled-banner"
                      >

                        <FiAlertTriangle />

                        <div>

                          <strong>
                            Technician cancelled
                          </strong>

                          <span>

                            We are trying to find
                            another technician
                            for you.

                          </span>

                        </div>

                      </div>

                    )}


                    {/* =========================================
                        BOOKING DETAILS
                    ========================================= */}

                    <div
                      className="booking-details"
                    >


                      {/* DATE */}

                      <div
                        className="detail-item"
                      >

                        <FiCalendar />

                        <span>

                          {booking.bookingDate
                            ? new Date(
                                booking
                                  .bookingDate
                              ).toLocaleDateString()
                            : "N/A"}

                        </span>

                      </div>


                      {/* TIME */}

                      <div
                        className="detail-item"
                      >

                        <FiClock />

                        <span>

                          {
                            booking
                              .bookingTime ||
                            "N/A"
                          }

                        </span>

                      </div>


                      {/* ADDRESS */}

                      <div
                        className="detail-item"
                      >

                        <FiMapPin />

                        <span>

                          {
                            booking
                              .address ||
                            "N/A"
                          }

                        </span>

                      </div>


                    </div>


                    {/* =========================================
                        TECHNICIAN
                    ========================================= */}

                    {booking.technician && (

                      <div
                        className="technician-card"
                      >

                        <h3>
                          Assigned Professional
                        </h3>


                        {/* NAME */}

                        <div
                          className="tech-info"
                        >

                          <FiUser />

                          <span>

                            {
                              booking
                                .technician
                                .name
                            }

                          </span>

                        </div>


                        {/* PHONE */}

                        <div
                          className="tech-info"
                        >

                          <FiPhone />

                          <span>

                            {
                              booking
                                .technician
                                .phone
                            }

                          </span>

                        </div>


                        {/* PROFESSION */}

                        <div
                          className="tech-info"
                        >

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


                    {/* =========================================
                        STATUS PROGRESS
                    ========================================= */}

                    <div
                      className="status-progress"
                    >


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


                    {/* =========================================
                        FOOTER
                    ========================================= */}

                    <div
                      className="booking-footer"
                    >


                      {/* ---------------------------------------
                          TRACK BOOKING
                      --------------------------------------- */}

                      <Link

                        to={
                          `/track-booking/${booking._id}`
                        }

                        className="details-btn"
                      >

                        Track Booking

                      </Link>


                      {/* ---------------------------------------
                          REVIEW
                      --------------------------------------- */}

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


                      {/* ---------------------------------------
                          REMOVE FROM MY BOOKINGS
                      --------------------------------------- */}

                      {(booking.status ===
                        "Completed" ||
                        booking.status ===
                          "Cancelled") && (

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