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

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
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
  };

  const handleBooking = async () => {
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
                  onChange={handleChange}
                />

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