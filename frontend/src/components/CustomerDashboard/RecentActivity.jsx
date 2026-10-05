import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiStar,
  FiCreditCard,
  FiX,
  FiCalendar,
  FiInfo,
  FiTool,
} from "react-icons/fi";

import api from "../../api/axios";
import "./RecentActivity.css";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] =
    useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    const today = new Date();

    const isToday =
      date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const isYesterday =
      date.toDateString() ===
      yesterday.toDateString();

    const time = date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

    if (isToday) {
      return `Today • ${time}`;
    }

    if (isYesterday) {
      return `Yesterday • ${time}`;
    }

    return `${date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )} • ${time}`;
  };

  // =========================================================
  // GET SERVICE NAME
  // =========================================================

  const getServiceName = (booking) => {
    return (
      booking?.service?.name ||
      booking?.service?.title ||
      booking?.serviceName ||
      "Home Service"
    );
  };

  // =========================================================
  // GET BOOKING DATE
  // =========================================================

  const getBookingCreatedDate = (booking) => {
    return (
      booking?.createdAt ||
      booking?.updatedAt ||
      booking?.bookingDate ||
      new Date()
    );
  };

  // =========================================================
  // GET PAYMENT DATE
  // =========================================================

  const getPaymentDate = (booking) => {
    return (
      booking?.paidAt ||
      booking?.updatedAt ||
      booking?.createdAt
    );
  };

  // =========================================================
  // FETCH REAL BOOKINGS
  // =========================================================

  const fetchActivities = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const response = await api.get(
        "/bookings/my-bookings",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const bookings =
        response.data?.bookings ||
        response.data?.data ||
        [];

      if (!Array.isArray(bookings)) {
        setActivities([]);
        return;
      }

      const generatedActivities = [];

      // =====================================================
      // CREATE ACTIVITIES FROM REAL BOOKINGS
      // =====================================================

      bookings.forEach((booking) => {
        const serviceName =
          getServiceName(booking);

        const bookingDate =
          getBookingCreatedDate(booking);

        // ===================================================
        // BOOKING REQUEST
        // ===================================================

        generatedActivities.push({
          id:
            `${booking._id}-booking`,

          icon: <FiClock />,

          title:
            booking.status === "Pending"
              ? "Booking Request Sent"
              : booking.status === "Cancelled"
              ? "Booking Cancelled"
              : "Booking Created",

          description:
            booking.status === "Pending"
              ? `${serviceName} booking is waiting for technician confirmation.`
              : booking.status === "Cancelled"
              ? `Your ${serviceName} booking was cancelled.`
              : `Your ${serviceName} booking was created successfully.`,

          time:
            formatDateTime(bookingDate),

          color:
            booking.status === "Cancelled"
              ? "red"
              : booking.status === "Pending"
              ? "blue"
              : "blue",

          type: "booking",

          booking,
        });

        // ===================================================
        // TECHNICIAN ACCEPTED
        // ===================================================

        if (
          [
            "Accepted",
            "On The Way",
            "In Progress",
            "Completed",
          ].includes(booking.status)
        ) {
          const technician =
            booking.technician;

          const technicianName =
            typeof technician === "object" &&
            technician
              ? technician.name ||
                technician.fullName ||
                "Technician"
              : "Technician";

          generatedActivities.push({
            id:
              `${booking._id}-confirmed`,

            icon: <FiCheckCircle />,

            title:
              "Booking Confirmed",

            description:
              `${serviceName} booking has been accepted by ${technicianName}.`,

            time:
              formatDateTime(
                booking.updatedAt ||
                booking.createdAt
              ),

            color: "green",

            type: "booking",

            booking,
          });
        }

        // ===================================================
        // PAYMENT
        //
        // IMPORTANT:
        // ONLY SHOW PAYMENT SUCCESSFUL WHEN:
        //
        // booking.paymentStatus === "Paid"
        // ===================================================

        if (
          booking.paymentStatus ===
          "Paid"
        ) {
          const paymentMethod =
            booking.paymentMethod ||
            "Online Payment";

          const price =
            Number(booking.price) || 0;

          generatedActivities.push({
            id:
              `${booking._id}-payment`,

            icon:
              <FiCreditCard />,

            title:
              "Payment Successful",

            description:
              `₹${price.toLocaleString(
                "en-IN"
              )} paid using ${paymentMethod}.`,

            time:
              formatDateTime(
                getPaymentDate(booking)
              ),

            color: "purple",

            type: "payment",

            booking,
          });
        }

        // ===================================================
        // PAYMENT PENDING
        //
        // This is shown only when there is a payment method
        // and payment is not completed.
        // ===================================================

        else if (
          booking.paymentMethod &&
          booking.paymentStatus !==
            "Paid"
        ) {
          const price =
            Number(booking.price) || 0;

          generatedActivities.push({
            id:
              `${booking._id}-payment-pending`,

            icon:
              <FiClock />,

            title:
              "Payment Pending",

            description:
              `₹${price.toLocaleString(
                "en-IN"
              )} payment is pending.`,

            time:
              formatDateTime(
                booking.updatedAt ||
                booking.createdAt
              ),

            color: "orange",

            type: "payment-pending",

            booking,
          });
        }

        // ===================================================
        // SERVICE COMPLETED
        // ===================================================

        if (
          booking.status ===
          "Completed"
        ) {
          generatedActivities.push({
            id:
              `${booking._id}-completed`,

            icon:
              <FiCheckCircle />,

            title:
              `${serviceName} Completed`,

            description:
              `Your ${serviceName} service was completed successfully.`,

            time:
              formatDateTime(
                booking.updatedAt ||
                booking.createdAt
              ),

            color: "green",

            type: "completed",

            booking,
          });
        }
      });

      // =====================================================
      // SORT NEWEST FIRST
      // =====================================================

      generatedActivities.sort(
        (a, b) => {
          const dateA = new Date(
            a.booking?.paidAt ||
            a.booking?.updatedAt ||
            a.booking?.createdAt ||
            0
          );

          const dateB = new Date(
            b.booking?.paidAt ||
            b.booking?.updatedAt ||
            b.booking?.createdAt ||
            0
          );

          return (
            dateB.getTime() -
            dateA.getTime()
          );
        }
      );

      // =====================================================
      // SHOW ONLY LATEST 6
      // =====================================================

      setActivities(
        generatedActivities.slice(0, 6)
      );
    } catch (error) {
      console.error(
        "Recent Activity Error:",
        error
      );

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchActivities();

    const interval = setInterval(
      () => {
        fetchActivities();
      },
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // ACTIVITY CLICK
  // =========================================================

  const handleActivityClick = (
    activity
  ) => {
    setSelectedActivity(activity);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setSelectedActivity(null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="recent-activity">

        <div className="activity-header">

          <h2>
            Recent Activity
          </h2>

          <p>
            Your latest Fixora updates.
          </p>

        </div>

        <div className="activity-loading">
          Loading your latest activity...
        </div>

      </section>
    );
  }

  // =========================================================
  // NO ACTIVITY
  // =========================================================

  if (activities.length === 0) {
    return (
      <section className="recent-activity">

        <div className="activity-header">

          <h2>
            Recent Activity
          </h2>

          <p>
            Your latest Fixora updates.
          </p>

        </div>

        <div className="activity-empty">

          <div className="activity-empty-icon">
            <FiInfo />
          </div>

          <div>
            <h3>
              No recent activity
            </h3>

            <p>
              Your Fixora bookings and
              payments will appear here.
            </p>
          </div>

        </div>

      </section>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <>
      <section className="recent-activity">

        <div className="activity-header">

          <h2>
            Recent Activity
          </h2>

          <p>
            Your latest Fixora updates.
          </p>

        </div>


        <div className="activity-list">

          {activities.map(
            (activity) => (

              <button
                type="button"
                className="activity-card"
                key={activity.id}
                onClick={() =>
                  handleActivityClick(
                    activity
                  )
                }
              >

                <div
                  className={`activity-icon ${activity.color}`}
                >
                  {activity.icon}
                </div>


                <div className="activity-content">

                  <h3>
                    {activity.title}
                  </h3>

                  <p>
                    {activity.description}
                  </p>

                  <span>
                    {activity.time}
                  </span>

                </div>


                <div className="activity-arrow">
                  →
                </div>

              </button>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          ACTIVITY MODAL
      ===================================================== */}

      {selectedActivity && (

        <div
          className="activity-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="activity-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="activity-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <FiX />
            </button>


            <div
              className={`activity-modal-icon ${selectedActivity.color}`}
            >
              {selectedActivity.icon}
            </div>


            <span className="activity-modal-badge">
              Recent Activity
            </span>


            <h2>
              {selectedActivity.title}
            </h2>


            <p className="activity-modal-description">
              {selectedActivity.description}
            </p>


            <div className="activity-modal-info">

              {/* DATE */}

              <div className="activity-info-row">

                <FiCalendar />

                <div>

                  <span>
                    Date & Time
                  </span>

                  <strong>
                    {selectedActivity.time}
                  </strong>

                </div>

              </div>


              {/* TYPE */}

              <div className="activity-info-row">

                <FiInfo />

                <div>

                  <span>
                    Activity Type
                  </span>

                  <strong>
                    {selectedActivity.type ===
                    "payment"
                      ? "Payment"
                      : selectedActivity.type ===
                        "payment-pending"
                      ? "Payment Pending"
                      : selectedActivity.type ===
                        "completed"
                      ? "Service Completed"
                      : "Booking"}
                  </strong>

                </div>

              </div>

            </div>


            {/* =================================================
                REAL PAYMENT DETAILS
            ================================================= */}

            {selectedActivity.type ===
              "payment" && (
              <div className="activity-payment-box">

                <div className="payment-box-icon">
                  <FiCreditCard />
                </div>

                <div>

                  <strong>
                    Payment Successful
                  </strong>

                  <span>
                    ₹
                    {Number(
                      selectedActivity
                        .booking?.price ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                    {" "}paid using{" "}
                    {selectedActivity
                      .booking
                      ?.paymentMethod ||
                      "Online Payment"}
                  </span>

                </div>

              </div>
            )}


            {/* =================================================
                REAL PENDING PAYMENT
            ================================================= */}

            {selectedActivity.type ===
              "payment-pending" && (
              <div className="activity-pending-box">

                <FiClock />

                <div>

                  <strong>
                    Payment Pending
                  </strong>

                  <span>
                    Payment has not been
                    completed yet.
                  </span>

                </div>

              </div>
            )}


            {/* =================================================
                COMPLETED
            ================================================= */}

            {selectedActivity.type ===
              "completed" && (
              <div className="activity-completed-box">

                <FiCheckCircle />

                <div>

                  <strong>
                    Service Completed
                  </strong>

                  <span>
                    Your Fixora service was
                    completed successfully.
                  </span>

                </div>

              </div>
            )}


            <button
              type="button"
              className="activity-modal-button"
              onClick={closeModal}
            >
              Close
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default RecentActivity;