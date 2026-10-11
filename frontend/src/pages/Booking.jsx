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
import AvailableTechnicians from "../components/Booking/AvailableTechnicians";

import "./Booking.css";
import "./BookingLocation.css";

const Booking = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [showDateWarning, setShowDateWarning] = useState(false);
  const [warningDate, setWarningDate] = useState("");

  const [dateInput, setDateInput] = useState("");

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

  // Get today's date in India as YYYY-MM-DD.
  // This format is used internally for reliable date comparisons.
  const getTodayDate = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const getPart = (type) =>
      parts.find((part) => part.type === type)?.value;

    return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  };

  // Get a date N days from today as YYYY-MM-DD.
  const getDateAfterDays = (days) => {
    const [year, month, day] = getTodayDate().split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day + days));

    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
  };

  // Convert DD-MM-YYYY to YYYY-MM-DD.
  const toISODate = (value) => {
    if (typeof value !== "string") {
      return "";
    }

    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (!match) {
      return "";
    }

    const [, day, month, year] = match;

    const date = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day))
    );

    // Reject impossible dates such as 32-01-2026.
    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() !== Number(month) - 1 ||
      date.getUTCDate() !== Number(day)
    ) {
      return "";
    }

    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD to DD-MM-YYYY.
  const toDisplayDate = (value) => {
    if (!value) {
      return "";
    }

    const [year, month, day] = value.split("-");

    return `${day}-${month}-${year}`;
  };

  // Check whether a booking is beyond the technician acceptance window.
  const isBookingBeyondTechnicianWindow = (selectedDate) => {
    const lastAllowedDate = getDateAfterDays(2);

    return selectedDate > lastAllowedDate;
  };

  // Get the current time in India as minutes after midnight.
  const getCurrentTimeInMinutes = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const hours = Number(
      parts.find((part) => part.type === "hour")?.value
    );

    const minutes = Number(
      parts.find((part) => part.type === "minute")?.value
    );

    return hours * 60 + minutes;
  };

  // Convert HH:mm time to minutes.
  const convertTimeToMinutes = (time) => {
    if (!time) {
      return null;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  };

  // Format the date shown in the date warning popup.
  const formatBookingDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return date.toLocaleDateString("en-IN", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch service details.
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);

        setService(response.data.service);
      } catch (error) {
        console.error("Failed to fetch service:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Handle normal form fields and booking time.
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "time") {
      const today = getTodayDate();
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (value && !timePattern.test(value)) {
        alert("Please select a valid time.");
        return;
      }

      // Do not allow a past time when the selected date is today.
      if (bookingData.date === today && value) {
        const selectedTime = convertTimeToMinutes(value);
        const currentTime = getCurrentTimeInMinutes();

        if (
          selectedTime !== null &&
          selectedTime <= currentTime
        ) {
          alert(
            "This time has already passed. Please select a future time."
          );
          return;
        }
      }

      setBookingData((previous) => ({
        ...previous,
        time: value,
      }));

      return;
    }

    setBookingData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle date input in DD-MM-YYYY format.
  // Automatically insert hyphens as the user types.
  const handleDateChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);

    let formatted = digits;

    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }

    setDateInput(formatted);

    const isoDate = toISODate(formatted);

    // Wait until the complete date is valid.
    if (!isoDate) {
      setBookingData((previous) => ({
        ...previous,
        date: "",
      }));

      setWarningDate("");
      setShowDateWarning(false);

      return;
    }

    const today = getTodayDate();
    const maxDate = getDateAfterDays(2);

    // Prevent past dates.
    if (isoDate < today) {
      setBookingData((previous) => ({
        ...previous,
        date: "",
      }));

      alert("Please select today or a future date.");
      return;
    }

    // Allow bookings only up to two days ahead.
    if (isoDate > maxDate) {
      setBookingData((previous) => ({
        ...previous,
        date: "",
      }));

      alert("You can book a service only up to 2 days from today.");
      return;
    }

    // If booking today, clear a time that has already passed.
    const selectedTime = convertTimeToMinutes(bookingData.time);
    const currentTime = getCurrentTimeInMinutes();

    if (
      isoDate === today &&
      selectedTime !== null &&
      selectedTime <= currentTime
    ) {
      setBookingData((previous) => ({
        ...previous,
        date: isoDate,
        time: "",
      }));

      alert(
        "The selected time has already passed. Please choose another time."
      );
    } else {
      setBookingData((previous) => ({
        ...previous,
        date: isoDate,
      }));
    }

    // Technician acceptance warning.
    if (isBookingBeyondTechnicianWindow(isoDate)) {
      setWarningDate(isoDate);
      setShowDateWarning(true);
    } else {
      setWarningDate("");
      setShowDateWarning(false);
    }
  };

  // Validate booking details before submission.
  const validateBooking = () => {
    const today = getTodayDate();
    const maxDate = getDateAfterDays(2);

    if (!bookingData.date) {
      alert("Please enter a valid booking date in DD-MM-YYYY format.");
      return false;
    }

    if (bookingData.date < today) {
      alert("Booking date cannot be in the past.");
      return false;
    }

    if (bookingData.date > maxDate) {
      alert("You can book a service only up to 2 days from today.");
      return false;
    }

    if (!bookingData.time) {
      alert("Please select a booking time.");
      return false;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(bookingData.time)) {
      alert("Invalid booking time. Please select a valid 24-hour time.");
      return false;
    }

    // Prevent past times for bookings scheduled today.
    if (bookingData.date === today) {
      const selectedTime = convertTimeToMinutes(bookingData.time);
      const currentTime = getCurrentTimeInMinutes();

      if (
        selectedTime === null ||
        selectedTime <= currentTime
      ) {
        alert(
          "The selected booking time has already passed. Please select a future time."
        );

        return false;
      }
    }

    if (!bookingData.address.trim()) {
      alert("Please enter your service address.");
      return false;
    }

    if (!customerLocation) {
      alert("Please capture your current location before confirming the booking.");
      return false;
    }

    return true;
  };

  // Capture the customer's current location.
  const handleGetCustomerLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support location access.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
        setLocationMessage("Customer location captured successfully.");
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission denied. Please allow location access."
          );
        } else {
          setLocationMessage("Unable to get location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Create booking.
  const handleBooking = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validateBooking()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before booking a service.");
      navigate("/login");
      return;
    }

    if (!service?._id) {
      alert("Service details are missing. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        service: service._id,
        address: bookingData.address.trim(),

        // Send the date as DD-MM-YYYY.
        bookingDate: toDisplayDate(bookingData.date),

        bookingTime: bookingData.time,
        paymentMethod: bookingData.paymentMethod,

        ...(customerLocation && {
          customerLocation: {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
          },
        }),
      };

      console.log("Booking payload:", payload);

      const response = await api.post("/bookings", payload);

      console.log("Booking created successfully:", response.data);

      const bookingId = response.data?.booking?._id;

      if (!bookingId) {
        throw new Error("The server did not return a booking ID.");
      }

      navigate(`/track-booking/${bookingId}`);
    } catch (error) {
      console.error("Booking error response:", error.response?.data);
      console.error("Booking status:", error.response?.status);
      console.error("Booking error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading screen.
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

  // Service not found.
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

  return (
    <>
      <Navbar />

      {/* Date warning popup */}
      {showDateWarning && (
        <div className="date-warning-overlay">
          <div className="date-warning-modal">
            <div className="date-warning-icon">!</div>

            <h2>Booking Date Notice</h2>

            <p>You can book this service for:</p>

            <div className="selected-warning-date">
              {formatBookingDate(warningDate)}
            </div>

            <p>
              However, this service date is more than 2 days away.
            </p>

            <p>
              You can still complete the booking, but a technician
              cannot accept this booking yet.
            </p>

            <div className="date-warning-highlight">
              Your booking will remain pending until it becomes
              eligible for technician acceptance.
            </div>

            <button
              className="date-warning-btn"
              onClick={() => setShowDateWarning(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <main className="booking-page">
        <div className="booking-container">
          <Link
            to={`/services/${service._id}`}
            className="back-btn"
          >
            <FiArrowLeft />
            <span>Back to Service</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="booking-header"
          >
            <h1>Complete Your Booking</h1>
            <p>
              Fill in your details to confirm your home service booking.
            </p>
          </motion.div>

          <div className="booking-grid">
            {/* Left side */}
            <div className="booking-left">
              {/* Service details */}
              <div className="booking-card">
                <h2>Service Details</h2>

                <div className="service-box">
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>

                  <div className="service-price">
                    <h3>₹{service.price}</h3>
                    <p>Starting Price</p>
                  </div>
                </div>
              </div>

              {/* Approved technicians */}
              <AvailableTechnicians serviceId={service._id} />

              {/* Customer details */}
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
                    value={bookingData.fullName}
                    onChange={handleChange}
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    className="form-input"
                    value={bookingData.phone}
                    onChange={handleChange}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="form-input"
                    value={bookingData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Service address */}
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
                    value={bookingData.address}
                    onChange={handleChange}
                  />

                  <div className="customer-location-box">
                    <button
                      type="button"
                      className="customer-location-btn"
                      onClick={handleGetCustomerLocation}
                      disabled={locationLoading}
                    >
                      <FiMapPin />
                      {locationLoading
                        ? "Getting Location..."
                        : customerLocation
                          ? "Update My Location"
                          : "Use My Current Location"}
                    </button>

                    {locationMessage && (
                      <p
                        className={`customer-location-message ${
                          customerLocation ? "location-success" : ""
                        }`}
                        role="status"
                      >
                        {locationMessage}
                      </p>
                    )}

                    {customerLocation && (
                      <div className="customer-coordinates">
                        <span>
                          Latitude: {customerLocation.latitude.toFixed(6)}
                        </span>
                        <span>
                          Longitude: {customerLocation.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="two-column">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      className="form-input"
                      value={bookingData.city}
                      onChange={handleChange}
                    />

                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      className="form-input"
                      value={bookingData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Schedule service */}
              <div className="booking-card">
                <h2 className="card-title">
                  <FiCalendar />
                  Schedule Service
                </h2>

                <div className="two-column">
                  {/* Date */}
                  <div>
                    <label className="form-label" htmlFor="booking-date">
                      Select Date
                    </label>

                    <input
                      id="booking-date"
                      type="text"
                      name="date"
                      className="form-input"
                      value={dateInput}
                      onChange={handleDateChange}
                      placeholder="DD-MM-YYYY"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="off"
                      required
                    />

                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#64748b",
                      }}
                    >
                      Enter the date as DD-MM-YYYY. You can book from
                      today up to 2 days in advance.
                    </small>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="form-label" htmlFor="booking-time">
                      Select Time
                    </label>

                    <select
                      id="booking-time"
                      name="time"
                      className="form-input"
                      value={bookingData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Time</option>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const time = `${String(hour).padStart(2, "0")}:00`;

                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      })}
                    </select>

                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#64748b",
                      }}
                    >
                      Time is displayed in 24-hour format.
                    </small>
                  </div>
                </div>
              </div>

              {/* Special instructions */}
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
                  value={bookingData.instructions}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="booking-right">
              <div className="summary-card">
                <h2>Booking Summary</h2>

                <div className="summary-list">
                  <div className="summary-row">
                    <span>Service</span>
                    <strong>{service.name}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Service Charge</span>
                    <strong>₹{service.price}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Platform Fee</span>
                    <strong>₹49</strong>
                  </div>

                  <hr />

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>₹{Number(service.price) + 49}</strong>
                  </div>
                </div>

                {/* Payment */}
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
                          bookingData.paymentMethod === "Cash on Service"
                        }
                        onChange={handleChange}
                      />
                      <span>Cash on Service</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={bookingData.paymentMethod === "UPI"}
                        onChange={handleChange}
                      />
                      <span>UPI</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Card"
                        checked={bookingData.paymentMethod === "Card"}
                        onChange={handleChange}
                      />
                      <span>Credit / Debit Card</span>
                    </label>
                  </div>
                </div>

                {/* Confirm booking */}
                <button
                  type="button"
                  className="confirm-btn"
                  disabled={isSubmitting}
                  onClick={handleBooking}
                >
                  {isSubmitting ? "Confirming..." : "Confirm Booking"}
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