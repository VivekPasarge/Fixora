
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiStar,
  FiMessageSquare,
  FiArrowUpRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./ReviewsCard.css";

const ReviewsCard = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          if (active) setError("Please log in to view your reviews.");
          return;
        }

        const user = JSON.parse(storedUser);
        const technicianId = user?._id || user?.id;

        if (!technicianId) {
          if (active) setError("Technician account details not found.");
          return;
        }

        const response = await api.get(
          `/reviews/technician/${technicianId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setReviews(
            Array.isArray(response.data?.reviews)
              ? response.data.reviews
              : []
          );
        }
      } catch (error) {
        console.error("Reviews Error:", error);

        if (active) {
          setReviews([]);
          setError(
            error.response?.data?.message ||
              "Unable to load reviews. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      active = false;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";

    const total = reviews.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const renderStars = (rating) => {
    const safeRating = Math.max(
      0,
      Math.min(5, Number(rating) || 0)
    );

    return (
      <div className="review-stars" aria-label={`${safeRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={star <= safeRating ? "star-filled" : "star-empty"}
            fill={star <= safeRating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  const handleViewAll = () => {
    navigate("/technician/reviews");
  };

  const formatDate = (date) => {
    if (!date) return "Recent";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Recent";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="reviews-card"
      id="all-technician-reviews"
    >
      <div className="reviews-header">
        <div>
          <div className="reviews-title-row">
            <h2 className="reviews-title">Recent Reviews</h2>
            <FiMessageSquare className="reviews-header-icon" />
          </div>

          <p className="reviews-subtitle">
            Customer feedback about your services.
          </p>
        </div>

        {!loading && !error && reviews.length > 0 && (
          <div className="reviews-summary">
            <strong>{averageRating}</strong>
            {renderStars(Math.round(Number(averageRating)))}
            <span>
              {reviews.length}{" "}
              {reviews.length === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="reviews-loading">
          <div className="reviews-spinner" />
          <p>Loading reviews...</p>
        </div>
      )}

      {!loading && error && (
        <div className="reviews-empty">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="reviews-empty">
          <div className="reviews-empty-icon">
            <FiStar />
          </div>

          <h3>No Reviews Yet</h3>

          <p>
            Customer reviews will appear here after customers review
            their completed services.
          </p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.slice(0, 3).map((item, index) => {
            const customerName = item.customer?.name || "Customer";
            const serviceName =
              typeof item.booking?.service === "object"
                ? item.booking.service?.name
                : item.booking?.service;

            return (
              <div
                key={item._id || item.id || index}
                className="review-item"
              >
                <div className="review-header">
                  <div className="review-customer">
                    <div className="review-avatar">
                      {customerName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="review-name">{customerName}</h3>
                      <p className="review-date">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {renderStars(item.rating)}
                </div>

                <p className="review-text">
                  {item.review || "No written feedback provided."}
                </p>

                {serviceName && (
                  <span className="review-service">{serviceName}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <button
          type="button"
          className="reviews-view-btn"
          onClick={handleViewAll}
        >
          <span>View All Reviews</span>
          <FiArrowUpRight />
        </button>
      )}
    </motion.div>
  );
};

export default ReviewsCard;
