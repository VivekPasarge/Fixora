import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AssignedJobs.css";
import VerifyOTP from "./VerifyOTP";
import LocationTracker from "./LocationTracker";

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState(null);
  const [cashProcessingId, setCashProcessingId] = useState(null);

  // =====================================================
  // FETCH ASSIGNED JOBS
  // =====================================================

  const fetchAssignedJobs = async (silent = false) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setJobs([]);
        return;
      }

      const response = await api.get(
        "/bookings/technician/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(response.data.bookings || []);
    } catch (error) {
      console.error("Fetch Assigned Jobs Error:", error);

      if (!silent) {
        alert(
          error.response?.data?.message ||
            "Failed to load assigned jobs."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAssignedJobs();

    const interval = setInterval(() => {
      fetchAssignedJobs(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // UPDATE BOOKING STATUS
  // =====================================================

  const updateStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await api.put(
        `/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          `Booking updated to ${status}.`
      );

      await fetchAssignedJobs();
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update booking."
      );
    }
  };

  // =====================================================
  // CONFIRM CASH RECEIVED FOR COD
  // =====================================================

  const markCashReceived = async (job) => {
    if (
      job.paymentMethod !== "Cash on Service" ||
      job.paymentStatus === "Paid" ||
      job.status !== "Completed"
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Confirm that you have received ₹${Number(
        job.price || 0
      ).toLocaleString("en-IN")} in cash from the customer?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCashProcessingId(job._id);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await api.put(
        `/bookings/${job._id}/cash-received`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Cash collection recorded successfully."
      );

      await fetchAssignedJobs();
    } catch (error) {
      console.error("Cash Collection Error:", error);

      alert(
        error.response?.data?.message ||
          "Could not record cash collection. Please refresh and try again."
      );

      await fetchAssignedJobs(true);
    } finally {
      setCashProcessingId(null);
    }
  };

  // =====================================================
  // REMOVE COMPLETED JOB
  // =====================================================

  const removeCompletedJob = async (bookingId) => {
    const confirmed = window.confirm(
      "Remove this completed job from your assigned jobs?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingJobId(bookingId);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

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
        response.data.message ||
          "Completed job removed successfully."
      );

      await fetchAssignedJobs();
    } catch (error) {
      console.error("Remove Completed Job Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to remove completed job."
      );
    } finally {
      setRemovingJobId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="assigned-jobs-section">
        <div className="assigned-jobs-header">
          <div>
            <h2>Assigned Jobs</h2>
            <p>
              Manage your current and completed service requests.
            </p>
          </div>
        </div>

        <div className="assigned-loading">
          Loading assigned jobs...
        </div>
      </section>
    );
  }

  // =====================================================
  // ASSIGNED JOBS
  // =====================================================

  return (
    <section className="assigned-jobs-section">
      <div className="assigned-jobs-header">
        <div>
          <span className="assigned-jobs-label">
            WORK MANAGEMENT
          </span>

          <h2>Assigned Jobs</h2>

          <p>
            Manage your active, ongoing and completed service requests.
          </p>
        </div>

        <div className="assigned-jobs-count">
          <strong>{jobs.length}</strong>
          <span>Jobs</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="no-assigned-jobs">
          <div className="no-jobs-icon">✓</div>

          <h3>No Assigned Jobs</h3>

          <p>
            You don't have any assigned jobs right now.
          </p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => {
            const isCod =
              job.paymentMethod === "Cash on Service";

            const isPaid =
              job.paymentStatus === "Paid";

            const isCompleted =
              job.status === "Completed";

            const isCashProcessing =
              cashProcessingId === job._id;

            return (
              <div
                className={`job-card ${
                  isCompleted ? "job-completed" : ""
                }`}
                key={job._id}
              >
                {/* BOOKING HEADER */}

                <div className="job-card-header">
                  <div>
                    <span className="job-service-label">
                      SERVICE
                    </span>

                    <h3>
                      {job.service?.name || "Home Service"}
                    </h3>
                  </div>

                  <span
                    className={`job-status-badge status-${(
                      job.status || ""
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* CUSTOMER */}

                <div className="job-detail">
                  <span>Customer</span>

                  <strong>
                    {job.customer?.name || "N/A"}
                  </strong>
                </div>

                {/* PHONE */}

                <div className="job-detail">
                  <span>Phone</span>

                  <strong>
                    {job.customer?.phone || "N/A"}
                  </strong>
                </div>

                {/* ADDRESS */}

                <div className="job-detail">
                  <span>Address</span>

                  <strong>
                    {job.address || "N/A"}
                  </strong>
                </div>

                {/* SERVICE AMOUNT */}

                <div className="job-price-row">
                  <span>Service Amount</span>

                  <strong>
                    ₹{Number(job.price || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                {/* PAYMENT DETAILS */}

                <div className="job-detail">
                  <span>Payment Method</span>
                  <strong>
                    {job.paymentMethod || "Cash on Service"}
                  </strong>
                </div>

                <div className="job-detail">
                  <span>Payment Status</span>

                  <strong
                    className={
                      isPaid
                        ? "job-payment-paid"
                        : "job-payment-pending"
                    }
                  >
                    {job.paymentStatus || "Pending"}
                  </strong>
                </div>

                {/* ACCEPTED: START JOURNEY */}

                {job.status === "Accepted" && (
                  <button
                    type="button"
                    className="start-btn"
                    onClick={() =>
                      updateStatus(job._id, "On The Way")
                    }
                  >
                    Start Journey
                  </button>
                )}

                {/* ON THE WAY: LOCATION AND OTP */}

                {job.status === "On The Way" && (
                  <div className="job-action-area">
                    <LocationTracker bookingId={job._id} />

                    <div className="tracking-active-message">
                      <span className="tracking-dot" />
                      Live location sharing is active.
                    </div>

                    {!job.otpVerified && (
                      <VerifyOTP
                        booking={job}
                        refreshBookings={fetchAssignedJobs}
                      />
                    )}

                    {job.otpVerified && (
                      <p>
                        Customer OTP verified. You can start the service
                        when you arrive.
                      </p>
                    )}
                  </div>
                )}

                {/* IN PROGRESS */}

                {job.status === "In Progress" && (
                  <div className="job-action-area">
                    <div className="service-active-message">
                      <span>●</span>
                      Service is currently in progress.
                    </div>

                    <button
                      type="button"
                      className="complete-btn"
                      onClick={() =>
                        updateStatus(job._id, "Completed")
                      }
                    >
                      Complete Job
                    </button>
                  </div>
                )}

                {/* COMPLETED */}

                {isCompleted && (
                  <div className="completed-job-area">
                    <div className="completed-message">
                      <span>✓</span>

                      <div>
                        <strong>Job Completed</strong>

                        <small>
                          This service has been successfully completed.
                        </small>
                      </div>
                    </div>

                    {/* COD COLLECTION */}

                    {isCod && !isPaid && (
                      <div className="cash-collection-panel">
                        <strong>Cash collection pending</strong>

                        <p>
                          Confirm this only after receiving the cash
                          from the customer.
                        </p>

                        <button
                          type="button"
                          className="cash-received-btn"
                          disabled={isCashProcessing}
                          onClick={() => markCashReceived(job)}
                        >
                          {isCashProcessing
                            ? "Recording Payment..."
                            : "Mark Cash Received"}
                        </button>
                      </div>
                    )}

                    {/* PAID STATUS */}

                    {isPaid && (
                      <div className="payment-confirmed-message">
                        <span>✓</span>

                        <div>
                          <strong>Payment Paid</strong>

                          <small>
                            Payment has been recorded successfully.
                          </small>
                        </div>
                      </div>
                    )}

                    {/* ONLINE PAYMENT STILL PENDING */}

                    {!isCod && !isPaid && (
                      <div className="cash-collection-panel">
                        <strong>Online payment pending</strong>

                        <p>
                          The payment must be verified by the server.
                          Do not record an online payment as cash.
                        </p>
                      </div>
                    )}

                    {/* REMOVE JOB */}

                    <button
                      type="button"
                      className="remove-job-btn"
                      disabled={removingJobId === job._id}
                      onClick={() => removeCompletedJob(job._id)}
                    >
                      {removingJobId === job._id
                        ? "Removing..."
                        : "Remove Job"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AssignedJobs;