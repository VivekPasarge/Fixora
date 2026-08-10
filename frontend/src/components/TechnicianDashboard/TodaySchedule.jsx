import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiClock,
  FiMapPin,
  FiChevronRight,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

import "./TodaySchedule.css";


const TodaySchedule = () => {

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================================
     CONVERT TIME TO MINUTES
  ========================================================= */

  const convertTimeToMinutes = (time) => {

    if (!time) {
      return 0;
    }

    const value = time
      .toString()
      .trim()
      .toUpperCase();

    /*
      Supports:

      09:00 AM
      11:30 AM
      03:00 PM

      Also:

      09:00
      15:00
    */

    const match = value.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/
    );

    if (!match) {
      return 0;
    }

    let hours = Number(match[1]);

    const minutes = Number(match[2]);

    const period = match[3];


    if (period === "AM") {

      if (hours === 12) {
        hours = 0;
      }

    } else if (period === "PM") {

      if (hours !== 12) {
        hours += 12;
      }

    }


    return (
      hours * 60 +
      minutes
    );
  };


  /* =========================================================
     FETCH ASSIGNED JOBS
  ========================================================= */

  const fetchTodayJobs = async () => {

    try {

      setLoading(true);

      setError("");


      const token =
        localStorage.getItem("token");


      if (!token) {

        setError(
          "Please login again."
        );

        return;
      }


      const response =
        await api.get(
          "/bookings/technician/assigned",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      console.log(
        "Technician Assigned Jobs:",
        response.data
      );


      const allBookings =
        response.data.bookings || [];


      /* =====================================================
         TODAY'S DATE
      ===================================================== */

      const today = new Date();


      const todayDate =
        today.getFullYear() +
        "-" +
        String(
          today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
          today.getDate()
        ).padStart(2, "0");


      /* =====================================================
         FILTER TODAY'S BOOKINGS
      ===================================================== */

      const todayJobs =
        allBookings.filter(
          (booking) => {

            if (!booking.bookingDate) {
              return false;
            }


            const bookingDate =
              new Date(
                booking.bookingDate
              );


            if (
              isNaN(
                bookingDate.getTime()
              )
            ) {
              return false;
            }


            const bookingDateString =
              bookingDate.getFullYear() +
              "-" +
              String(
                bookingDate.getMonth() + 1
              ).padStart(2, "0") +
              "-" +
              String(
                bookingDate.getDate()
              ).padStart(2, "0");


            return (
              bookingDateString ===
              todayDate
            );

          }
        );


      /* =====================================================
         SORT BY TIME
      ===================================================== */

      todayJobs.sort(
        (a, b) => {

          const timeA =
            convertTimeToMinutes(
              a.bookingTime
            );


          const timeB =
            convertTimeToMinutes(
              b.bookingTime
            );


          return timeA - timeB;

        }
      );


      setJobs(todayJobs);

    } catch (error) {

      console.log(
        "Today's Schedule Error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Failed to load today's schedule"
      );


      setJobs([]);

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {

    fetchTodayJobs();

  }, []);


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "Today";
    }


    const bookingDate =
      new Date(date);


    if (
      isNaN(
        bookingDate.getTime()
      )
    ) {
      return "Today";
    }


    return bookingDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =========================================================
     DETAILS BUTTON
  ========================================================= */

  const handleDetails = (bookingId) => {

    if (!bookingId) {

      alert(
        "Booking information is unavailable."
      );

      return;
    }


    navigate(
      `/booking-details/${bookingId}`
    );

  };


  /* =========================================================
     VIEW ALL ASSIGNED JOBS
  ========================================================= */

  const handleViewAllJobs = () => {

    const assignedJobsSection =
      document.getElementById(
        "assigned-jobs"
      );


    if (assignedJobsSection) {

      assignedJobsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };


  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {

    if (!status) {
      return "upcoming";
    }


    return status
      .toLowerCase()
      .replace(/\s+/g, "-");

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.4,
        }}

        className="schedule-card"
      >

        <div className="schedule-header">

          <div>

            <h2 className="schedule-title">
              Today's Schedule
            </h2>

            <p className="schedule-subtitle">
              Loading your assigned jobs...
            </p>

          </div>


          <div className="schedule-count">
            ...
          </div>

        </div>


        <div className="schedule-loading">
          Loading schedule...
        </div>

      </motion.div>

    );

  }


  /* =========================================================
     MAIN UI
  ========================================================= */

  return (

    <motion.div

      initial={{
        opacity: 0,
        x: -30,
      }}

      animate={{
        opacity: 1,
        x: 0,
      }}

      transition={{
        duration: 0.4,
      }}

      className="schedule-card"
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="schedule-header">

        <div>

          <div className="schedule-title-row">

            <h2 className="schedule-title">
              Today's Schedule
            </h2>

            <FiCalendar
              className="schedule-title-icon"
            />

          </div>


          <p className="schedule-subtitle">
            Your assigned jobs for today.
          </p>

        </div>


        <div className="schedule-count">
          {jobs.length}
        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="schedule-error">

          <FiAlertCircle />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!error &&
        jobs.length === 0 && (

          <div className="schedule-empty">

            <div className="schedule-empty-icon">

              <FiCalendar />

            </div>


            <h3>
              No jobs scheduled for today
            </h3>


            <p>
              You don't have any assigned
              service requests for today.
            </p>


            <button
              type="button"
              className="schedule-view-all"
              onClick={handleViewAllJobs}
            >

              <span>
                View Assigned Jobs
              </span>

              <FiChevronRight />

            </button>

          </div>

        )}


      {/* =====================================================
          JOB LIST
      ===================================================== */}

      {!error &&
        jobs.length > 0 && (

          <div className="schedule-list">

            {jobs.map((job) => (

              <div
                key={job._id}
                className="schedule-item"
              >


                {/* ==========================================
                    JOB CONTENT
                ========================================== */}

                <div className="schedule-item-header">


                  {/* ========================================
                      LEFT
                  ======================================== */}

                  <div className="schedule-job-info">

                    <h3 className="schedule-service">

                      {job.service?.name ||
                        "Home Service"}

                    </h3>


                    <p className="schedule-customer">

                      {job.customer?.name ||
                        "Customer"}

                    </p>


                    {/* TIME */}

                    <div className="schedule-info">

                      <FiClock />

                      <span>

                        {job.bookingTime ||
                          "Time not available"}

                      </span>

                    </div>


                    {/* LOCATION */}

                    <div className="schedule-info">

                      <FiMapPin />

                      <span>

                        {job.address ||
                          "Address not available"}

                      </span>

                    </div>

                  </div>


                  {/* ========================================
                      RIGHT
                  ======================================== */}

                  <div className="schedule-right">


                    {/* STATUS */}

                    <span
                      className={`schedule-status ${getStatusClass(
                        job.status
                      )}`}
                    >

                      {job.status ||
                        "Upcoming"}

                    </span>


                    {/* DETAILS */}

                    <button
                      type="button"
                      className="details-btn"

                      onClick={() =>
                        handleDetails(
                          job._id
                        )
                      }
                    >

                      <span>
                        Details
                      </span>

                      <FiChevronRight />

                    </button>

                  </div>

                </div>


                {/* ==========================================
                    DATE
                ========================================== */}

                <div className="schedule-date">

                  <FiCalendar />

                  <span>

                    {formatDate(
                      job.bookingDate
                    )}

                  </span>

                </div>


              </div>

            ))}

          </div>

        )}


      {/* =====================================================
          VIEW ALL
      ===================================================== */}

      {jobs.length > 0 && (

        <button
          type="button"
          className="schedule-view-all"

          onClick={
            handleViewAllJobs
          }
        >

          <span>
            View All Assigned Jobs
          </span>

          <FiChevronRight />

        </button>

      )}

    </motion.div>

  );

};


export default TodaySchedule;