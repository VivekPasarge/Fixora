import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./Review.css";

const Review = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [technicianRating, setTechnicianRating] =
    useState({
      averageRating: 0,
      totalReviews: 0,
    });
    const [reviews, setReviews] = useState([]);
    const fetchReviews = async (technicianId) => {

  try {

    const response = await api.get(
      `/reviews/technician/${technicianId}`
    );

    setReviews(response.data.reviews);

  } catch (error) {

    console.log(error);

  }

};

  useEffect(() => {

  if (booking?.technician?._id) {

    fetchTechnicianRating(
      booking.technician._id
    );

    fetchReviews(
      booking.technician._id
    );

  }

}, []);

  const fetchTechnicianRating = async (
    technicianId
  ) => {

    try {

      const response = await api.get(
        `/reviews/technician/${technicianId}/rating`
      );

      setTechnicianRating({
        averageRating:
          response.data.averageRating,
        totalReviews:
          response.data.totalReviews,
      });

    } catch (error) {

      console.log(error);

    }

  };

  const submitReview = async () => {

    if (!review.trim()) {

      alert("Please write your review.");

      return;

    }

    try {

      const token =
        localStorage.getItem("token");

      const response = await api.post(
        "/reviews",
        {
          bookingId: booking._id,
          rating,
          review,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      navigate("/my-bookings");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to submit review"
      );

    }

  };
    if (!booking) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "120px",
        }}
      >
        Booking Not Found
      </h2>
    );
  }

  return (
    <>
      <Navbar />

      <div className="review-page">

        <div className="review-card">

          <h1>Rate Your Service</h1>

          <div className="booking-summary">

            <div className="summary-item">

              <span>Service</span>

              <strong>
                {booking.service.name}
              </strong>

            </div>

            <div className="summary-item">

              <span>Booking ID</span>

              <strong>
                {booking.bookingId}
              </strong>

            </div>

            <div className="summary-item">

              <span>Technician</span>

              <strong>
                {booking.technician?.name}
              </strong>

              <p className="tech-rating">

                ⭐ {technicianRating.averageRating}

                <span>
                  ({technicianRating.totalReviews} Reviews)
                </span>

              </p>

            </div>

            <div className="summary-item">

              <span>Date</span>

              <strong>
                {new Date(
                  booking.bookingDate
                ).toLocaleDateString()}
              </strong>

            </div>

            <div className="summary-item">

              <span>Amount Paid</span>

              <strong>
                ₹{booking.price}
              </strong>

            </div>

          </div>

          <label>
            Rate Your Experience
          </label>

          <div className="rating-stars">

            {[1, 2, 3, 4, 5].map((star) => (

              <FiStar
                key={star}
                size={36}
                className={
                  star <= rating
                    ? "star active-star"
                    : "star"
                }
                onClick={() =>
                  setRating(star)
                }
              />

            ))}

          </div>

          <p className="rating-text">

            {rating} / 5 Stars

          </p>

          <label className="review-label">

            Share Your Experience

          </label>

          <textarea
            className="review-textarea"
            rows="7"
            placeholder="Tell us about the technician's professionalism, punctuality, service quality and overall experience..."
            value={review}
            onChange={(e) =>
              setReview(e.target.value)
            }
          />

          <p className="review-helper">

            Your feedback helps other customers choose the best technician.

          </p>

          <button
            className="submit-review-btn"
            onClick={submitReview}
          >

            Submit Review

          </button>

          <div className="previous-reviews">

  <h2>Customer Reviews</h2>

  {reviews.length === 0 ? (

    <p className="no-reviews">
      No reviews yet.
    </p>

  ) : (

    reviews.map((item) => (

      <div
        key={item._id}
        className="review-item"
      >

        <div className="review-header">

          <div>

            <h4>
              {item.customer.name}
            </h4>

            <p>
              {new Date(
                item.createdAt
              ).toLocaleDateString()}
            </p>

          </div>

          <div className="review-stars">

            {"⭐".repeat(item.rating)}

          </div>

        </div>

        <p className="review-message">

          {item.review}

        </p>

      </div>

    ))

  )}

</div>

        </div>

      </div>

    </>
  );

};

export default Review;