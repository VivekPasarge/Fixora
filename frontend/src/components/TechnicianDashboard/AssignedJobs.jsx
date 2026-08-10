import { useEffect, useState } from "react";

import api from "../../api/axios";

import "./AssignedJobs.css";

import VerifyOTP from "./VerifyOTP";
import LocationTracker from "./LocationTracker";

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [removingJobId, setRemovingJobId] =
    useState(null);


  /* =========================================================
     FETCH ASSIGNED JOBS
  ========================================================= */

  useEffect(() => {
    fetchAssignedJobs();
  }, []);


  const fetchAssignedJobs = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(
        response.data.bookings || []
      );

    } catch (error) {
      console.log(
        "Fetch Assigned Jobs Error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     UPDATE BOOKING STATUS
  ========================================================= */

  const updateStatus = async (
    bookingId,
    status
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${bookingId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message
      );

      await fetchAssignedJobs();

    } catch (error) {
      console.log(
        "Update Status Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update booking"
      );
    }
  };


  /* =========================================================
     REMOVE COMPLETED JOB
  ========================================================= */

  const removeCompletedJob = async (
    bookingId
  ) => {

    const confirmRemove =
      window.confirm(
        "Remove this completed job from your assigned jobs?"
      );

    if (!confirmRemove) {
      return;
    }

    try {

      setRemovingJobId(
        bookingId
      );

      const token =
        localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${bookingId}/remove-completed`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message
      );

      await fetchAssignedJobs();

    } catch (error) {

      console.log(
        "Remove Completed Job Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to remove completed job"
      );

    } finally {

      setRemovingJobId(null);

    }
  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="assigned-jobs-section">

        <div className="assigned-jobs-header">

          <div>
            <h2>Assigned Jobs</h2>

            <p>
              Manage your current and completed
              service requests.
            </p>
          </div>

        </div>

        <div className="assigned-loading">
          Loading assigned jobs...
        </div>

      </section>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section className="assigned-jobs-section">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="assigned-jobs-header">

        <div>

          <span className="assigned-jobs-label">
            WORK MANAGEMENT
          </span>

          <h2>
            Assigned Jobs
          </h2>

          <p>
            Manage your active, ongoing and
            completed service requests.
          </p>

        </div>


        <div className="assigned-jobs-count">

          <strong>
            {jobs.length}
          </strong>

          <span>
            Jobs
          </span>

        </div>

      </div>


      {/* =====================================================
          NO JOBS
      ===================================================== */}

      {jobs.length === 0 ? (

        <div className="no-assigned-jobs">

          <div className="no-jobs-icon">
            ✓
          </div>

          <h3>
            No Assigned Jobs
          </h3>

          <p>
            You don't have any assigned jobs
            right now.
          </p>

        </div>

      ) : (

        <div className="jobs-grid">

          {jobs.map((job) => (

            <div
              className={`job-card ${
                job.status === "Completed"
                  ? "job-completed"
                  : ""
              }`}
              key={job._id}
            >


              {/* ==========================================
                  CARD HEADER
              ========================================== */}

              <div className="job-card-header">

                <div>

                  <span className="job-service-label">
                    SERVICE
                  </span>

                  <h3>
                    {job.service?.name ||
                      "Home Service"}
                  </h3>

                </div>


                <span
                  className={`job-status-badge status-${job.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {job.status}
                </span>

              </div>


              {/* ==========================================
                  CUSTOMER
              ========================================== */}

              <div className="job-detail">

                <span>
                  Customer
                </span>

                <strong>
                  {job.customer?.name ||
                    "N/A"}
                </strong>

              </div>


              {/* ==========================================
                  PHONE
              ========================================== */}

              <div className="job-detail">

                <span>
                  Phone
                </span>

                <strong>
                  {job.customer?.phone ||
                    "N/A"}
                </strong>

              </div>


              {/* ==========================================
                  ADDRESS
              ========================================== */}

              <div className="job-detail">

                <span>
                  Address
                </span>

                <strong>
                  {job.address ||
                    "N/A"}
                </strong>

              </div>


              {/* ==========================================
                  PRICE
              ========================================== */}

              <div className="job-price-row">

                <span>
                  Service Amount
                </span>

                <strong>
                  ₹ {job.price}
                </strong>

              </div>


              {/* ==========================================
                  ACCEPTED
                  START JOURNEY
              ========================================== */}

              {job.status ===
                "Accepted" && (

                <button
                  type="button"
                  className="start-btn"
                  onClick={() =>
                    updateStatus(
                      job._id,
                      "On The Way"
                    )
                  }
                >
                  Start Journey
                </button>

              )}


              {/* ==========================================
                  ON THE WAY
                  LIVE LOCATION
              ========================================== */}

              {job.status ===
                "On The Way" && (

                <div className="job-action-area">

                  <LocationTracker
                    bookingId={
                      job._id
                    }
                  />

                  <div className="tracking-active-message">

                    <span className="tracking-dot"></span>

                    Live location sharing is active.

                  </div>


                  {/* ====================================
                      OTP
                  ==================================== */}

                  {!job.otpVerified && (

                    <VerifyOTP
                      booking={job}
                      refreshBookings={
                        fetchAssignedJobs
                      }
                    />

                  )}

                </div>

              )}


              {/* ==========================================
                  IN PROGRESS
              ========================================== */}

              {job.status ===
                "In Progress" && (

                <div className="job-action-area">

                  <div className="service-active-message">

                    <span>
                      ●
                    </span>

                    Service is currently
                    in progress.

                  </div>


                  <button
                    type="button"
                    className="complete-btn"
                    onClick={() =>
                      updateStatus(
                        job._id,
                        "Completed"
                      )
                    }
                  >
                    Complete Job
                  </button>

                </div>

              )}


              {/* ==========================================
                  COMPLETED
              ========================================== */}

              {job.status ===
                "Completed" && (

                <div className="completed-job-area">

                  <div className="completed-message">

                    <span>
                      ✓
                    </span>

                    <div>

                      <strong>
                        Job Completed
                      </strong>

                      <small>
                        This service has been
                        successfully completed.
                      </small>

                    </div>

                  </div>


                  {/* ====================================
                      REMOVE BUTTON
                  ==================================== */}

                  <button
                    type="button"
                    className="remove-job-btn"
                    disabled={
                      removingJobId ===
                      job._id
                    }
                    onClick={() =>
                      removeCompletedJob(
                        job._id
                      )
                    }
                  >

                    {removingJobId ===
                    job._id
                      ? "Removing..."
                      : "Remove Job"}

                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </section>
  );
};

export default AssignedJobs;