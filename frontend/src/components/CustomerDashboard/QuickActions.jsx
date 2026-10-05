import { useEffect, useState } from "react";
import "./QuickActions.css";

import {
  FiPlusCircle,
  FiClipboard,
  FiCreditCard,
  FiHeadphones,
  FiX,
  FiClock,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const actions = [
  {
    id: 1,
    title: "Book Service",
    description: "Schedule a new home service.",
    icon: <FiPlusCircle />,
    color: "blue",
    path: "/services",
  },
  {
    id: 2,
    title: "My Bookings",
    description: "View all current and past bookings.",
    icon: <FiClipboard />,
    color: "green",
    path: "/my-bookings",
  },
  {
    id: 3,
    title: "Payments",
    description: "View your payment history and status.",
    icon: <FiCreditCard />,
    color: "orange",
  },
  {
    id: 4,
    title: "Support",
    description: "Need help? Contact our support team.",
    icon: <FiHeadphones />,
    color: "purple",
    path: "/contact",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [payments, setPayments] = useState([]);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  // =====================================================
  // FETCH PAYMENT HISTORY
  // =====================================================

  const fetchPayments = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setPaymentError(
          "Please login again to view payment history."
        );
        return;
      }

      const response = await api.get(
        "/bookings/payment-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        response.data?.payments ||
        response.data?.bookings ||
        [];

      setPayments(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Payment History Error:",
        error
      );

      setPaymentError(
        error.response?.data?.message ||
          "Unable to load payment history."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // =====================================================
  // OPEN PAYMENT
  // =====================================================

  const openPayments = async () => {
    setShowPaymentModal(true);

    await fetchPayments();
  };

  // =====================================================
  // HANDLE ACTION
  // =====================================================

  const handleAction = (action) => {
    if (action.id === 3) {
      openPayments();
      return;
    }

    if (action.path) {
      navigate(action.path);
    }
  };

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (payment) => {
    if (
      payment.paymentStatus === "Paid" ||
      payment.status === "Paid"
    ) {
      return "Paid";
    }

    return "Pending";
  };

  // =====================================================
  // PAYMENT DATE
  // =====================================================

  const getPaymentDate = (payment) => {
    const date =
      payment.paidAt ||
      payment.updatedAt ||
      payment.createdAt;

    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // PAYMENT AMOUNT
  // =====================================================

  const getPaymentAmount = (payment) => {
    const amount =
      payment.amount ??
      payment.totalAmount ??
      payment.price ??
      payment.service?.price ??
      0;

    return Number(amount).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );
  };

  // =====================================================
  // PAYMENT METHOD
  // =====================================================

  const getPaymentMethod = (payment) => {
    return (
      payment.paymentMethod ||
      "Not specified"
    );
  };

  // =====================================================
  // BOOKING ID
  // =====================================================

  const getBookingId = (payment) => {
    return (
      payment.bookingNumber ||
      payment.bookingId ||
      payment._id ||
      "N/A"
    );
  };

  return (
    <>
      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="quick-actions">

        <div className="section-heading">

          <h2>Quick Actions</h2>

          <p>
            Access your most-used features with one click.
          </p>

        </div>

        <div className="actions-grid">

          {actions.map((action) => (

            <div
              key={action.id}
              className={`action-card ${action.color}`}
            >

              <div className="action-icon">
                {action.icon}
              </div>

              <h3>
                {action.title}
              </h3>

              <p>
                {action.description}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleAction(action)
                }
              >
                {action.id === 3
                  ? "View Payments"
                  : "Open"}
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* =================================================
          PAYMENT MODAL
      ================================================= */}

      {showPaymentModal && (

        <div
          className="payment-modal-overlay"
          onClick={() =>
            setShowPaymentModal(false)
          }
        >

          <div
            className="payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="payment-modal-close"
              onClick={() =>
                setShowPaymentModal(false)
              }
              aria-label="Close"
            >
              <FiX />
            </button>

            {/* HEADER */}

            <div className="payment-modal-icon">
              <FiCreditCard />
            </div>

            <h2>
              Payment History
            </h2>

            <p className="payment-modal-description">
              View your recent Fixora payments and
              payment status.
            </p>

            {/* =================================================
                LOADING
            ================================================= */}

            {paymentLoading && (

              <div className="payment-loading">

                <div className="payment-spinner"></div>

                <p>
                  Loading payment history...
                </p>

              </div>

            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!paymentLoading &&
              paymentError && (

                <div className="payment-error">

                  <FiAlertCircle />

                  <p>
                    {paymentError}
                  </p>

                </div>

              )}

            {/* =================================================
                NO PAYMENTS
            ================================================= */}

            {!paymentLoading &&
              !paymentError &&
              payments.length === 0 && (

                <div className="no-payments">

                  <div className="no-payment-icon">
                    <FiCreditCard />
                  </div>

                  <h3>
                    No payment history
                  </h3>

                  <p>
                    Your payment transactions will
                    appear here after you make a booking.
                  </p>

                </div>

              )}

            {/* =================================================
                PAYMENT LIST
            ================================================= */}

            {!paymentLoading &&
              !paymentError &&
              payments.length > 0 && (

                <div className="payment-list">

                  {payments
                    .slice(0, 5)
                    .map((payment, index) => {

                      const status =
                        getPaymentStatus(
                          payment
                        );

                      const isPaid =
                        status === "Paid";

                      return (

                        <div
                          className="payment-item"
                          key={
                            payment._id ||
                            payment.id ||
                            index
                          }
                        >

                          <div className="payment-item-left">

                            <div className="payment-item-icon">
                              <FiCreditCard />
                            </div>

                            <div>

                              <h4>
                                {payment.service?.name ||
                                  payment.serviceName ||
                                  "Fixora Service"}
                              </h4>

                              <span>
                                Booking #
                                {getBookingId(
                                  payment
                                )}
                              </span>

                              <small>
                                {getPaymentDate(
                                  payment
                                )}
                              </small>

                            </div>

                          </div>

                          <div className="payment-item-right">

                            <strong>
                              {getPaymentAmount(
                                payment
                              )}
                            </strong>

                            <span
                              className={
                                isPaid
                                  ? "payment-status paid"
                                  : "payment-status pending"
                              }
                            >

                              {isPaid ? (
                                <FiCheckCircle />
                              ) : (
                                <FiClock />
                              )}

                              {status}

                            </span>

                            <small>
                              {getPaymentMethod(
                                payment
                              )}
                            </small>

                          </div>

                        </div>

                      );
                    })}

                </div>

              )}

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="payment-security">

              <FiShield />

              <div>

                <strong>
                  Secure Payments
                </strong>

                <span>
                  Your payment information is protected.
                </span>

              </div>

            </div>

            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="payment-modal-button"
              onClick={() =>
                setShowPaymentModal(false)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </>
  );
};

export default QuickActions;