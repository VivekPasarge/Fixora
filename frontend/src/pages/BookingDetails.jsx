import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiTool,
  FiCheckCircle,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../api/axios";

import Navbar from "../components/Navbar/Navbar";

import "./BookingDetails.css";


const BookingDetails = () => {

  /* =========================================================
     GET BOOKING ID FROM URL
  ========================================================= */

  const { id } = useParams();

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================================
     FETCH BOOKING
  ========================================================= */

  useEffect(() => {

    const fetchBooking = async () => {

      try {

        setLoading(true);

        setError("");

        const token =
          localStorage.getItem("token");


        const response = await api.get(
          `/bookings/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        console.log(
          "Booking Details:",
          response.data
        );


        /*
          Backend may return:

          {
            booking: {...}
          }

          So we safely support that structure.
        */

        const bookingData =
          response.data.booking ||
          response.data;


        setBooking(bookingData);

      } catch (error) {

        console.log(
          "Booking Details Error:",
          error
        );


        setError(
          error.response?.data?.message ||
            "Failed to load booking details."
        );

      } finally {

        setLoading(false);

      }

    };


    if (id) {
      fetchBooking();
    }

  }, [id]);


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "N/A";
    }


    const formattedDate =
      new Date(date);


    if (
      isNaN(
        formattedDate.getTime()
      )
    ) {
      return "N/A";
    }


    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  };


  /* =========================================================
     FORMAT PRICE
  ========================================================= */

  const formatPrice = (price) => {

    if (
      price === undefined ||
      price === null
    ) {
      return "₹0";
    }


    return `₹${Number(price).toLocaleString(
      "en-IN"
    )}`;

  };


  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {

    if (!status) {
      return "";
    }


    return status
      .toLowerCase()
      .replace(/\s+/g, "-");

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <>

        <Navbar />

        <main className="booking-details-page">

          <div className="booking-details-container">

            <div className="booking-details-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading booking details...
              </p>

            </div>

          </div>

        </main>

      </>
    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !booking) {

    return (
      <>

        <Navbar />

        <main className="booking-details-page">

          <div className="booking-details-container">

            <div className="booking-details-error">

              <FiAlertCircle />

              <h2>
                Unable to load booking
              </h2>

              <p>
                {error ||
                  "Booking not found."}
              </p>


              <button
                type="button"
                className="back-btn"
                onClick={() =>
                  navigate(-1)
                }
              >

                <FiArrowLeft />

                Go Back

              </button>

            </div>

          </div>

        </main>

      </>
    );

  }


  /* =========================================================
     BOOKING DATA
  ========================================================= */

  const serviceName =
    booking.service?.name ||
    "Home Service";


  const customerName =
    booking.customer?.name ||
    "N/A";


  const customerPhone =
    booking.customer?.phone ||
    "N/A";


  const customerEmail =
    booking.customer?.email ||
    "N/A";


  const technicianName =
    booking.technician?.name ||
    "Not Assigned";


  const technicianPhone =
    booking.technician?.phone ||
    "N/A";


  const status =
    booking.status ||
    "Pending";


  const paymentMethod =
    booking.paymentMethod ||
    "Cash on Service";


  const paymentStatus =
    booking.paymentStatus ||
    "Pending";


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>

      <Navbar />


      <main className="booking-details-page">

        <div className="booking-details-container">


          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >

            <FiArrowLeft />

            Back

          </button>


          {/* =================================================
              HEADER
          ================================================= */}

          <motion.div
            className="details-header"

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

            <div>

              <h1>
                Booking Details
              </h1>

              <p>
                Complete information about
                this service booking.
              </p>

            </div>


            <span
              className={`booking-status ${getStatusClass(
                status
              )}`}
            >

              <FiCheckCircle />

              {status}

            </span>

          </motion.div>


          {/* =================================================
              SERVICE CARD
          ================================================= */}

          <motion.div
            className="service-details-card"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            transition={{
              delay: 0.2,
            }}
          >

            <div className="service-left">

              <div className="service-icon">

                <FiTool />

              </div>


              <div>

                <h2>
                  {serviceName}
                </h2>

                <p>
                  Professional Fixora
                  home service
                </p>

              </div>

            </div>


            <div className="service-right">

              <h2>
                {formatPrice(
                  booking.price
                )}
              </h2>

              <span>
                Service Price
              </span>

            </div>

          </motion.div>


          {/* =================================================
              DETAILS GRID
          ================================================= */}

          <div className="details-grid">


            {/* ===============================================
                CUSTOMER DETAILS
            =============================================== */}

            <motion.div
              className="info-card"

              initial={{
                opacity: 0,
                y: 25,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.3,
              }}
            >

              <h2>
                Customer Details
              </h2>


              <div className="info-row">

                <span>
                  <FiUser />
                  Name
                </span>

                <strong>
                  {customerName}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  <FiPhone />
                  Phone
                </span>

                <strong>
                  {customerPhone}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  <FiMail />
                  Email
                </span>

                <strong>
                  {customerEmail}
                </strong>

              </div>

            </motion.div>


            {/* ===============================================
                SERVICE ADDRESS
            =============================================== */}

            <motion.div
              className="info-card"

              initial={{
                opacity: 0,
                y: 25,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.4,
              }}
            >

              <h2>
                Service Address
              </h2>


              <div className="info-row">

                <span>
                  <FiMapPin />
                  Address
                </span>

                <strong>
                  {booking.address ||
                    "N/A"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  <FiMapPin />
                  City
                </span>

                <strong>
                  {booking.customer
                    ?.workingCity ||
                    "Bengaluru"}
                </strong>

              </div>

            </motion.div>


            {/* ===============================================
                SCHEDULE
            =============================================== */}

            <motion.div
              className="info-card"

              initial={{
                opacity: 0,
                y: 25,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.5,
              }}
            >

              <h2>
                Schedule
              </h2>


              <div className="info-row">

                <span>
                  <FiCalendar />
                  Date
                </span>

                <strong>
                  {formatDate(
                    booking.bookingDate
                  )}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  <FiClock />
                  Time
                </span>

                <strong>
                  {booking.bookingTime ||
                    "N/A"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  <FiUser />
                  Technician
                </span>

                <strong>
                  {technicianName}
                </strong>

              </div>

            </motion.div>


            {/* ===============================================
                PAYMENT
            =============================================== */}

            <motion.div
              className="info-card"

              initial={{
                opacity: 0,
                y: 25,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.6,
              }}
            >

              <h2>
                Payment Details
              </h2>


              <div className="info-row">

                <span>
                  <FiCreditCard />
                  Method
                </span>

                <strong>
                  {paymentMethod}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Total Amount
                </span>

                <strong>
                  {formatPrice(
                    booking.price
                  )}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Status
                </span>

                <strong
                  className={
                    paymentStatus === "Paid"
                      ? "payment-paid"
                      : "payment-pending"
                  }
                >
                  {paymentStatus}
                </strong>

              </div>

            </motion.div>


          </div>


          {/* =================================================
              TECHNICIAN INFORMATION
          ================================================= */}

          {booking.technician && (

            <motion.div
              className="info-card technician-details-card"

              initial={{
                opacity: 0,
                y: 25,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.7,
              }}
            >

              <h2>
                Assigned Technician
              </h2>


              <div className="info-row">

                <span>
                  Name
                </span>

                <strong>
                  {technicianName}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Phone
                </span>

                <strong>
                  {technicianPhone}
                </strong>

              </div>

            </motion.div>

          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="details-actions">


            {/* TRACK BOOKING */}

            <Link
              to={`/track-booking/${booking._id}`}
              className="track-btn"
            >
              Track Booking
            </Link>


            {/* BACK */}

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              Go Back
            </button>

          </div>


        </div>

      </main>

    </>
  );
};


export default BookingDetails;