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

  /*
   * Get today's date in YYYY-MM-DD format.
   *
   * This uses the user's local date instead of UTC,
   * which is important for India and other time zones.
   */
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Get current time in minutes.
   * Used only when the customer selects today's date.
   */
  const getCurrentTimeInMinutes = () => {
    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
  };

  /*
   * Convert booking time like "02:00 PM"
   * into minutes from midnight.
   */
  const convertTimeToMinutes = (time) => {
    if (!time) return null;

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);
        setService(response.data.service);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  /*
   * Handle all form changes.
   *
   * Date validation:
   * - Yesterday and older dates are rejected.
   *
   * Time validation:
   * - If today is selected, already-passed time slots are rejected.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      const today = getTodayDate();

      if (value < today) {
        alert("Please select today or a future date.");
        return;
      }

      /*
       * If the user changes the date to a future date,
       * keep the selected time.
       *
       * If the user selects today and the selected time
       * has already passed, clear the time.
       */
      if (value === today && bookingData.time) {
        const selectedTime = convertTimeToMinutes(bookingData.time);
        const currentTime = getCurrentTimeInMinutes();

        if (selectedTime <= currentTime) {
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

      setBookingData({
        ...bookingData,
        date: value,
      });

      return;
    }

    /*
     * When selecting a time, check whether the selected
     * date is today.
     */
    if (name === "time") {
      const today = getTodayDate();

      if (bookingData.date === today) {
        const selectedTime = convertTimeToMinutes(value);
        const currentTime = getCurrentTimeInMinutes();

        if (selectedTime !== null && selectedTime <= currentTime) {
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

    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };

  /*
   * Validate booking before sending it to backend.
   */
  const validateBooking = () => {
    const today = getTodayDate();

    if (!bookingData.date) {
      alert("Please select a booking date.");
      return false;
    }

    if (bookingData.date < today) {
      alert("Booking date cannot be in the past.");
      return false;
    }

    if (!bookingData.time) {
      alert("Please select a booking time.");
      return false;
    }

    /*
     * If booking is for today, make sure the selected
     * time has not already passed.
     */
    if (bookingData.date === today) {
      const selectedTime = convertTimeToMinutes(bookingData.time);
      const currentTime = getCurrentTimeInMinutes();

      if (selectedTime <= currentTime) {
        alert(
          "The selected time has already passed. Please choose a future time."
        );
        return false;
      }
    }

    return true;
  };

  const handleBooking = async () => {
    /*
     * Stop the request if the date/time is invalid.
     */
    if (!validateBooking()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/bookings",
        {
          service: service._id,
          address: bookingData.address,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          paymentMethod: bookingData.paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      alert("Booking Created Successfully");

      navigate(
        `/track-booking/${response.data.booking._id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message || "Booking Failed"
      );
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "100px" }}>
        Loading...
      </h2>
    );
  }

  if (!service) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "100px" }}>
        Service Not Found
      </h2>
    );
  }

  return (
    <>
      <Navbar />

      <main className="booking-page">
        <div className="booking-container">

          {/* Back Button */}

          <Link
            to={`/services/${service._id}`}
            className="back-btn"
          >
            <FiArrowLeft />
            <span>Back to Service</span>
          </Link>

          {/* Heading */}

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

            {/* LEFT SIDE */}

            <div className="booking-left">

              {/* Service */}

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

              {/* Customer Details */}

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

              {/* Address */}

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
                  ></textarea>

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

              {/* Schedule */}

              <div className="booking-card">

                <h2 className="card-title">
                  <FiCalendar />
                  Schedule Service
                </h2>

                <div className="two-column">

                  <div>

                    <label className="form-label">
                      Select Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      className="form-input"
                      value={bookingData.date}
                      min={getTodayDate()}
                      onChange={handleChange}
                    />

                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#64748b",
                      }}
                    >
                      You can book from today onwards.
                    </small>

                  </div>

                  <div>

                    <label className="form-label">
                      Select Time
                    </label>

                    <select
                      name="time"
                      className="form-input"
                      value={bookingData.time}
                      onChange={handleChange}
                    >
                      <option value="">Select Time</option>
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>12:00 PM</option>
                      <option>02:00 PM</option>
                      <option>04:00 PM</option>
                      <option>06:00 PM</option>
                    </select>

                  </div>

                </div>

              </div>

              {/* Special Instructions */}

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
                ></textarea>

              </div>

            </div>

            {/* RIGHT SIDE */}

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
                    <strong>₹{service.price + 49}</strong>
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
                          bookingData.paymentMethod ===
                          "Cash on Service"
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
                        checked={
                          bookingData.paymentMethod ===
                          "UPI"
                        }
                        onChange={handleChange}
                      />

                      <span>UPI</span>
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
                        onChange={handleChange}
                      />

                      <span>Credit / Debit Card</span>
                    </label>

                  </div>

                </div>

                <button
                  className="confirm-btn"
                  onClick={handleBooking}
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