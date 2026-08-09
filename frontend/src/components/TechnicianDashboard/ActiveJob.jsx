import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiShield,
  FiClock,
  FiUser,
} from "react-icons/fi";

import api from "../../api/axios";
import socket from "../../socket";

import "./ActiveJob.css";

const ActiveJob = () => {

  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const watchId = useRef(null);

  useEffect(() => {

    fetchActiveBooking();

    return () => {

      if (watchId.current) {

        navigator.geolocation.clearWatch(
          watchId.current
        );

      }

    };

  }, []);

  const fetchActiveBooking = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const activeBooking =
        response.data.bookings.find(
          (item) =>
            item.status === "Accepted" ||
            item.status === "In Progress"
        );

      setBooking(activeBooking || null);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  const startLiveTracking = () => {

    if (!booking) return;

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported."
      );

      return;

    }

    watchId.current =
      navigator.geolocation.watchPosition(

        (position) => {

          socket.emit("send-location", {

            bookingId: booking._id,

            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

          });

          console.log(
            "📍 Sending Location:",
            position.coords.latitude,
            position.coords.longitude
          );

        },

        (error) => {

          console.log(error);

        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }

      );

    alert(
      "Live location sharing started."
    );

  };

  const completeJob = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await api.put(

        `/bookings/${booking._id}/status`,

        {
          status: "Completed",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );

      alert(response.data.message);

      fetchActiveBooking();

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to complete job."
      );

    }

  };

  if (loading) {

    return <h2>Loading...</h2>;

  }

  if (!booking) {

    return (

      <div className="active-job-section">

        <h2>No Active Job</h2>

      </div>

    );

  };

    return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="active-job-section"
    >
      <div className="active-job-header">

        <div>

          <span className="active-job-badge">
            Active Job
          </span>

          <h2 className="active-job-title">
            {booking.service?.name}
          </h2>

          <p className="active-job-subtitle">
            Your current assigned booking.
          </p>

        </div>

        <div className="job-id">

          <span>
            {booking.bookingId}
          </span>

        </div>

      </div>

      <div className="active-job-grid">

        {/* Left Side */}

        <div className="job-info">

          <div className="info-card">

            <div className="info-row">

              <FiUser className="info-icon" />

              <div>

                <p className="info-label">
                  Customer
                </p>

                <h3 className="info-value">
                  {booking.customer?.name}
                </h3>

              </div>

            </div>

          </div>

          <div className="info-card">

            <div className="info-row">

              <FiClock className="info-icon" />

              <div>

                <p className="info-label">
                  Service Time
                </p>

                <h3 className="info-value">
                  {new Date(
                    booking.bookingDate
                  ).toLocaleDateString()}
                  {" • "}
                  {booking.bookingTime}
                </h3>

              </div>

            </div>

          </div>

          <div className="info-card">

            <div className="info-row">

              <FiMapPin className="info-icon" />

              <div>

                <p className="info-label">
                  Address
                </p>

                <h3 className="info-value">
                  {booking.address}
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* Right Side */}

        <div>

          <div className="otp-card">

            <div className="info-row">

              <FiShield className="otp-icon" />

              <div>

                <p className="info-label">
                  Customer OTP
                </p>

                <h2 className="otp-code">
                  {booking.otp || "----"}
                </h2>

              </div>

            </div>

          </div>

          <div className="job-actions">

            <button
              className="start-btn"
              onClick={startLiveTracking}
            >
              Start Job
            </button>

            <button
              className="complete-btn"
              onClick={completeJob}
            >
              Complete Job
            </button>

            <a
              href={`tel:${booking.customer?.phone}`}
              className="outline-btn"
            >
              <FiPhone />
              Call Customer
            </a>

            <button
  className="outline-btn"
  onClick={() => {

    if (!job.address) {

      alert("Customer address not available.");

      return;

    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        job.address
      )}`,
      "_blank"
    );

  }}
>
  <FiNavigation />
  Open Navigation
</button>

          </div>

        </div>

      </div>

    </motion.section>
  );

};

export default ActiveJob;