
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiStar,
  FiMessageSquare,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./TechnicianReviews.css";

const TechnicianReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        setError("Please log in to view your reviews.");
        return;
      }

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch {
        setError("Your saved account information is invalid. Please log in again.");
        return;
      }

      const technicianId = user?._id || user?.id;

      if (!technicianId) {
        setError("Technician account details were not found.");
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

      setReviews(
        Array.isArray(response.data?.reviews)
          ? response.data.reviews
          : []
      );
    } catch (err) {
      console.error("Technician Reviews Error:", err);

      setReviews([]);
      setError(
        err.response?.data?.message ||
          "Unable to load reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
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
      <div
        className="all-review-stars"
        aria-label={`${safeRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={
              star <= safeRating
                ? "star-filled"
                : "star-empty"
            }
            fill={star <= safeRating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
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

  const getServiceName = (booking) => {
    if (!booking) return "";

    if (typeof booking.service === "string") {
      return booking.service;
    }

    return booking.service?.name || "";
  };

  return (
    <main className="technician-reviews-page">
      <div className="technician-reviews-container">
        <button
          type="button"
          className="reviews-back-btn"
          onClick={() => navigate("/technician/dashboard")}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <motion.div
          className="reviews-page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div>
            <span>CUSTOMER FEEDBACK</span>

            <h1>All Reviews</h1>

            <p>
              See what customers think about your completed services.
            </p>
          </div>

          {!loading && !error && (
            <div className="reviews-page-rating">
              <strong>{averageRating}</strong>

              {renderStars(Math.round(Number(averageRating)))}

              <small>
                {reviews.length}{" "}
                {reviews.length === 1 ? "Review" : "Reviews"}
              </small>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="all-reviews-loading">
            Loading reviews...
          </div>
        ) : error ? (
          <div className="all-reviews-empty">
            <FiMessageSquare />

            <h2>Unable to Load Reviews</h2>

            <p>{error}</p>

            <button
              type="button"
              className="reviews-back-btn"
              onClick={fetchReviews}
            >
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="all-reviews-empty">
            <FiMessageSquare />

            <h2>No Reviews Yet</h2>

            <p>
              Customer reviews will appear here after customers review
              their completed services.
            </p>
          </div>
        ) : (
          <div className="all-reviews-list">
            {reviews.map((item, index) => {
              const customerName = item.customer?.name || "Customer";
              const serviceName = getServiceName(item.booking);

              return (
                <motion.div
                  key={item._id || item.id || index}
                  className="all-review-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.4) }}
                >
                  <div className="all-review-top">
                    <div className="all-review-customer">
                      <div className="all-review-avatar">
                        {customerName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{customerName}</h3>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {renderStars(item.rating)}
                  </div>

                  <p className="all-review-text">
                    {item.review || "No written feedback provided."}
                  </p>

                  {serviceName && (
                    <span className="all-review-service">
                      {serviceName}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default TechnicianReviews;
