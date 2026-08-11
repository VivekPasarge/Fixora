import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AvailableJobs.css";

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(true);

  const [acceptingJobId, setAcceptingJobId] =
    useState(null);

  /* =========================================================
     LOAD TECHNICIAN AVAILABILITY
  ========================================================= */

  useEffect(() => {
    const savedStatus =
      localStorage.getItem("technicianOnline");

    if (savedStatus !== null) {
      setIsOnline(
        savedStatus === "true"
      );
    }
  }, []);

  /* =========================================================
     LISTEN FOR AVAILABILITY CHANGES
  ========================================================= */

  useEffect(() => {
    const handleAvailabilityChange = (
      event
    ) => {
      const online =
        event.detail?.isOnline;

      setIsOnline(online);

      /*
        If technician goes offline,
        immediately clear the jobs.
      */

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

  /* =========================================================
     FETCH AVAILABLE JOBS
  ========================================================= */

  useEffect(() => {
    if (!isOnline) {
      setJobs([]);
      setLoading(false);

      return;
    }

    /*
      Fetch immediately when technician
      becomes online.
    */

    fetchJobs();

    /*
      Automatically check for new jobs
      every 5 seconds.

      This removes the need to refresh
      the technician page manually.
    */

    const interval = setInterval(() => {
      fetchJobs(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline]);

  /* =========================================================
     FETCH JOBS
  ========================================================= */

  const fetchJobs = async (
    silent = false
  ) => {
    try {
      /*
        Don't show the loading screen
        during automatic background refresh.
      */

      if (!silent) {
        setLoading(true);
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        console.log(
          "❌ No technician token found"
        );

        setJobs([]);

        return;
      }

      const response = await api.get(
        "/bookings/available",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "📦 Available Jobs:",
        response.data
      );

      const availableJobs =
        response.data?.bookings || [];

      /*
        Update jobs.

        If a booking has already been
        accepted elsewhere, the backend
        should no longer return it.
      */

      setJobs(
        Array.isArray(availableJobs)
          ? availableJobs
          : []
      );
    } catch (error) {
      console.log(
        "Available Jobs Error:",
        error
      );

      /*
        During an automatic refresh,
        don't unnecessarily destroy
        the existing job list because
        of a temporary network error.
      */

      if (!silent) {
        setJobs([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /* =========================================================
     ACCEPT JOB
  ========================================================= */

  const handleAccept = async (
    bookingId
  ) => {
    /*
      Technician must be online.
    */

    if (!isOnline) {
      alert(
        "Please go Online before accepting a job."
      );

      return;
    }

    try {
      setAcceptingJobId(
        bookingId
      );

      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Please login again."
        );

        return;
      }

      console.log(
        "🚀 Accepting booking:",
        bookingId
      );

      const response = await api.put(
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
        "✅ Accept Job Response:",
        response.data
      );

      /*
        Remove the accepted job
        immediately from the UI.

        No page refresh required.
      */

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) =>
            job._id !== bookingId
        )
      );

      alert(
        response.data.message ||
          "Booking accepted successfully."
      );

      /*
        Fetch again in the background
        to make sure the UI matches
        the server.
      */

      fetchJobs(true);

      /*
        Notify other technician
        dashboard components that
        the technician has a new
        active job.

        This allows components such
        as ActiveJob to refresh their
        data without a page reload.
      */

      window.dispatchEvent(
        new CustomEvent(
          "technicianBookingChanged",
          {
            detail: {
              bookingId,
              status: "Accepted",
            },
          }
        )
      );
    } catch (error) {
      console.log(
        "Accept Job Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to accept booking"
      );
    } finally {
      setAcceptingJobId(
        null
      );
    }
  };

  /* =========================================================
     OFFLINE UI
  ========================================================= */

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
              New service requests will appear
              when you are online.
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
            Go Online from your Availability
            card to receive and accept new
            service requests.
          </p>

        </div>

      </section>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section className="available-jobs-section">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="available-jobs-header">

        <div>

          <span className="available-jobs-label">
            JOB REQUESTS
          </span>

          <h2>
            Available Jobs
          </h2>

          <p>
            Service requests available for
            you to accept.
          </p>

        </div>

        <div className="online-indicator">

          <span className="online-indicator-dot"></span>

          Online

        </div>

      </div>


      {/* =====================================================
          AUTO REFRESH INDICATOR
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "15px",
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        <span>
          Automatically checking for new jobs
        </span>
      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="available-loading">
          Loading available jobs...
        </div>

      ) : jobs.length === 0 ? (

        /* ===================================================
           NO JOBS
        =================================================== */

        <div className="no-jobs">

          <div className="no-jobs-icon">
            ✓
          </div>

          <h3>
            No Available Jobs
          </h3>

          <p>
            There are no new service requests
            available right now.
          </p>

        </div>

      ) : (

        /* ===================================================
           JOBS
        =================================================== */

        <div className="jobs-grid">

          {jobs.map((job) => (

            <div
              className="job-card"
              key={job._id}
            >

              {/* ==========================================
                  SERVICE
              ========================================== */}

              <div className="job-card-header">

                <div>

                  <span className="job-service-label">
                    SERVICE REQUEST
                  </span>

                  <h3 className="job-service">

                    {job.service?.name ||
                      "Home Service"}

                  </h3>

                </div>

                <span className="new-job-badge">
                  NEW
                </span>

              </div>


              {/* ==========================================
                  CUSTOMER
              ========================================== */}

              <div className="job-info">

                <span className="job-label">
                  Customer
                </span>

                <span>
                  {job.customer?.name ||
                    "N/A"}
                </span>

              </div>


              {/* ==========================================
                  PHONE
              ========================================== */}

              <div className="job-info">

                <span className="job-label">
                  Phone
                </span>

                <span>
                  {job.customer?.phone ||
                    "N/A"}
                </span>

              </div>


              {/* ==========================================
                  ADDRESS
              ========================================== */}

              <div className="job-info">

                <span className="job-label">
                  Address
                </span>

                <span>
                  {job.address ||
                    "N/A"}
                </span>

              </div>


              {/* ==========================================
                  PRICE
              ========================================== */}

              <div className="job-price">

                <span>
                  Service Amount
                </span>

                <strong>
                  ₹{job.price}
                </strong>

              </div>


              {/* ==========================================
                  ACCEPT
              ========================================== */}

              <button
                type="button"
                className="accept-btn"
                disabled={
                  acceptingJobId ===
                  job._id
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
                  : "Accept Job"}

              </button>

            </div>

          ))}

        </div>

      )}

    </section>
  );
};

export default AvailableJobs;