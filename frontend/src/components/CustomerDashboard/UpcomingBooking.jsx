import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Navigation,
  Wrench,
  CheckCircle2,
  Loader2,
  CreditCard,
  UserRound,
} from "lucide-react";

import "./UpcomingBooking.css";

const UpcomingBooking = () => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH CUSTOMER BOOKINGS
  // =========================================================

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setBooking(null);
        setLoading(false);
        return;
      }

      const response = await api.get("/bookings/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookings =
        response.data?.bookings ||
        response.data?.data ||
        [];

      if (!Array.isArray(bookings) || bookings.length === 0) {
        setBooking(null);
        setLoading(false);
        return;
      }

      // =====================================================
      // FIND CURRENT ACTIVE BOOKING
      // =====================================================

      const activeStatuses = [
        "Pending",
        "Accepted",
        "On The Way",
        "In Progress",
      ];

      const activeBookings = bookings.filter((item) =>
        activeStatuses.includes(item.status)
      );

      if (activeBookings.length > 0) {
        // Most recently created active booking
        const sortedActiveBookings = [...activeBookings].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        setBooking(sortedActiveBookings[0]);
      } else {
        setBooking(null);
      }
    } catch (error) {
      console.error(
        "Upcoming Booking Error:",
        error
      );

      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchBooking();

    const interval = setInterval(() => {
      fetchBooking();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="upcoming-booking-section">
        <div className="upcoming-booking-loading">
          <Loader2
            className="loading-icon"
            size={24}
          />

          <span>
            Checking your booking...
          </span>
        </div>
      </section>
    );
  }

  // =========================================================
  // NO ACTIVE BOOKING
  // =========================================================

  if (!booking) {
    return (
      <section className="upcoming-booking-section">
        <div className="upcoming-empty-card">

          <div className="empty-icon">
            <CalendarDays size={30} />
          </div>

          <div className="empty-content">

            <span className="empty-label">
              YOUR BOOKINGS
            </span>

            <h2>
              No active booking
            </h2>

            <p>
              You don't have an upcoming service
              request right now.
            </p>

            <button
              type="button"
              className="empty-book-button"
              onClick={() =>
                navigate("/services")
              }
            >
              Book a Service
            </button>

          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // REAL BOOKING DATA
  // =========================================================

  const status =
    booking.status || "Pending";

  // =========================================================
  // SERVICE
  // =========================================================

  const serviceName =
    booking.service?.name ||
    booking.serviceName ||
    booking.service?.title ||
    "Home Service";

  // =========================================================
  // TECHNICIAN
  // =========================================================

  const technician =
    booking.technician ||
    booking.assignedTechnician ||
    null;

  const technicianName =
    typeof technician === "object" && technician
      ? technician.name ||
        technician.fullName ||
        ""
      : "";

  const technicianPhone =
    typeof technician === "object" && technician
      ? technician.phone ||
        technician.mobile ||
        ""
      : "";

  // =========================================================
  // TECHNICIAN INITIALS
  // =========================================================

  const technicianInitials = technicianName
    ? technicianName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "T";

  // =========================================================
  // BOOKING ID
  // =========================================================

  const bookingNumber =
    booking.bookingNumber ||
    booking.bookingId ||
    booking._id?.slice(-8).toUpperCase() ||
    "N/A";

  // =========================================================
  // IMPORTANT:
  // PAYMENT STATUS MUST COME FROM BACKEND
  //
  // Pending = not successfully paid
  // Paid    = backend verified successful payment
  // =========================================================

  const rawPaymentStatus =
    booking.paymentStatus;

  const paymentStatus =
    rawPaymentStatus === "Paid"
      ? "Paid"
      : "Pending";

  const isPaymentPaid =
    paymentStatus === "Paid";

  // =========================================================
  // ADDRESS
  // =========================================================

  const address =
    booking.address ||
    booking.serviceAddress ||
    booking.location ||
    "Address not available";

  // =========================================================
  // DATE
  // =========================================================

  const bookingDate =
    booking.date ||
    booking.bookingDate ||
    "";

  // =========================================================
  // TIME
  // =========================================================

  const bookingTime =
    booking.time ||
    booking.bookingTime ||
    "";

  // =========================================================
  // STATUS INFORMATION
  // =========================================================

  const statusData = {
    Pending: {
      title: "Waiting for technician",
      description:
        "Your request is waiting for a technician to accept it.",
      message:
        "Your booking request has been sent. We are looking for an available technician.",
    },

    Accepted: {
      title: technicianName
        ? `${technicianName} accepted your booking`
        : "Technician confirmed",

      description:
        "Your technician has accepted the booking and will start travelling to your location.",

      message:
        "Your technician has accepted your booking.",
    },

    "On The Way": {
      title: technicianName
        ? `${technicianName} is on the way`
        : "Technician is on the way",

      description:
        "Your technician is travelling to your location.",

      message:
        "Your technician is on the way. Live tracking will appear when location sharing starts.",
    },

    "In Progress": {
      title: "Service is in progress",

      description:
        "Your technician is currently working on your service.",

      message:
        "Your service is currently in progress.",
    },

    Completed: {
      title: "Service completed",

      description:
        "Your service has been completed successfully.",

      message:
        "Your service has been completed successfully.",
    },
  };

  const currentStatus =
    statusData[status] ||
    statusData.Pending;

  // =========================================================
  // PROGRESS STEPS
  // =========================================================

  const progressSteps = [
    {
      key: "request",
      title: "Request Sent",
      description:
        "Your booking request has been received.",
      icon: <CheckCircle2 size={18} />,
      active: true,
    },

    {
      key: "technician",
      title:
        technicianName ||
        "Technician Confirmation",

      description: technicianName
        ? "Technician has accepted your booking."
        : "Waiting for a technician to accept your request.",

      icon: <UserRound size={18} />,

      active: [
        "Accepted",
        "On The Way",
        "In Progress",
        "Completed",
      ].includes(status),
    },

    {
      key: "way",
      title: "On The Way",

      description:
        "Technician is travelling to your location.",

      icon: <Navigation size={18} />,

      active: [
        "On The Way",
        "In Progress",
        "Completed",
      ].includes(status),
    },

    {
      key: "service",

      title:
        status === "Completed"
          ? "Service Completed"
          : "Service",

      description:
        status === "Completed"
          ? "Your service has been completed successfully."
          : status === "In Progress"
          ? "Technician is currently working on your service."
          : "Service will begin after technician arrival and verification.",

      icon: <Wrench size={18} />,

      active:
        status === "In Progress" ||
        status === "Completed",
    },
  ];

  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  const statusClass = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  // =========================================================
  // TRACK BOOKING
  // =========================================================

  const handleTrack = () => {
    if (!booking?._id) {
      return;
    }

    navigate(
      `/track-booking/${booking._id}`
    );
  };

  // =========================================================
  // CALL TECHNICIAN
  // =========================================================

  const handleCall = () => {
    if (!technicianPhone) {
      return;
    }

    window.location.href =
      `tel:${technicianPhone}`;
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <section className="upcoming-booking-section">

      <div className="upcoming-booking-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="booking-top-header">

          <div className="booking-heading">

            <span className="booking-label">
              YOUR SERVICE
            </span>

            <h2>
              Booking Request
            </h2>

            <p>
              {currentStatus.description}
            </p>

          </div>

          <div
            className={`booking-status status-${statusClass}`}
          >
            <span className="booking-status-dot"></span>

            {status}
          </div>

        </div>


        {/* =================================================
            TECHNICIAN / CURRENT STATUS
        ================================================= */}

        <div className="technician-section">

          <div className="technician-avatar">

            {technicianName ? (
              technicianInitials
            ) : (
              <Wrench size={34} />
            )}

          </div>


          <div className="technician-main-info">

            <span className="technician-label">
              TECHNICIAN
            </span>

            <h3>
              {currentStatus.title}
            </h3>

            <p>
              {technicianName
                ? `Assigned technician: ${technicianName}`
                : "Searching for an available technician"}
            </p>

          </div>


          {status === "Pending" && (
            <div className="searching-indicator">

              <span className="searching-dot"></span>

              Searching

            </div>
          )}


          {technicianName &&
            status !== "Pending" && (
              <div className="technician-confirmed">

                <CheckCircle2 size={17} />

                Confirmed

              </div>
            )}

        </div>


        {/* =================================================
            BOOKING DETAILS
        ================================================= */}

        <div className="booking-details">

          {/* SERVICE */}

          <div className="booking-detail-card">

            <div className="detail-icon service-icon">
              <Wrench size={21} />
            </div>

            <div>

              <span>
                SERVICE
              </span>

              <strong>
                {serviceName}
              </strong>

            </div>

          </div>


          {/* DATE */}

          <div className="booking-detail-card">

            <div className="detail-icon date-icon">
              <CalendarDays size={21} />
            </div>

            <div>

              <span>
                DATE
              </span>

              <strong>
                {bookingDate ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* TIME */}

          <div className="booking-detail-card">

            <div className="detail-icon time-icon">
              <Clock3 size={21} />
            </div>

            <div>

              <span>
                TIME
              </span>

              <strong>
                {bookingTime ||
                  "Not available"}
              </strong>

            </div>

          </div>


          {/* ADDRESS */}

          <div className="booking-detail-card">

            <div className="detail-icon address-icon">
              <MapPin size={21} />
            </div>

            <div>

              <span>
                SERVICE ADDRESS
              </span>

              <strong>
                {address}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            BOOKING PROGRESS
        ================================================= */}

        <div className="booking-progress">

          <div className="progress-header">

            <div>

              <span className="progress-label">
                BOOKING PROGRESS
              </span>

              <h3>
                {currentStatus.title}
              </h3>

            </div>


            <div
              className={`progress-status progress-${statusClass}`}
            >
              <span></span>

              {status}
            </div>

          </div>


          {/* TIMELINE */}

          <div className="progress-timeline">

            {progressSteps.map(
              (step, index) => (
                <div
                  key={step.key}
                  className={`progress-step ${
                    step.active
                      ? "is-active"
                      : ""
                  }`}
                >

                  <div className="progress-step-top">

                    <div className="progress-step-icon">
                      {step.icon}
                    </div>

                    {index <
                      progressSteps.length -
                        1 && (
                      <div
                        className={`progress-line ${
                          progressSteps[
                            index + 1
                          ].active
                            ? "line-active"
                            : ""
                        }`}
                      ></div>
                    )}

                  </div>


                  <div className="progress-step-content">

                    <strong>
                      {step.title}
                    </strong>

                    <span>
                      {step.description}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>


          {/* CURRENT MESSAGE */}

          <div
            className={`progress-message message-${statusClass}`}
          >

            {status === "Pending" ? (
              <Clock3 size={18} />
            ) : status === "Accepted" ? (
              <CheckCircle2 size={18} />
            ) : status === "On The Way" ? (
              <Navigation size={18} />
            ) : status === "In Progress" ? (
              <Wrench size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <span>
              {currentStatus.message}
            </span>

          </div>

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="booking-actions">

          {status !== "Pending" && (
            <button
              type="button"
              className="track-booking-button"
              onClick={handleTrack}
            >
              <Navigation size={17} />

              Track Booking
            </button>
          )}


          {technicianPhone && (
            <button
              type="button"
              className="call-technician-button"
              onClick={handleCall}
            >
              <Phone size={17} />

              Call Technician
            </button>
          )}


          {status === "Pending" && (
            <div className="waiting-message">

              <Clock3 size={17} />

              Waiting for a technician
              to accept your booking

            </div>
          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="booking-footer">

          {/* BOOKING ID */}

          <div className="booking-id">

            <span>
              BOOKING ID
            </span>

            <strong>
              {bookingNumber}
            </strong>

          </div>


          {/* PAYMENT */}

          <div className="payment-info">

            <span>
              PAYMENT
            </span>

            <strong
              className={
                isPaymentPaid
                  ? "payment-paid"
                  : "payment-pending"
              }
            >

              <CreditCard size={16} />

              {paymentStatus}

            </strong>

          </div>

        </div>

      </div>

    </section>
  );
};

export default UpcomingBooking;