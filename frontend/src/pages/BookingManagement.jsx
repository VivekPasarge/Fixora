import { useEffect, useState } from "react";
import api from "../api/axios";
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  // ==========================================
  // Fetch All Bookings
  // ==========================================

  const fetchBookings = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/admin/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Bookings:",
        response.data
      );

      setBookings(
        response.data.bookings || []
      );

    } catch (error) {
      console.log(
        "Fetch Bookings Error:",
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
    fetchBookings();
  }, []);

  // ==========================================
  // View Booking
  // ==========================================

  const viewBooking = async (id) => {
    try {
      setBookingLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/admin/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Booking Details:",
        response.data
      );

      setSelectedBooking(
        response.data.booking
      );

    } catch (error) {
      console.log(
        "Booking Details Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load booking details"
      );

    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // Update Booking Status
  // ==========================================

  const updateBookingStatus = async (
    id,
    status
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      await api.put(
        `/admin/bookings/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Booking status updated successfully"
      );

      setSelectedBooking(null);

      await fetchBookings();

    } catch (error) {
      console.log(
        "Update Booking Status Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update booking status"
      );
    }
  };

  // ==========================================
  // Delete Booking
  // ==========================================

  const deleteBooking = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this booking?"
      );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("token");

      await api.delete(
        `/admin/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Booking deleted successfully"
      );

      setSelectedBooking(null);

      await fetchBookings();

    } catch (error) {
      console.log(
        "Delete Booking Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete booking"
      );
    }
  };

  // ==========================================
  // Search + Filter
  // ==========================================

  const filteredBookings =
    bookings.filter((booking) => {
      const searchText =
        search.toLowerCase().trim();

      const customerName =
        booking.customer?.name
          ?.toLowerCase() || "";

      const customerEmail =
        booking.customer?.email
          ?.toLowerCase() || "";

      const technicianName =
        booking.technician?.name
          ?.toLowerCase() || "";

      const serviceName =
        booking.service?.name
          ?.toLowerCase() ||
        booking.serviceName
          ?.toLowerCase() ||
        "";

      const bookingId =
        booking.bookingId
          ?.toLowerCase() ||
        booking._id
          ?.toLowerCase() ||
        "";

      const matchesSearch =
        customerName.includes(
          searchText
        ) ||
        customerEmail.includes(
          searchText
        ) ||
        technicianName.includes(
          searchText
        ) ||
        serviceName.includes(
          searchText
        ) ||
        bookingId.includes(
          searchText
        );

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="booking-loading-page">
        <h2>
          Loading Bookings...
        </h2>
      </div>
    );
  }

  // ==========================================
  // Page
  // ==========================================

  return (
    <div className="booking-management">

      {/* ==================================
          Header
      ================================== */}

      <div className="booking-header">

        <h1>
          Booking Management
        </h1>

        <p>
          View and manage all Fixora
          service bookings.
        </p>

      </div>


      {/* ==================================
          Summary Cards
      ================================== */}

      <div className="booking-summary-grid">

        <div className="booking-summary-card">

          <p>
            Total Bookings
          </p>

          <h2>
            {bookings.length}
          </h2>

        </div>


        <div className="booking-summary-card">

          <p>
            Pending
          </p>

          <h2>
            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "Pending"
              ).length
            }
          </h2>

        </div>


        <div className="booking-summary-card">

          <p>
            In Progress
          </p>

          <h2>
            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "In Progress"
              ).length
            }
          </h2>

        </div>


        <div className="booking-summary-card">

          <p>
            Completed
          </p>

          <h2>
            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "Completed"
              ).length
            }
          </h2>

        </div>

      </div>


      {/* ==================================
          Search + Filter
      ================================== */}

      <div className="booking-filter-card">

        <div className="booking-search-wrapper">

          <span className="booking-search-icon">
            🔍
          </span>

          <input
            className="booking-search-input"
            type="text"
            placeholder="Search booking, customer, technician or service..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          className="booking-status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Accepted">
            Accepted
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>

        </select>

      </div>


      {/* ==================================
          Booking Details
      ================================== */}

      {selectedBooking && (

        <div className="booking-details">

          <div className="booking-details-header">

            <div>

              <h2>
                Booking Details
              </h2>

              <p>
                Complete booking
                information
              </p>

            </div>

            <button
              className="booking-close-btn"
              onClick={() =>
                setSelectedBooking(null)
              }
            >
              Close
            </button>

          </div>


          <div className="booking-details-grid">

            <div className="booking-detail-item">

              <label>
                Booking ID
              </label>

              <p>
                {selectedBooking.bookingId ||
                  selectedBooking._id}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Service
              </label>

              <p>
                {selectedBooking.service?.name ||
                  selectedBooking.serviceName ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Customer
              </label>

              <p>
                {selectedBooking.customer?.name ||
                  "Not Assigned"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Customer Email
              </label>

              <p>
                {selectedBooking.customer?.email ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Customer Phone
              </label>

              <p>
                {selectedBooking.customer?.phone ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Technician
              </label>

              <p>
                {selectedBooking.technician?.name ||
                  "Not Assigned"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Technician Phone
              </label>

              <p>
                {selectedBooking.technician?.phone ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Status
              </label>

              <p>
                {selectedBooking.status ||
                  "Unknown"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Payment Method
              </label>

              <p>
                {selectedBooking.paymentMethod ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Payment Status
              </label>

              <p>
                {selectedBooking.paymentStatus ||
                  "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Booking Date
              </label>

              <p>
                {selectedBooking.createdAt
                  ? new Date(
                      selectedBooking.createdAt
                    ).toLocaleDateString()
                  : "Not Available"}
              </p>

            </div>


            <div className="booking-detail-item">

              <label>
                Booking Time
              </label>

              <p>
                {selectedBooking.createdAt
                  ? new Date(
                      selectedBooking.createdAt
                    ).toLocaleTimeString()
                  : "Not Available"}
              </p>

            </div>

          </div>


          {/* ==================================
              Update Status
          ================================== */}

          <div className="booking-status-section">

            <h3>
              Update Booking Status
            </h3>

            <div className="booking-status-actions">

              <button
                className="status-pending-btn"
                onClick={() =>
                  updateBookingStatus(
                    selectedBooking._id,
                    "Pending"
                  )
                }
              >
                Pending
              </button>

              <button
                className="status-accepted-btn"
                onClick={() =>
                  updateBookingStatus(
                    selectedBooking._id,
                    "Accepted"
                  )
                }
              >
                Accepted
              </button>

              <button
                className="status-progress-btn"
                onClick={() =>
                  updateBookingStatus(
                    selectedBooking._id,
                    "In Progress"
                  )
                }
              >
                In Progress
              </button>

              <button
                className="status-completed-btn"
                onClick={() =>
                  updateBookingStatus(
                    selectedBooking._id,
                    "Completed"
                  )
                }
              >
                Completed
              </button>

              <button
                className="status-cancelled-btn"
                onClick={() =>
                  updateBookingStatus(
                    selectedBooking._id,
                    "Cancelled"
                  )
                }
              >
                Cancelled
              </button>

            </div>

          </div>


          {/* ==================================
              Delete Booking
          ================================== */}

          <div className="booking-danger-zone">

            <div>

              <h3>
                Booking Management
              </h3>

              <p>
                Permanently remove this
                booking from the system.
              </p>

            </div>

            <button
              className="booking-delete-btn"
              onClick={() =>
                deleteBooking(
                  selectedBooking._id
                )
              }
            >
              Delete Booking
            </button>

          </div>

        </div>

      )}


      {/* ==================================
          Booking Table
      ================================== */}

      {bookings.length === 0 ? (

        <div className="booking-empty">

          <h3>
            No Bookings Found
          </h3>

          <p>
            There are currently no
            bookings in the system.
          </p>

        </div>

      ) : filteredBookings.length === 0 ? (

        <div className="booking-empty">

          <h3>
            No Matching Bookings
          </h3>

          <p>
            Try changing your search
            or status filter.
          </p>

        </div>

      ) : (

        <div className="booking-table-card">

          <div className="booking-table-wrapper">

            <table className="booking-table">

              <thead>

                <tr>

                  <th>
                    Booking ID
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Service
                  </th>

                  <th>
                    Technician
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredBookings.map(
                  (booking) => (

                    <tr
                      key={
                        booking._id
                      }
                    >

                      <td>
                        <span className="booking-id">
                          {booking.bookingId ||
                            booking._id}
                        </span>
                      </td>


                      <td>
                        {booking.customer?.name ||
                          "Not Assigned"}
                      </td>


                      <td>
                        {booking.service?.name ||
                          booking.serviceName ||
                          "Not Available"}
                      </td>


                      <td>
                        {booking.technician?.name ||
                          "Not Assigned"}
                      </td>


                      <td>

                        <span
                          className={`booking-status ${
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


                      <td>

                        <button
                          className="booking-view-btn"
                          onClick={() =>
                            viewBooking(
                              booking._id
                            )
                          }
                          disabled={
                            bookingLoading
                          }
                        >
                          {bookingLoading
                            ? "Loading..."
                            : "View"}
                        </button>

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

export default BookingManagement;