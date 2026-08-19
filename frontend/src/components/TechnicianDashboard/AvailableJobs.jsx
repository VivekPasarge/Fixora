import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AvailableJobs.css";

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(true);

  const [acceptingJobId, setAcceptingJobId] =
    useState(null);

  // ==========================================
  // PRE-ACCEPTANCE CANCEL
  // ==========================================

  const [cancellingJobId, setCancellingJobId] =
    useState(null);

  const [showCancelPopup, setShowCancelPopup] =
    useState(false);

  const [selectedCancelJob, setSelectedCancelJob] =
    useState(null);

  // ==========================================
  // Acceptance Information Popup
  // ==========================================

  const [showAcceptancePopup, setShowAcceptancePopup] =
    useState(false);

  const [selectedJob, setSelectedJob] =
    useState(null);

  // ==========================================
  // LOAD TECHNICIAN AVAILABILITY
  // ==========================================

  useEffect(() => {
    const savedStatus =
      localStorage.getItem(
        "technicianOnline"
      );

    if (savedStatus !== null) {
      setIsOnline(
        savedStatus === "true"
      );
    }
  }, []);

  // ==========================================
  // LISTEN FOR AVAILABILITY CHANGES
  // ==========================================

  useEffect(() => {
    const handleAvailabilityChange = (
      event
    ) => {
      const online =
        event.detail?.isOnline;

      setIsOnline(online);

      if (!online) {
        setJobs([]);
      }
    };

    window.addEventListener(
      "technicianAvailabilityChanged",
      handleAvailabilityChange
    );

    return () => {
      window.removeEventListener(
        "technicianAvailabilityChanged",
        handleAvailabilityChange
      );
    };
  }, []);

  // ==========================================
  // FETCH AVAILABLE JOBS
  // ==========================================

  useEffect(() => {
    if (!isOnline) {
      setJobs([]);
      setLoading(false);

      return;
    }

    fetchJobs();

    const interval = setInterval(() => {
      fetchJobs(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline]);

  // ==========================================
  // FETCH JOBS
  // ==========================================

  const fetchJobs = async (
    silent = false
  ) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        console.log(
          "No technician token found"
        );

        setJobs([]);

        return;
      }

      const response =
        await api.get(
          "/bookings/available",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Available Jobs:",
        response.data
      );

      const availableJobs =
        response.data?.bookings ||
        [];

      setJobs(
        Array.isArray(
          availableJobs
        )
          ? availableJobs
          : []
      );

    } catch (error) {

      console.log(
        "Available Jobs Error:",
        error
      );

      if (!silent) {
        setJobs([]);
      }

    } finally {

      if (!silent) {
        setLoading(false);
      }

    }
  };

  // ==========================================
  // GET TODAY'S DATE
  // ==========================================

  const getTodayDate = () => {
    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // GET DATE AFTER N DAYS
  // ==========================================

  const getDateAfterDays = (
    days
  ) => {

    const date =
      new Date();

    date.setDate(
      date.getDate() + days
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // CONVERT BOOKING DATE
  // ==========================================

  const getBookingDateString = (
    bookingDate
  ) => {

    if (!bookingDate) {
      return null;
    }

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        bookingDate
      )
    ) {
      return bookingDate;
    }

    const date =
      new Date(
        bookingDate
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // CHECK ACCEPTANCE WINDOW
  // ==========================================

  const isWithinAcceptanceWindow = (
    bookingDate
  ) => {

    const dateString =
      getBookingDateString(
        bookingDate
      );

    if (!dateString) {
      return false;
    }

    const today =
      getTodayDate();

    const lastAllowedDate =
      getDateAfterDays(3);

    return (
      dateString >= today &&
      dateString <=
        lastAllowedDate
    );
  };

  // ==========================================
  // GET ACCEPTANCE AVAILABLE DATE
  // ==========================================

  const getAcceptanceAvailableDate = (
    bookingDate
  ) => {

    const dateString =
      getBookingDateString(
        bookingDate
      );

    if (!dateString) {
      return "";
    }

    const bookingDateObject =
      new Date(
        `${dateString}T00:00:00`
      );

    const availableDate =
      new Date(
        bookingDateObject
      );

    availableDate.setDate(
      availableDate.getDate() - 3
    );

    const todayObject =
      new Date();

    todayObject.setHours(
      0,
      0,
      0,
      0
    );

    if (
      availableDate <
      todayObject
    ) {

      return todayObject.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

    }

    return availableDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FORMAT SERVICE DATE
  // ==========================================

  const formatServiceDate = (
    bookingDate
  ) => {

    const dateString =
      getBookingDateString(
        bookingDate
      );

    if (!dateString) {
      return "Date not available";
    }

    const date =
      new Date(
        `${dateString}T00:00:00`
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // OPEN ACCEPTANCE POPUP
  // ==========================================

  const openAcceptancePopup = (
    job
  ) => {

    setSelectedJob(job);

    setShowAcceptancePopup(
      true
    );
  };

  // ==========================================
  // CLOSE ACCEPTANCE POPUP
  // ==========================================

  const closeAcceptancePopup = () => {

    setShowAcceptancePopup(
      false
    );

    setSelectedJob(null);
  };

  // ==========================================
  // OPEN CANCEL POPUP
  // ==========================================

  const openCancelPopup = (
    job
  ) => {

    setSelectedCancelJob(
      job
    );

    setShowCancelPopup(
      true
    );
  };

  // ==========================================
  // CLOSE CANCEL POPUP
  // ==========================================

  const closeCancelPopup = () => {

    if (
      cancellingJobId
    ) {
      return;
    }

    setShowCancelPopup(
      false
    );

    setSelectedCancelJob(
      null
    );
  };

  // ==========================================
  // CANCEL BEFORE ACCEPTING
  // ==========================================

  const handleCancelBeforeAccepting =
    async () => {

      if (
        !selectedCancelJob
      ) {
        return;
      }

      const bookingId =
        selectedCancelJob._id;

      try {

        setCancellingJobId(
          bookingId
        );

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {

          alert(
            "Please login again."
          );

          return;
        }

        console.log(
          "Declining available booking:",
          bookingId
        );

        const response =
          await api.put(
            `/bookings/${bookingId}/decline`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "Decline Job Response:",
          response.data
        );

        /*
         * Remove immediately from
         * current technician's list.
         */

        setJobs(
          (currentJobs) =>
            currentJobs.filter(
              (job) =>
                job._id !==
                bookingId
            )
        );

        /*
         * Close popup.
         */

        setShowCancelPopup(
          false
        );

        setSelectedCancelJob(
          null
        );

        /*
         * Notify other dashboard
         * components.
         */

        window.dispatchEvent(
          new CustomEvent(
            "technicianBookingChanged",
            {
              detail: {
                bookingId,
                status:
                  "Declined",
              },
            }
          )
        );

      } catch (error) {

        console.log(
          "Decline Job Error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
          "Failed to cancel this job."
        );

      } finally {

        setCancellingJobId(
          null
        );

      }
    };

  // ==========================================
  // ACCEPT JOB
  // ==========================================

  const handleAccept = async (
    bookingId
  ) => {

    if (!isOnline) {

      alert(
        "Please go Online before accepting a job."
      );

      return;
    }

    const job =
      jobs.find(
        (item) =>
          item._id ===
          bookingId
      );

    if (
      job &&
      !isWithinAcceptanceWindow(
        job.bookingDate
      )
    ) {

      openAcceptancePopup(
        job
      );

      return;
    }

    try {

      setAcceptingJobId(
        bookingId
      );

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {

        alert(
          "Please login again."
        );

        return;
      }

      console.log(
        "Accepting booking:",
        bookingId
      );

      const response =
        await api.put(
          `/bookings/${bookingId}/accept`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Accept Job Response:",
        response.data
      );

      setJobs(
        (currentJobs) =>
          currentJobs.filter(
            (job) =>
              job._id !==
              bookingId
          )
      );

      alert(
        response.data.message ||
          "Booking accepted successfully."
      );

      fetchJobs(true);

      window.dispatchEvent(
        new CustomEvent(
          "technicianBookingChanged",
          {
            detail: {
              bookingId,
              status:
                "Accepted",
            },
          }
        )
      );

    } catch (error) {

      console.log(
        "Accept Job Error:",
        error
      );

      if (
        error.response?.data
          ?.acceptanceBlocked &&
        job
      ) {

        openAcceptancePopup(
          job
        );

        return;
      }

      alert(
        error.response?.data
          ?.message ||
        "Failed to accept booking"
      );

    } finally {

      setAcceptingJobId(
        null
      );

    }
  };

  // ==========================================
  // OFFLINE UI
  // ==========================================

  if (!isOnline) {

    return (

      <section className="available-jobs-section">

        <div className="available-jobs-header">

          <div>

            <span className="available-jobs-label">
              JOB REQUESTS
            </span>

            <h2>
              Available Jobs
            </h2>

            <p>
              New service requests will
              appear when you are online.
            </p>

          </div>

        </div>


        <div className="offline-jobs-card">

          <div className="offline-jobs-icon">
            ◉
          </div>

          <h3>
            You are Offline
          </h3>

          <p>
            Go Online from your
            Availability card to receive
            and accept new service
            requests.
          </p>

        </div>

      </section>

    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <section className="available-jobs-section">


      {/* ==========================================
          ACCEPTANCE POPUP
      ========================================== */}

      {showAcceptancePopup &&
        selectedJob && (

        <div className="acceptance-popup-overlay">

          <div className="acceptance-popup">

            <div className="acceptance-popup-icon">
              !
            </div>

            <h2>
              Booking Not Ready
            </h2>

            <p className="acceptance-popup-service">

              {
                selectedJob
                  .service
                  ?.name ||
                "Home Service"
              }

            </p>

            <div className="acceptance-popup-date">

              <span>
                Service Date
              </span>

              <strong>

                {
                  formatServiceDate(
                    selectedJob
                      .bookingDate
                  )
                }

              </strong>

            </div>

            <p>
              This booking is scheduled
              more than 3 days in advance.
            </p>

            <p>
              You cannot accept it yet.
              The booking will become
              available for acceptance
              closer to the service date.
            </p>

            <div className="acceptance-popup-info">

              You can accept this booking
              from{" "}

              <strong>

                {
                  getAcceptanceAvailableDate(
                    selectedJob
                      .bookingDate
                  )
                }

              </strong>

              .

            </div>

            <button
              type="button"
              className="acceptance-popup-close"
              onClick={
                closeAcceptancePopup
              }
            >
              Got it
            </button>

          </div>

        </div>
      )}


      {/* ==========================================
          CANCEL POPUP
      ========================================== */}

      {showCancelPopup &&
        selectedCancelJob && (

        <div
          className="job-cancel-popup-overlay"
          onClick={
            closeCancelPopup
          }
        >

          <div
            className="job-cancel-popup"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="job-cancel-popup-close"
              onClick={
                closeCancelPopup
              }
              disabled={
                cancellingJobId !== null
              }
            >
              ×
            </button>


            <div className="job-cancel-popup-icon">
              !
            </div>


            <h2>
              Skip This Job?
            </h2>


            <p className="job-cancel-popup-service">

              {
                selectedCancelJob
                  .service
                  ?.name ||
                "Home Service"
              }

            </p>


            <p className="job-cancel-popup-message">

              Are you sure you don't want
              to accept this service request?

            </p>


            <p className="job-cancel-popup-note">

              This job will be removed from
              your available jobs. It will
              remain available for other
              technicians.

            </p>


            <div className="job-cancel-popup-actions">

              <button
                type="button"
                className="job-cancel-keep-btn"
                onClick={
                  closeCancelPopup
                }
                disabled={
                  cancellingJobId !== null
                }
              >
                Keep Job
              </button>


              <button
                type="button"
                className="job-cancel-confirm-btn"
                onClick={
                  handleCancelBeforeAccepting
                }
                disabled={
                  cancellingJobId !== null
                }
              >

                {cancellingJobId !== null
                  ? "Removing..."
                  : "Cancel Job"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="available-jobs-header">

        <div>

          <span className="available-jobs-label">
            JOB REQUESTS
          </span>

          <h2>
            Available Jobs
          </h2>

          <p>
            Service requests available
            for you to accept.
          </p>

        </div>


        <div className="online-indicator">

          <span className="online-indicator-dot"></span>

          Online

        </div>

      </div>


      {/* ==========================================
          AUTO REFRESH
      ========================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          marginBottom: "15px",
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        <span>
          Automatically checking for
          new jobs
        </span>
      </div>


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading ? (

        <div className="available-loading">
          Loading available jobs...
        </div>

      ) : jobs.length === 0 ? (

        <div className="no-jobs">

          <div className="no-jobs-icon">
            ✓
          </div>

          <h3>
            No Available Jobs
          </h3>

          <p>
            There are no new service
            requests available right now.
          </p>

        </div>

      ) : (

        <div className="jobs-grid">

          {jobs.map((job) => {

            const canAccept =
              isWithinAcceptanceWindow(
                job.bookingDate
              );

            return (

              <div
                className="job-card"
                key={job._id}
              >

                {/* SERVICE */}

                <div className="job-card-header">

                  <div>

                    <span className="job-service-label">
                      SERVICE REQUEST
                    </span>

                    <h3 className="job-service">

                      {
                        job.service
                          ?.name ||
                        "Home Service"
                      }

                    </h3>

                  </div>


                  <span className="new-job-badge">
                    NEW
                  </span>

                </div>


                {/* CUSTOMER */}

                <div className="job-info">

                  <span className="job-label">
                    Customer
                  </span>

                  <span>
                    {
                      job.customer
                        ?.name ||
                      "N/A"
                    }
                  </span>

                </div>


                {/* PHONE */}

                <div className="job-info">

                  <span className="job-label">
                    Phone
                  </span>

                  <span>
                    {
                      job.customer
                        ?.phone ||
                      "N/A"
                    }
                  </span>

                </div>


                {/* ADDRESS */}

                <div className="job-info">

                  <span className="job-label">
                    Address
                  </span>

                  <span>
                    {
                      job.address ||
                      "N/A"
                    }
                  </span>

                </div>


                {/* DATE */}

                <div className="job-info">

                  <span className="job-label">
                    Service Date
                  </span>

                  <span>
                    {
                      formatServiceDate(
                        job.bookingDate
                      )
                    }
                  </span>

                </div>


                {/* TIME */}

                <div className="job-info">

                  <span className="job-label">
                    Service Time
                  </span>

                  <span>
                    {
                      job.bookingTime ||
                      "N/A"
                    }
                  </span>

                </div>


                {/* PRICE */}

                <div className="job-price">

                  <span>
                    Service Amount
                  </span>

                  <strong>
                    ₹{job.price}
                  </strong>

                </div>


                {/* ACCEPTANCE STATUS */}

                {!canAccept && (

                  <div className="acceptance-status">

                    <span>
                      Acceptance available
                      within 3 days of the
                      service date.
                    </span>

                  </div>

                )}


                {/* ==========================================
                    ACTION BUTTONS
                ========================================== */}

                <div className="job-action-buttons">

                  {/* CANCEL BEFORE ACCEPTING */}

                  <button
                    type="button"
                    className="cancel-job-btn"
                    onClick={() =>
                      openCancelPopup(
                        job
                      )
                    }
                    disabled={
                      acceptingJobId ===
                        job._id ||
                      cancellingJobId ===
                        job._id
                    }
                  >

                    {cancellingJobId ===
                    job._id
                      ? "Removing..."
                      : "Cancel Job"}

                  </button>


                  {/* ACCEPT */}

                  <button
                    type="button"
                    className={`accept-btn ${
                      !canAccept
                        ? "accept-btn-disabled"
                        : ""
                    }`}
                    disabled={
                      acceptingJobId ===
                        job._id ||
                      cancellingJobId ===
                        job._id ||
                      !canAccept
                    }
                    onClick={() =>
                      handleAccept(
                        job._id
                      )
                    }
                  >

                    {acceptingJobId ===
                    job._id
                      ? "Accepting..."
                      : !canAccept
                      ? "Not Ready to Accept"
                      : "Accept Job"}

                  </button>

                </div>


                {/* WHY BUTTON */}

                {!canAccept && (

                  <button
                    type="button"
                    className="why-accept-disabled-btn"
                    onClick={() =>
                      openAcceptancePopup(
                        job
                      )
                    }
                  >
                    Why can't I accept?
                  </button>

                )}

              </div>

            );

          })}

        </div>

      )}

    </section>
  );
};

export default AvailableJobs;