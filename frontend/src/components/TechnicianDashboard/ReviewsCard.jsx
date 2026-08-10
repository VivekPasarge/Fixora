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
// const navigate = useNavigate();

const ReviewsCard = () => {

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);


  /* =========================================================
     FETCH REVIEWS
  ========================================================= */

  useEffect(() => {

    const fetchReviews = async () => {

      try {

        const storedUser =
          localStorage.getItem("user");


        if (!storedUser) {
          setLoading(false);
          return;
        }


        const user =
          JSON.parse(storedUser);


        if (!user?._id) {
          setLoading(false);
          return;
        }


        const token =
          localStorage.getItem("token");


        const response = await api.get(
          `/reviews/technician/${user._id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        console.log(
          "Technician Reviews:",
          response.data
        );


        setReviews(
          response.data.reviews || []
        );

      } catch (error) {

        console.log(
          "Reviews Error:",
          error
        );

        setReviews([]);

      } finally {

        setLoading(false);

      }

    };


    fetchReviews();

  }, []);


  /* =========================================================
     AVERAGE RATING
  ========================================================= */

  const averageRating = useMemo(() => {

    if (reviews.length === 0) {
      return "0.0";
    }


    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );


    return (
      total / reviews.length
    ).toFixed(1);

  }, [reviews]);


  /* =========================================================
     RATING STARS
  ========================================================= */

  const renderStars = (rating) => {

    const safeRating = Math.min(
      5,
      Math.max(
        0,
        Number(rating) || 0
      )
    );


    return (
      <div className="review-stars">

        {[1, 2, 3, 4, 5].map(
          (star) => (

            <FiStar
              key={star}
              className={
                star <= safeRating
                  ? "star-filled"
                  : "star-empty"
              }

              fill={
                star <= safeRating
                  ? "currentColor"
                  : "none"
              }
            />

          )
        )}

      </div>
    );

  };


  /* =========================================================
     VIEW ALL
  ========================================================= */

  const handleViewAll = () => {
  navigate("/technician/reviews");
};

  /* =========================================================
     UI
  ========================================================= */

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.4,
      }}

      className="reviews-card"

      id="all-technician-reviews"
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="reviews-header">

        <div>

          <div className="reviews-title-row">

            <h2 className="reviews-title">
              Recent Reviews
            </h2>

            <FiMessageSquare
              className="reviews-header-icon"
            />

          </div>

          <p className="reviews-subtitle">
            Customer feedback about your services.
          </p>

        </div>


        {!loading &&
          reviews.length > 0 && (

            <div className="reviews-summary">

              <strong>
                {averageRating}
              </strong>

              {renderStars(
                Math.round(
                  Number(averageRating)
                )
              )}

              <span>
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "Review"
                  : "Reviews"}
              </span>

            </div>

          )}

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="reviews-loading">

          <div className="reviews-spinner"></div>

          <p>
            Loading reviews...
          </p>

        </div>

      )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        reviews.length === 0 && (

          <div className="reviews-empty">

            <div className="reviews-empty-icon">

              <FiStar />

            </div>

            <h3>
              No Reviews Yet
            </h3>

            <p>
              Customer reviews will appear
              here after completed services.
            </p>

          </div>

        )}


      {/* =====================================================
          REVIEWS
      ===================================================== */}

      {!loading &&
        reviews.length > 0 && (

          <div className="reviews-list">

            {reviews.map(
              (review, index) => (

                <div
                  key={
                    review._id ||
                    review.id ||
                    index
                  }

                  className="review-item"
                >


                  {/* =========================================
                      REVIEW HEADER
                  ========================================= */}

                  <div className="review-header">

                    <div className="review-customer">

                      <div className="review-avatar">

                        {(
                          review.customer?.name ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <h3 className="review-name">

                          {review.customer?.name ||
                            "Customer"}

                        </h3>

                        <p className="review-date">

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

                        </p>

                      </div>

                    </div>


                    {renderStars(
                      review.rating
                    )}

                  </div>


                  {/* =========================================
                      REVIEW TEXT
                  ========================================= */}

                  <p className="review-text">

                    {review.review ||
                      "No written feedback provided."}

                  </p>


                  {/* =========================================
                      SERVICE
                  ========================================= */}

                  {review.booking?.service?.name && (

                    <span className="review-service">

                      {review.booking.service.name}

                    </span>

                  )}

                </div>

              )
            )}

          </div>

        )}


      {/* =====================================================
          VIEW ALL
      ===================================================== */}

      {!loading &&
        reviews.length > 0 && (

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