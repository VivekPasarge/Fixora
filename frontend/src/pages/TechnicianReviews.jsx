import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./TechnicianReviews.css";

const TechnicianReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const token = localStorage.getItem("token");

        const response = await api.get(
          `/reviews/technician/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setReviews(response.data.reviews || []);
      } catch (error) {
        console.log("Reviews Error:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating) => {
    return (
      <div className="all-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={
              star <= Number(rating)
                ? "star-filled"
                : "star-empty"
            }
            fill={
              star <= Number(rating)
                ? "currentColor"
                : "none"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <main className="technician-reviews-page">

      <div className="technician-reviews-container">

        <button
          type="button"
          className="reviews-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <motion.div
          className="reviews-page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span>
              CUSTOMER FEEDBACK
            </span>

            <h1>
              All Reviews
            </h1>

            <p>
              See what customers think about
              your completed services.
            </p>
          </div>

          <div className="reviews-page-rating">

            <strong>
              {averageRating}
            </strong>

            {renderStars(
              Math.round(Number(averageRating))
            )}

            <small>
              {reviews.length}{" "}
              {reviews.length === 1
                ? "Review"
                : "Reviews"}
            </small>

          </div>
        </motion.div>


        {loading ? (

          <div className="all-reviews-loading">
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (

          <div className="all-reviews-empty">

            <FiMessageSquare />

            <h2>
              No Reviews Yet
            </h2>

            <p>
              Customer reviews will appear
              here after completed services.
            </p>

          </div>

        ) : (

          <div className="all-reviews-list">

            {reviews.map((review, index) => (

              <motion.div
                key={
                  review._id ||
                  review.id ||
                  index
                }
                className="all-review-card"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
              >

                <div className="all-review-top">

                  <div className="all-review-customer">

                    <div className="all-review-avatar">
                      {(
                        review.customer?.name ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3>
                        {review.customer?.name ||
                          "Customer"}
                      </h3>

                      <span>
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Recent"}
                      </span>

                    </div>

                  </div>

                  {renderStars(review.rating)}

                </div>

                <p className="all-review-text">
                  {review.review ||
                    "No written feedback provided."}
                </p>

                {review.booking?.service?.name && (
                  <span className="all-review-service">
                    {review.booking.service.name}
                  </span>
                )}

              </motion.div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
};

export default TechnicianReviews;