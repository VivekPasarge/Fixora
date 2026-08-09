import { useEffect, useState } from "react";
import api from "../api/axios";
import "./TechnicianManagement.css";

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedTechnician, setSelectedTechnician] =
    useState(null);

  const [technicianLoading, setTechnicianLoading] =
    useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] =
    useState(false);

  // ==========================================
  // Fetch Technicians
  // ==========================================

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/admin/technicians",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Technicians:",
        response.data
      );

      setTechnicians(
        response.data.technicians || []
      );

    } catch (error) {
      console.log(
        "Fetch Technicians Error:",
        error
      );

      console.log(
        "Backend Response:",
        error.response?.data
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchTechnicians();
  }, []);

  // ==========================================
  // View Technician
  // ==========================================

  const viewTechnician = async (id) => {
    try {
      setTechnicianLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/admin/technicians/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Technician Details:",
        response.data
      );

      setSelectedTechnician(
        response.data.technician
      );

      setBookings([]);

      await fetchTechnicianBookings(id);

    } catch (error) {
      console.log(
        "Technician Details Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load technician details"
      );

    } finally {
      setTechnicianLoading(false);
    }
  };

  // ==========================================
  // Fetch Technician Bookings
  // ==========================================

  const fetchTechnicianBookings = async (id) => {
    try {
      setBookingLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/admin/technicians/${id}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Technician Bookings:",
        response.data
      );

      setBookings(
        response.data.bookings || []
      );

    } catch (error) {
      console.log(
        "Technician Bookings Error:",
        error
      );

      setBookings([]);

    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // Delete Technician
  // ==========================================

  const deleteTechnician = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this technician?"
      );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("token");

      await api.delete(
        `/admin/technicians/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Technician deleted successfully"
      );

      setSelectedTechnician(null);
      setBookings([]);

      await fetchTechnicians();

    } catch (error) {
      console.log(
        "Delete Technician Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete technician"
      );
    }
  };

  // ==========================================
  // Search
  // ==========================================

  const filteredTechnicians =
    technicians.filter((technician) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        technician.name
          ?.toLowerCase()
          .includes(searchText) ||

        technician.email
          ?.toLowerCase()
          .includes(searchText) ||

        technician.phone
          ?.toLowerCase()
          .includes(searchText) ||

        technician.profession
          ?.toLowerCase()
          .includes(searchText) ||

        technician.workingCity
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="technician-loading">
        <h2>
          Loading Technicians...
        </h2>
      </div>
    );
  }

  // ==========================================
  // Page
  // ==========================================

  return (
    <div className="technician-management">

      {/* ==================================
          Header
      ================================== */}

      <div className="technician-header">

        <h1>
          Technician Management
        </h1>

        <p>
          View and manage all Fixora
          service professionals.
        </p>

      </div>


      {/* ==================================
          Summary
      ================================== */}

      <div className="technician-summary">

        <div>

          <p className="technician-summary-label">
            Total Technicians
          </p>

          <h2 className="technician-summary-count">
            {technicians.length}
          </h2>

        </div>

      </div>


      {/* ==================================
          Search
      ================================== */}

      <div className="technician-search-card">

        <div className="technician-search-wrapper">

          <span className="technician-search-icon">
            🔍
          </span>

          <input
            className="technician-search-input"
            type="text"
            placeholder="Search by name, email, phone, profession or city..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* ==================================
          Technician Details
      ================================== */}

      {selectedTechnician && (

        <div className="technician-details">

          <div className="technician-details-header">

            <div>

              <h2>
                Technician Details
              </h2>

              <p>
                Complete professional
                information
              </p>

            </div>

            <button
              className="technician-close-btn"
              onClick={() => {
                setSelectedTechnician(null);
                setBookings([]);
              }}
            >
              Close
            </button>

          </div>


          {/* Technician Information */}

          <div className="technician-details-grid">

            <div className="technician-detail-item">
              <label>Name</label>

              <p>
                {selectedTechnician.name ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Email</label>

              <p>
                {selectedTechnician.email ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Phone</label>

              <p>
                {selectedTechnician.phone ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Profession</label>

              <p>
                {selectedTechnician.profession ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Experience</label>

              <p>
                {selectedTechnician.experience ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Working City</label>

              <p>
                {selectedTechnician.workingCity ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Service Area</label>

              <p>
                {selectedTechnician.serviceArea ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Availability</label>

              <p>
                {selectedTechnician.availability ||
                  "Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Languages</label>

              <p>
                {selectedTechnician.languages ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Skills</label>

              <p>
                {selectedTechnician.skills ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Gender</label>

              <p>
                {selectedTechnician.gender ||
                  "Not Available"}
              </p>
            </div>


            <div className="technician-detail-item">
              <label>Joined</label>

              <p>
                {selectedTechnician.createdAt
                  ? new Date(
                      selectedTechnician.createdAt
                    ).toLocaleDateString()
                  : "Not Available"}
              </p>
            </div>

          </div>


          {/* ==================================
              Booking History
          ================================== */}

          <div className="technician-bookings">

            <div className="technician-bookings-header">

              <div>

                <h3>
                  Booking History
                </h3>

                <p>
                  Services handled by this
                  technician
                </p>

              </div>

              <span className="technician-booking-count">
                {bookings.length} Bookings
              </span>

            </div>


            {bookingLoading ? (

              <div className="technician-booking-loading">
                Loading booking history...
              </div>

            ) : bookings.length === 0 ? (

              <div className="technician-booking-empty">
                <p>
                  This technician has no
                  booking history.
                </p>
              </div>

            ) : (

              <div className="technician-booking-table-wrapper">

                <table className="technician-booking-table">

                  <thead>

                    <tr>

                      <th>
                        Booking ID
                      </th>

                      <th>
                        Service
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Date
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {bookings.map(
                      (booking) => (

                        <tr
                          key={
                            booking._id
                          }
                        >

                          <td>
                            {booking.bookingId ||
                              booking._id}
                          </td>

                          <td>
                            {booking.service
                              ?.name ||
                              booking.serviceName ||
                              "N/A"}
                          </td>

                          <td>
                            {booking.customer
                              ?.name ||
                              "Not Available"}
                          </td>

                          <td>

                            <span
                              className={`technician-booking-status ${
                                booking.status
                                  ?.toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )
                              }`}
                            >
                              {booking.status ||
                                "Unknown"}
                            </span>

                          </td>

                          <td>
                            {booking.createdAt
                              ? new Date(
                                  booking.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ==================================
              Delete
          ================================== */}

          <div className="technician-danger-zone">

            <div>

              <h3>
                Technician Account
              </h3>

              <p>
                Permanently remove this
                technician account.
              </p>

            </div>

            <button
              className="technician-delete-btn"
              onClick={() =>
                deleteTechnician(
                  selectedTechnician._id
                )
              }
            >
              Delete Technician
            </button>

          </div>

        </div>

      )}


      {/* ==================================
          Technician Table
      ================================== */}

      {technicians.length === 0 ? (

        <div className="technician-empty">

          <h3>
            No Technicians Found
          </h3>

          <p>
            There are currently no
            registered technicians.
          </p>

        </div>

      ) : filteredTechnicians.length === 0 ? (

        <div className="technician-empty">

          <h3>
            No Matching Technicians
          </h3>

          <p>
            Try a different search.
          </p>

        </div>

      ) : (

        <div className="technician-table-card">

          <div className="technician-table-wrapper">

            <table className="technician-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Profession
                  </th>

                  <th>
                    City
                  </th>

                  <th>
                    Availability
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredTechnicians.map(
                  (technician) => (

                    <tr
                      key={
                        technician._id
                      }
                    >

                      <td>

                        <span className="technician-name">
                          {technician.name ||
                            "Not Available"}
                        </span>

                      </td>


                      <td>
                        {technician.email ||
                          "Not Available"}
                      </td>


                      <td>
                        {technician.profession ||
                          "Not Available"}
                      </td>


                      <td>
                        {technician.workingCity ||
                          "Not Available"}
                      </td>


                      <td>

                        <span
                          className={`technician-availability ${
                            technician.availability
                              ?.toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              ) ||
                            "available"
                          }`}
                        >
                          {technician.availability ||
                            "Available"}
                        </span>

                      </td>


                      <td>
                        {technician.createdAt
                          ? new Date(
                              technician.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>


                      <td>

                        <div className="technician-actions">

                          <button
                            className="technician-view-btn"
                            onClick={() =>
                              viewTechnician(
                                technician._id
                              )
                            }
                            disabled={
                              technicianLoading
                            }
                          >
                            {technicianLoading
                              ? "Loading..."
                              : "View"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
};

export default TechnicianManagement;