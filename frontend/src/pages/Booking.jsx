import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCalendar,
  FiCreditCard,
  FiHome,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";

import "./Booking.css";

const Booking = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Date Warning Popup State
  // ==========================================

  const [showDateWarning, setShowDateWarning] =
    useState(false);

  const [warningDate, setWarningDate] =
    useState("");

  // ==========================================
  // Booking Data
  // ==========================================

  const [bookingData, setBookingData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    date: "",
    time: "",
    instructions: "",
    paymentMethod: "Cash on Service",
  });

  // ==========================================
  // Get Today's Date
  // ==========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // Get Date After N Days
  // ==========================================

  const getDateAfterDays = (days) => {
    const date = new Date();

    date.setDate(
      date.getDate() + days
    );

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // Check If Booking Is More Than 3 Days Away
  // ==========================================

  const isBookingBeyondTechnicianWindow = (
    selectedDate
  ) => {
    const lastAllowedDate =
      getDateAfterDays(3);

    return selectedDate > lastAllowedDate;
  };

  // ==========================================
  // Get Current Time In Minutes
  // ==========================================

  const getCurrentTimeInMinutes = () => {
    const now = new Date();

    return (
      now.getHours() * 60 +
      now.getMinutes()
    );
  };

  // ==========================================
  // Convert Time To Minutes
  // Example: 02:00 PM → 840
  // ==========================================

  const convertTimeToMinutes = (
    time
  ) => {
    if (!time) return null;

    const [
      timePart,
      modifier,
    ] = time.split(" ");

    let [
      hours,
      minutes,
    ] = timePart
      .split(":")
      .map(Number);

    if (
      modifier === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      modifier === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }

    return (
      hours * 60 +
      minutes
    );
  };

  // ==========================================
  // Format Date For Popup
  // ==========================================

  const formatBookingDate = (
    dateString
  ) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // Fetch Service
  // ==========================================

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response =
          await api.get(
            `/services/${id}`
          );

        setService(
          response.data.service
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // ==========================================
  // Handle Input Changes
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    // ==========================================
    // DATE
    // ==========================================

    if (name === "date") {
      const today =
        getTodayDate();

      const maxDate =
        getDateAfterDays(30);

      // ------------------------------------------
      // Prevent Past Dates
      // ------------------------------------------

      if (value < today) {
        alert(
          "Please select today or a future date."
        );

        return;
      }

      // ------------------------------------------
      // Prevent Dates More Than 30 Days Away
      // ------------------------------------------

      if (value > maxDate) {
        alert(
          "You can book a service only up to 30 days from today."
        );

        return;
      }

      // ------------------------------------------
      // Check Today's Time
      // ------------------------------------------

      if (
        value === today &&
        bookingData.time
      ) {
        const selectedTime =
          convertTimeToMinutes(
            bookingData.time
          );

        const currentTime =
          getCurrentTimeInMinutes();

        if (
          selectedTime <=
          currentTime
        ) {
          setBookingData({
            ...bookingData,
            date: value,
            time: "",
          });

          alert(
            "The selected time has already passed. Please choose another time."
          );

          return;
        }
      }

      // ------------------------------------------
      // Update Date
      // ------------------------------------------

      setBookingData({
        ...bookingData,
        date: value,
      });

      // ------------------------------------------
      // Existing Technician Window
      // ------------------------------------------

      if (
        isBookingBeyondTechnicianWindow(
          value
        )
      ) {
        setWarningDate(value);

        setShowDateWarning(
          true
        );
      } else {
        setWarningDate("");

        setShowDateWarning(
          false
        );
      }

      return;
    }

    // ==========================================
    // TIME
    // ==========================================

    if (name === "time") {
      const today =
        getTodayDate();

      // ------------------------------------------
      // If Booking Is Today
      // ------------------------------------------

      if (
        bookingData.date ===
        today
      ) {
        const selectedTime =
          convertTimeToMinutes(
            value
          );

        const currentTime =
          getCurrentTimeInMinutes();

        if (
          selectedTime !==
            null &&
          selectedTime <=
            currentTime
        ) {
          alert(
            "This time has already passed. Please select a future time."
          );

          return;
        }
      }

      setBookingData({
        ...bookingData,
        time: value,
      });

      return;
    }

    // ==========================================
    // Other Fields
    // ==========================================

    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };

  // ==========================================
  // Validate Booking
  // ==========================================

  const validateBooking = () => {
    const today =
      getTodayDate();

    const maxDate =
      getDateAfterDays(30);

    // ------------------------------------------
    // Date Required
    // ------------------------------------------

    if (!bookingData.date) {
      alert(
        "Please select a booking date."
      );

      return false;
    }

    // ------------------------------------------
    // Past Date
    // ------------------------------------------

    if (
      bookingData.date <
      today
    ) {
      alert(
        "Booking date cannot be in the past."
      );

      return false;
    }

    // ------------------------------------------
    // Maximum 30-Day Booking Window
    // ------------------------------------------

    if (
      bookingData.date >
      maxDate
    ) {
      alert(
        "You can book a service only up to 30 days from today."
      );

      return false;
    }

    // ------------------------------------------
    // Time Required
    // ------------------------------------------

    if (!bookingData.time) {
      alert(
        "Please select a booking time."
      );

      return false;
    }

    // ------------------------------------------
    // Prevent Past Time For Today
    // ------------------------------------------

    if (
      bookingData.date ===
      today
    ) {
      const selectedTime =
        convertTimeToMinutes(
          bookingData.time
        );

      const currentTime =
        getCurrentTimeInMinutes();

      if (
        selectedTime <=
        currentTime
      ) {
        alert(
          "The selected booking time has already passed. Please select a future time."
        );

        return false;
      }
    }

    return true;
  };

  // ==========================================
  // Create Booking
  // ==========================================

  const handleBooking = async () => {
    // ------------------------------------------
    // Validate Before API Request
    // ------------------------------------------

    if (!validateBooking()) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await api.post(
          "/bookings",
          {
            service:
              service._id,

            address:
              bookingData.address,

            bookingDate:
              bookingData.date,

            bookingTime:
              bookingData.time,

            paymentMethod:
              bookingData.paymentMethod,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        response.data
      );

      alert(
        "Booking Created Successfully"
      );

      navigate(
        `/track-booking/${response.data.booking._id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data
          ?.message ||
          "Booking Failed"
      );
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        Loading...
      </h2>
    );
  }

  // ==========================================
  // Service Not Found
  // ==========================================

  if (!service) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        Service Not Found
      </h2>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <Navbar />

      {/* ==========================================
          DATE WARNING POPUP
      ========================================== */}

      {showDateWarning && (
        <div className="date-warning-overlay">

          <div className="date-warning-modal">

            <div className="date-warning-icon">
              !
            </div>

            <h2>
              Booking Date Notice
            </h2>

            <p>
              You can book this service
              for:
            </p>

            <div className="selected-warning-date">
              {formatBookingDate(
                warningDate
              )}
            </div>

            <p>
              However, this service date
              is more than 3 days away.
            </p>

            <p>
              You can still complete the
              booking, but a technician
              cannot accept this booking
              yet.
            </p>

            <div className="date-warning-highlight">
              Your booking will remain
              pending until it becomes
              eligible for technician
              acceptance.
            </div>

            <button
              className="date-warning-btn"
              onClick={() =>
                setShowDateWarning(
                  false
                )
              }
            >
              Got it
            </button>

          </div>

        </div>
      )}

      {/* ==========================================
          BOOKING PAGE
      ========================================== */}

      <main className="booking-page">

        <div className="booking-container">

          {/* ==========================================
              BACK BUTTON
          ========================================== */}

          <Link
            to={`/services/${service._id}`}
            className="back-btn"
          >
            <FiArrowLeft />

            <span>
              Back to Service
            </span>
          </Link>

          {/* ==========================================
              HEADER
          ========================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="booking-header"
          >
            <h1>
              Complete Your Booking
            </h1>

            <p>
              Fill in your details to
              confirm your home service
              booking.
            </p>
          </motion.div>

          <div className="booking-grid">

            {/* ==========================================
                LEFT SIDE
            ========================================== */}

            <div className="booking-left">

              {/* ==========================================
                  SERVICE DETAILS
              ========================================== */}

              <div className="booking-card">

                <h2>
                  Service Details
                </h2>

                <div className="service-box">

                  <div>

                    <h3>
                      {service.name}
                    </h3>

                    <p>
                      {service.description}
                    </p>

                  </div>

                  <div className="service-price">

                    <h3>
                      ₹{service.price}
                    </h3>

                    <p>
                      Starting Price
                    </p>

                  </div>

                </div>

              </div>

              {/* ==========================================
                  CUSTOMER DETAILS
              ========================================== */}

              <div className="booking-card">

                <h2 className="card-title">

                  <FiUser />

                  Customer Details

                </h2>

                <div className="form-group">

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="form-input"
                    value={
                      bookingData.fullName
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    className="form-input"
                    value={
                      bookingData.phone
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="form-input"
                    value={
                      bookingData.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              {/* ==========================================
                  SERVICE ADDRESS
              ========================================== */}

              <div className="booking-card">

                <h2 className="card-title">

                  <FiHome />

                  Service Address

                </h2>

                <div className="form-group">

                  <textarea
                    rows="4"
                    name="address"
                    placeholder="Complete Address"
                    className="form-textarea"
                    value={
                      bookingData.address
                    }
                    onChange={
                      handleChange
                    }
                  ></textarea>

                  <div className="two-column">

                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      className="form-input"
                      value={
                        bookingData.city
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      className="form-input"
                      value={
                        bookingData.pincode
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

              </div>

              {/* ==========================================
                  SCHEDULE
              ========================================== */}

              <div className="booking-card">

                <h2 className="card-title">

                  <FiCalendar />

                  Schedule Service

                </h2>

                <div className="two-column">

                  {/* DATE */}

                  <div>

                    <label className="form-label">
                      Select Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      className="form-input"
                      value={
                        bookingData.date
                      }
                      min={
                        getTodayDate()
                      }
                      max={
                        getDateAfterDays(30)
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "6px",
                        color:
                          "#64748b",
                      }}
                    >
                      You can book from today
                      up to 30 days in advance.
                    </small>

                    <small
                      className="technician-window-info"
                    >
                      Bookings more than
                      3 days ahead can be
                      created, but the
                      technician can accept
                      them only when they
                      enter the 3-day
                      acceptance window.
                    </small>

                  </div>

                  {/* TIME */}

                  <div>

                    <label className="form-label">
                      Select Time
                    </label>

                    <select
                      name="time"
                      className="form-input"
                      value={
                        bookingData.time
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Time
                      </option>

                      <option>
                        09:00 AM
                      </option>

                      <option>
                        10:00 AM
                      </option>

                      <option>
                        11:00 AM
                      </option>

                      <option>
                        12:00 PM
                      </option>

                      <option>
                        02:00 PM
                      </option>

                      <option>
                        04:00 PM
                      </option>

                      <option>
                        06:00 PM
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              {/* ==========================================
                  SPECIAL INSTRUCTIONS
              ========================================== */}

              <div className="booking-card">

                <h2 className="card-title">

                  <FiMapPin />

                  Special Instructions

                </h2>

                <textarea
                  rows="5"
                  name="instructions"
                  placeholder="Describe your issue or provide additional instructions..."
                  className="form-textarea"
                  value={
                    bookingData.instructions
                  }
                  onChange={
                    handleChange
                  }
                ></textarea>

              </div>

            </div>

            {/* ==========================================
                RIGHT SIDE
            ========================================== */}

            <div className="booking-right">

              <div className="summary-card">

                <h2>
                  Booking Summary
                </h2>

                <div className="summary-list">

                  <div className="summary-row">

                    <span>
                      Service
                    </span>

                    <strong>
                      {service.name}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      Service Charge
                    </span>

                    <strong>
                      ₹{service.price}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      Platform Fee
                    </span>

                    <strong>
                      ₹49
                    </strong>

                  </div>

                  <hr />

                  <div className="summary-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {service.price +
                        49}
                    </strong>

                  </div>

                </div>

                {/* ==========================================
                    PAYMENT
                ========================================== */}

                <div className="payment-section">

                  <h3 className="card-title">

                    <FiCreditCard />

                    Payment Method

                  </h3>

                  <div className="payment-options">

                    <label className="payment-option">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Service"
                        checked={
                          bookingData.paymentMethod ===
                          "Cash on Service"
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span>
                        Cash on Service
                      </span>

                    </label>

                    <label className="payment-option">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={
                          bookingData.paymentMethod ===
                          "UPI"
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span>
                        UPI
                      </span>

                    </label>

                    <label className="payment-option">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Card"
                        checked={
                          bookingData.paymentMethod ===
                          "Card"
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span>
                        Credit / Debit Card
                      </span>

                    </label>

                  </div>

                </div>

                {/* ==========================================
                    CONFIRM BOOKING
                ========================================== */}

                <button
                  className="confirm-btn"
                  onClick={
                    handleBooking
                  }
                >
                  Confirm Booking
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>
    </>
  );
};

export default Booking;