import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AvailableJobs.css";
const AvailableJobs = () => {

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchJobs();

  }, []);

  const fetchJobs = async () => {

    try {

     
      
      //this is just an example
      const token = localStorage.getItem("token");

const response = await api.get("/bookings/available", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log("Available Jobs:", response.data);

      setJobs(response.data.bookings);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };
  const handleAccept = async (bookingId) => {

  try {

    const token = localStorage.getItem("token");

    const response = await api.put(
      `/bookings/${bookingId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(response.data.message);

    fetchJobs();

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Failed to accept booking"
    );

  }

};

  return (

  <div className="available-jobs">

    <h2>Available Jobs</h2>

    {loading ? (

      <p className="loading">
        Loading...
      </p>

    ) : jobs.length === 0 ? (

      <div className="no-jobs">
        No available jobs.
      </div>

    ) : (

      <div className="jobs-grid">

        {jobs.map((job) => (

          <div
            className="job-card"
            key={job._id}
          >

            <h3 className="job-service">
              {job.service.name}
            </h3>

            <div className="job-info">

              <span className="job-label">
                Customer
              </span>

              <span>
                {job.customer.name}
              </span>

            </div>

            <div className="job-info">

              <span className="job-label">
                Phone
              </span>

              <span>
                {job.customer.phone}
              </span>

            </div>

            <div className="job-info">

              <span className="job-label">
                Address
              </span>

              <span>
                {job.address}
              </span>

            </div>

            <div className="job-price">
              ₹{job.price}
            </div>
<button
  className="accept-btn"
  onClick={() => handleAccept(job._id)}
>
  Accept Job
</button>
          </div>

        ))}

      </div>

    )}

  </div>

);

};

export default AvailableJobs;