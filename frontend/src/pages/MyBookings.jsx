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
  // FiHistory,
  FiTrash2,
} from "react-icons/fi";

import api from "../api/axios";
import socket from "../socket";
import Navbar from "../components/Navbar/Navbar";

import "./MyBookings.css";


const MyBookings = () => {

  const [bookings, setBookings] =
    useState([]);

  const [reviewedBookings, setReviewedBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
    =========================================================
    CUSTOMER BOOKING HISTORY
  =========================================================
  */

  const [removingBookingId, setRemovingBookingId] =
    useState(null);


  /*
    =========================================================
    TECHNICIAN CANCELLATION POPUP
  =========================================================
  */

  const [
    technicianCancelledBooking,
    setTechnicianCancelledBooking,
  ] = useState(null);


  const [
    showTechnicianCancelPopup,
    setShowTechnicianCancelPopup,
  ] = useState(false);


  /*
    =========================================================
    INITIAL LOAD
  =========================================================
  */

  useEffect(() => {

    fetchBookings();

  }, []);


  /*
    =========================================================
    CUSTOMER JOINS BOOKING ROOMS
  =========================================================
  */

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


  /*
    =========================================================
    REAL-TIME TECHNICIAN CANCELLATION
  =========================================================
  */

  useEffect(() => {

    const handleTechnicianCancellation =
      (data) => {

        console.log(
          "🔔 Technician cancellation received:",
          data
        );


        if (
          !data ||
          !data.bookingId
        ) {

          console.log(
            "Invalid technician cancellation data"
          );

          return;

        }


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


        setTechnicianCancelledBooking(
          cancelledBooking
        );


        setShowTechnicianCancelPopup(
          true
        );


        fetchBookings();

      };


    socket.on(
      "technician-job-cancelled",
      handleTechnicianCancellation
    );


    return () => {

      socket.off(
        "technician-job-cancelled",
        handleTechnicianCancellation
      );

    };

  }, []);


  /*
    =========================================================
    FETCH BOOKINGS
    =========================================================
  */

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


      setBookings(
        bookingsData
      );


      /*
        =====================================================
        REVIEW CHECKS
        =====================================================
      */

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


  /*
    =========================================================
    REMOVE BOOKING FROM MY BOOKINGS
    =========================================================

    This is a SOFT DELETE.

    It does NOT delete the booking
    from MongoDB.

    It only hides the booking from
    My Bookings.

    The customer can still see it
    inside Booking History.
  =========================================================
  */

  const removeFromMyBookings =
    async (booking) => {

      /*
        Only Completed or Cancelled
        bookings can be removed.
      */

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


      /*
        Confirmation
      */

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


        /*
          Backend soft-delete request.
        */

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


        /*
          Immediately remove it
          from the current UI.
        */

        setBookings(
          (previousBookings) =>
            previousBookings.filter(
              (item) =>
                item._id !==
                booking._id
            )
        );


        /*
          Also remove it from the
          local review list.
        */

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


  /*
    =========================================================
    CLOSE TECHNICIAN CANCEL POPUP
    =========================================================
  */

  const closeTechnicianCancelPopup =
    () => {

      setShowTechnicianCancelPopup(
        false
      );

      setTechnicianCancelledBooking(
        null
      );

    };


  /*
    =========================================================
    LOADING
    =========================================================
  */

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


  /*
    =========================================================
    MAIN UI
    =========================================================
  */

  return (

    <>

      <Navbar />


      {/* =====================================================
          TECHNICIAN CANCELLED POPUP
      ===================================================== */}

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

            {/* CLOSE BUTTON */}

            <button
              type="button"

              className=
                "technician-cancel-close"

              onClick={
                closeTechnicianCancelPopup
              }
            >

              <FiX />

            </button>


            {/* WARNING ICON */}

            <div
              className=
                "technician-cancel-icon"
            >

              <FiAlertTriangle />

            </div>


            {/* TITLE */}

            <h2>
              Technician Cancelled
            </h2>


            {/* MESSAGE */}

            <p>

              The assigned technician has
              cancelled this booking.

            </p>


            {/* SEARCHING MESSAGE */}

            <div
              className=
                "technician-searching-box"
            >

              <div
                className=
                  "searching-dot"
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


            {/* BOOKING INFORMATION */}

            <div
              className=
                "cancelled-booking-info"
            >

              <div>

                <span>
                  Service
                </span>


                <strong>

                  {
                    technicianCancelledBooking
                      .service
                      ?.name ||
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
                    ).toLocaleDateString(
                      "en-IN"
                    )}

                  </strong>

                </div>

              )}

            </div>


            {/* OK BUTTON */}

            <button
              type="button"

              className=
                "technician-cancel-ok-btn"

              onClick={
                closeTechnicianCancelPopup
              }
            >

              Okay

            </button>

          </motion.div>

        </div>

      )}


      {/* =====================================================
          BOOKINGS PAGE
      ===================================================== */}

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

            {/* ================================================
                VIEW HISTORY BUTTON
            ================================================ */}

            <div
              className="history-button-wrapper"
            >

              <Link
                to="/booking-history"
                className="history-button"
              >

                {/* <FiHistory /> */}

                <FiClock />

                View History

              </Link>

            </div>


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

            <button
              className="active-tab"
            >
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


          {/* =================================================
              BOOKINGS LIST
          ================================================= */}

          <div className="bookings-list">

            {bookings.length === 0 ? (

              <div
                className="no-bookings"
              >

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
                (
                  booking,
                  index
                ) => (

                  <motion.div

                    key={
                      booking._id
                    }

                    className=
                      "booking-card"

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
                      className=
                        "booking-top"
                    >

                      <div>

                        <h2>

                          {
                            booking
                              .service
                              ?.name
                          }

                        </h2>


                        <p
                          className=
                            "booking-id"
                        >

                          Booking ID :{" "}

                          {
                            booking.bookingId
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
                        className=
                          "technician-cancelled-banner"
                      >

                        <div
                          className=
                            "technician-cancelled-banner-icon"
                        >

                          <FiAlertTriangle />

                        </div>


                        <div>

                          <strong>

                            Technician cancelled
                            this booking

                          </strong>


                          <span>

                            Fixora is trying to
                            find another technician
                            for you.

                          </span>

                        </div>

                      </div>

                    )}


                    {/* =========================================
                        BOOKING DETAILS
                    ========================================= */}

                    <div
                      className=
                        "booking-details"
                    >

                      {/* DATE */}

                      <div
                        className=
                          "detail-item"
                      >

                        <FiCalendar />

                        <span>

                          {new Date(
                            booking
                              .bookingDate
                          ).toLocaleDateString(
                            "en-IN"
                          )}

                        </span>

                      </div>


                      {/* TIME */}

                      <div
                        className=
                          "detail-item"
                      >

                        <FiClock />

                        <span>

                          {
                            booking
                              .bookingTime
                          }

                        </span>

                      </div>


                      {/* ADDRESS */}

                      <div
                        className=
                          "detail-item"
                      >

                        <FiMapPin />

                        <span>

                          {
                            booking
                              .address
                          }

                        </span>

                      </div>

                    </div>


                    {/* =========================================
                        TECHNICIAN
                    ========================================= */}

                    {booking
                      .technician && (

                      <div
                        className=
                          "technician-card"
                      >

                        <h3>
                          Assigned Professional
                        </h3>


                        <div
                          className=
                            "tech-info"
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


                        <div
                          className=
                            "tech-info"
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


                        <div
                          className=
                            "tech-info"
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
                      className=
                        "status-progress"
                    >

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
                      className=
                        "booking-footer"
                    >


                      {/* =======================================
                          TRACK BOOKING
                      ======================================= */}

                      <Link
                        to={
                          `/track-booking/${booking._id}`
                        }

                        className=
                          "details-btn"
                      >

                        Track Booking

                      </Link>


                      {/* =======================================
                          REVIEW
                      ======================================= */}

                      {booking.status ===
                        "Completed" &&
                        booking.paymentStatus ===
                          "Paid" && (

                        reviewedBookings.includes(
                          booking._id
                        ) ? (

                          <button
                            className=
                              "review-submitted-btn"

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

                            className=
                              "review-btn"
                          >

                            Rate Service

                          </Link>

                        )

                      )}


                      {/* =======================================
                          REMOVE FROM MY BOOKINGS
                      ======================================= */}

                      {(
                        booking.status ===
                          "Completed" ||
                        booking.status ===
                          "Cancelled"
                      ) && (

                        <button
                          type="button"

                          className=
                            "remove-history-btn"

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