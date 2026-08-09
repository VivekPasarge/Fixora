import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiArrowRight,
  FiUser,
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);
const checkReview = async (bookingId) => {

  try {

    const token = localStorage.getItem("token");

    const response = await api.get(
      `/reviews/check/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.reviewed;

  } catch (error) {

    console.log(error);

    return false;

  }

};
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const bookingsData = response.data.bookings;

setBookings(bookingsData);

const reviewed = [];

for (const booking of bookingsData) {

  const exists = await checkReview(
    booking._id
  );

  if (exists) {
    reviewed.push(booking._id);
  }

}

setReviewedBookings(reviewed);
//       console.log(response.data.bookings);
//       console.table(
//   response.data.bookings.map((b) => ({
//     id: b._id,
//     bookingId: b.bookingId,
//     status: b.status,
//     paymentStatus: b.paymentStatus,
//     technician: b.technician?.name || "Not Assigned",
//   }))
// );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "120px",
        }}
      >
        Loading...
      </h2>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bookings-page">

        <div className="bookings-container">

          <motion.div
            className="bookings-header"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            <h1>My Bookings</h1>

            <p>
              View and manage all your
              Fixora service bookings.
            </p>

          </motion.div>

          <div className="booking-tabs">

            <button className="active-tab">
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

          <div className="bookings-list">

            {bookings.length === 0 ? (

              <h2>No Bookings Found</h2>

            ) : (

              bookings.map((booking, index) => (
                <motion.div
  key={booking._id}
  className="booking-card"
  initial={{ opacity: 0, y: 25 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.4,
    delay: index * 0.15,
  }}
>

  <div className="booking-top">

    <div>

      <h2>{booking.service?.name}</h2>

      <p className="booking-id">
        Booking ID : {booking.bookingId}
      </p>

    </div>

    <span
      className={`status-badge ${booking.status
        .toLowerCase()
        .replace(" ", "-")}`}
    >
      {booking.status}
    </span>

  </div>

  <div className="booking-details">

    <div className="detail-item">

      <FiCalendar />

      <span>
        {new Date(
          booking.bookingDate
        ).toLocaleDateString()}
      </span>

    </div>

    <div className="detail-item">

      <FiClock />

      <span>{booking.bookingTime}</span>

    </div>

    <div className="detail-item">

      <FiMapPin />

      <span>{booking.address}</span>

    </div>

  </div>

  {booking.technician && (

    <div className="technician-card">

      <h3>Assigned Professional</h3>

      <div className="tech-info">

        <FiUser />

        <span>
          {booking.technician.name}
        </span>

      </div>

      <div className="tech-info">

        <FiPhone />

        <span>
          {booking.technician.phone}
        </span>

      </div>

      <div className="tech-info">

        <FiBriefcase />

        <span>
          {booking.technician.profession ||
            "Not Available"}
        </span>

      </div>

    </div>

  )}

  <div className="status-progress">

    <div
      className={`step ${
        booking.status !== "Cancelled"
          ? "active"
          : ""
      }`}
    >
      Pending
    </div>

    <div
      className={`step ${
        [
          "Accepted",
          "In Progress",
          "Completed",
        ].includes(booking.status)
          ? "active"
          : ""
      }`}
    >
      Accepted
    </div>

    <div
      className={`step ${
        [
          "In Progress",
          "Completed",
        ].includes(booking.status)
          ? "active"
          : ""
      }`}
    >
      In Progress
    </div>

    <div
      className={`step ${
        booking.status === "Completed"
          ? "active"
          : ""
      }`}
    >
      Completed
    </div>

  </div>

  <div className="booking-footer">

    {/* <Link
      to={`/track-booking/${booking._id}`}
      className="details-btn"
    >
      Track Booking

      <FiArrowRight />

    </Link> */}

    <div className="booking-footer">

  <Link
    to={`/track-booking/${booking._id}`}
    className="details-btn"
  >
    Track Booking
  </Link>

 {booking.status === "Completed" &&
 booking.paymentStatus === "Paid" && (

  reviewedBookings.includes(booking._id) ? (

    <button
      className="review-submitted-btn"
      disabled
    >
      ✅ Review Submitted
    </button>

  ) : (

    <Link
      to="/review"
      state={{ booking }}
      className="review-btn"
    >
      ⭐ Rate Service
    </Link>

  )

)}

</div>

  </div>

</motion.div>
              ))
            )}

          </div>

        </div>

      </main>

    </>
  );
};

export default MyBookings;