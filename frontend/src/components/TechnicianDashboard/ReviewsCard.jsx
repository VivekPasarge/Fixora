import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import api from "../../api/axios";
import "./ReviewsCard.css";

const ReviewsCard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) return;

      const response = await api.get(
        `/reviews/technician/${user._id}`
      );

      setReviews(response.data.reviews);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="reviews-card"
    >
      <h2 className="reviews-title">
        Recent Reviews
      </h2>

      <p className="reviews-subtitle">
        Customer Feedback
      </p>

      {loading ? (

        <p>Loading...</p>

      ) : reviews.length === 0 ? (

        <p>No Reviews Yet</p>

      ) : (

        <div className="reviews-list">

          {reviews.map((review) => (

            <div
              key={review._id}
              className="review-item"
            >

              <div className="review-header">

                <h3 className="review-name">
                  {review.customer.name}
                </h3>

                <div className="review-stars">

                  {[...Array(review.rating)].map(
                    (_, index) => (
                      <FiStar
                        key={index}
                        fill="currentColor"
                      />
                    )
                  )}

                </div>

              </div>

              <p className="review-text">
                {review.review}
              </p>

            </div>

          ))}

        </div>

      )}

    </motion.div>
  );
};

export default ReviewsCard;