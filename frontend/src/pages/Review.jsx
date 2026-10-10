
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
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [error, setError] = useState("");

  const [technicianRating, setTechnicianRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let active = true;

    const loadReviewData = async () => {
      if (!booking?._id) {
        setLoading(false);
        return;
      }

      const technicianId =
        typeof booking.technician === "object"
          ? booking.technician?._id
          : booking.technician;

      try {
        setLoading(true);
        setError("");

        const requests = [];

        if (technicianId) {
          requests.push(
            api.get(`/reviews/technician/${technicianId}`)
          );

          requests.push(
            api.get(`/reviews/technician/${technicianId}/rating`)
          );
        }

        const token = localStorage.getItem("token");

        if (token) {
          requests.push(
            api.get(`/reviews/check/${booking._id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
        }

        const responses = await Promise.allSettled(requests);

        if (!active) return;

        let index = 0;

        if (technicianId) {
          const reviewsResult = responses[index++];

          if (reviewsResult.status === "fulfilled") {
            setReviews(
              Array.isArray(reviewsResult.value.data?.reviews)
                ? reviewsResult.value.data.reviews
                : []
            );
          }

          const ratingResult = responses[index++];

          if (ratingResult.status === "fulfilled") {
            setTechnicianRating({
              averageRating:
                Number(ratingResult.value.data?.averageRating) || 0,
              totalReviews:
                Number(ratingResult.value.data?.totalReviews) || 0,
            });
          }
        }

        if (token) {
          const checkResult = responses[index];

          if (checkResult?.status === "fulfilled") {
            const data = checkResult.value.data;

            setAlreadyReviewed(Boolean(data?.reviewed));
            setExistingReview(data?.review || null);
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load review information."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReviewData();

    return () => {
      active = false;
    };
  }, [booking?._id, booking?.technician]);

  const submitReview = async (event) => {
    event.preventDefault();

    if (!booking?._id) {
      alert("Booking details are missing. Open the review page from My Bookings.");
      return;
    }

    if (alreadyReviewed) {
      alert("You have already submitted a review for this booking.");
      return;
    }

    const trimmedReview = review.trim();

    if (!trimmedReview) {
      alert("Please write your review.");
      return;
    }

    if (trimmedReview.length > 500) {
      alert("Your review cannot exceed 500 characters.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to submit your review.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/reviews",
        {
          bookingId: booking._id,
          rating,
          review: trimmedReview,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlreadyReviewed(true);
      setExistingReview(response.data?.review || {
        rating,
        review: trimmedReview,
      });

      alert(response.data?.message || "Review submitted successfully.");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Submit Review Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="review-page">
          <div className="review-card">
            <h1>Booking Not Found</h1>
            <p>
              Please open the review page from your completed booking.
            </p>
            <button
              type="button"
              className="submit-review-btn"
              onClick={() => navigate("/my-bookings")}
            >
              Back to My Bookings
            </button>
          </div>
        </div>
      </>
    );
  }

  const serviceName =
    typeof booking.service === "object"
      ? booking.service?.name
      : booking.service;

  const technicianName =
    typeof booking.technician === "object"
      ? booking.technician?.name
      : "Assigned Technician";

  return (
    <>
      <Navbar />

      <div className="review-page">
        <div className="review-card">
          <h1>Rate Your Service</h1>

          <div className="booking-summary">
            <div className="summary-item">
              <span>Service</span>
              <strong>{serviceName || "Home Service"}</strong>
            </div>

            <div className="summary-item">
              <span>Booking ID</span>
              <strong>{booking.bookingId || booking._id}</strong>
            </div>

            <div className="summary-item">
              <span>Technician</span>
              <strong>{technicianName}</strong>

              <p className="tech-rating">
                {technicianRating.averageRating.toFixed(1)} / 5
                <span>
                  ({technicianRating.totalReviews} Reviews)
                </span>
              </p>
            </div>

            <div className="summary-item">
              <span>Date</span>
              <strong>
                {booking.bookingDate
                  ? new Date(booking.bookingDate).toLocaleDateString(
                      "en-IN"
                    )
                  : "Not available"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Amount</span>
              <strong>
                ₹{Number(booking.price || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {loading && <p>Loading review information...</p>}

          {!loading && error && (
            <p role="alert">{error}</p>
          )}

          {!loading && alreadyReviewed && (
            <div className="previous-reviews">
              <h2>Review Submitted</h2>
              <p>You have already reviewed this booking.</p>

              {existingReview && (
                <>
                  <p>
                    Rating: {existingReview.rating || rating} / 5
                  </p>
                  <p>
                    {existingReview.review || review}
                  </p>
                </>
              )}
            </div>
          )}

          {!loading && !alreadyReviewed && (
            <form onSubmit={submitReview}>
              <label>Rate Your Experience</label>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5 stars`}
                    aria-pressed={rating === star}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <FiStar
                      size={36}
                      className={
                        star <= rating
                          ? "star active-star"
                          : "star"
                      }
                      fill={star <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>

              <p className="rating-text">{rating} / 5 Stars</p>

              <label className="review-label">
                Share Your Experience
              </label>

              <textarea
                className="review-textarea"
                rows={7}
                maxLength={500}
                placeholder="Tell us about the technician's professionalism, punctuality, service quality and overall experience..."
                value={review}
                onChange={(event) => setReview(event.target.value)}
                required
              />

              <p className="review-helper">
                Your feedback helps other customers choose the right
                technician. {review.length}/500 characters.
              </p>

              <button
                type="submit"
                className="submit-review-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="previous-reviews">
            <h2>Customer Reviews</h2>

            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet.</p>
            ) : (
              reviews.map((item) => (
                <div key={item._id} className="review-item">
                  <div className="review-header">
                    <div>
                      <h4>{item.customer?.name || "Customer"}</h4>
                      <p>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "Recent"}
                      </p>
                    </div>

                    <div className="review-stars">
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(5, Number(item.rating) || 0)
                        )
                      )}
                      {"☆".repeat(
                        5 -
                          Math.max(
                            0,
                            Math.min(5, Number(item.rating) || 0)
                          )
                      )}
                    </div>
                  </div>

                  <p className="review-message">{item.review}</p>
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
