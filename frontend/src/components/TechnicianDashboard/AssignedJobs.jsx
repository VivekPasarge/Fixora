import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AssignedJobs.css";
import VerifyOTP from "./VerifyOTP";
import LocationTracker from "./LocationTracker";

const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedJobs();
  }, []);

  const fetchAssignedJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/bookings/technician/assigned", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.bookings);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  const updateStatus = async (bookingId, status) => {
    try {

      const token = localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      fetchAssignedJobs();

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to update booking"
      );

    }
  };

  return (
    <div className="assigned-jobs">

      <h2>Assigned Jobs</h2>

      {loading ? (

        <p>Loading...</p>

      ) : jobs.length === 0 ? (

        <p>No Assigned Jobs</p>

      ) : (

        <div className="jobs-grid">

          {jobs.map((job) => (

            <div
              className="job-card"
              key={job._id}
            >

              <h3>{job.service.name}</h3>

              <p>
                <strong>Customer:</strong>{" "}
                {job.customer.name}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {job.customer.phone}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {job.address}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {job.status}
              </p>

              <h4>₹ {job.price}</h4>

              {/* OTP Verification */}

              {job.status === "Accepted" &&
                !job.otpVerified && (

                <VerifyOTP
                  booking={job}
                  refreshBookings={fetchAssignedJobs}
                />

              )}

              {/* Start Job */}

              {job.status === "Accepted" &&
                job.otpVerified && (

                <button
                  className="start-btn"
                  onClick={() =>
                    updateStatus(
                      job._id,
                      "In Progress"
                    )
                  }
                >
                  Start Job
                </button>

              )}

              {/* Complete Job */}

              {job.status === "In Progress" && (

  <>

    <LocationTracker
      bookingId={job._id}
    />

    <button
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

  </>

)}

              {/* Completed */}

              {job.status === "Completed" && (

                <button
                  className="completed-btn"
                  disabled
                >
                  Completed
                </button>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default AssignedJobs;