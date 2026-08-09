import { useEffect, useState } from "react";
import api from "../api/axios";
import "./CustomerManagement.css";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ==========================================
  // Fetch Customers
  // ==========================================

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Customers:", response.data);

      setCustomers(
        response.data.customers || []
      );
    } catch (error) {
      console.log(
        "Fetch Customers Error:",
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
    fetchCustomers();
  }, []);

  // ==========================================
  // Fetch Customer Bookings
  // ==========================================

  const fetchCustomerBookings = async (id) => {
    try {
      setBookingLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/admin/customers/${id}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Customer Bookings:",
        response.data
      );

      setBookings(
        response.data.bookings || []
      );
    } catch (error) {
      console.log(
        "Customer Bookings Error:",
        error
      );

      console.log(
        "Backend Response:",
        error.response?.data
      );

      setBookings([]);
    } finally {
      setBookingLoading(false);
    }
  };

const deleteCustomer = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this customer?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    await api.delete(
      `/admin/customers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Customer deleted successfully");

    setSelectedCustomer(null);

    await fetchCustomers();

  } catch (error) {
    console.log(
      "Delete Customer Error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to delete customer"
    );
  }
};

  // ==========================================
  // Fetch Single Customer
  // ==========================================

  const viewCustomer = async (id) => {
    try {
      setCustomerLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/admin/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Customer Details:",
        response.data
      );

      setSelectedCustomer(
        response.data.customer
      );

      // Fetch booking history
      await fetchCustomerBookings(id);

    } catch (error) {
      console.log(
        "Customer Details Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load customer details"
      );
    } finally {
      setCustomerLoading(false);
    }
  };

  // ==========================================
  // Search
  // ==========================================

  const filteredCustomers =
    customers.filter((customer) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        customer.name
          ?.toLowerCase()
          .includes(searchText) ||
        customer.email
          ?.toLowerCase()
          .includes(searchText) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="customer-loading">
        <h2>Loading Customers...</h2>
      </div>
    );
  }

  // ==========================================
  // Page
  // ==========================================

  return (
    <div className="customer-management">      {/* ==================================
          Header
      ================================== */}

      <div className="customer-header">
        <h1>
          Customer Management
        </h1>

        <p>
          View and manage all registered
          Fixora customers.
        </p>
      </div>

      {/* ==================================
          Customer Summary
      ================================== */}

      <div className="customer-summary">
        <div>
          <p className="customer-summary-label">
            Total Customers
          </p>

          <h2 className="customer-summary-count">
            {customers.length}
          </h2>
        </div>
      </div>

      {/* ==================================
          Search
      ================================== */}

      <div className="customer-search-card">
        <div className="customer-search-wrapper">

          <span className="customer-search-icon">
            🔍
          </span>

          <input
            className="customer-search-input"
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>
      </div>

      {/* ==================================
          Customer Details
      ================================== */}

      {selectedCustomer && (
        <div className="customer-details">

          {/* Customer Details Header */}

          <div className="customer-details-header">

            <div>
              <h2>
                Customer Details
              </h2>

              <p>
                Complete customer
                information
              </p>
            </div>

            <button
              className="customer-close-btn"
              onClick={() => {
                setSelectedCustomer(null);
                setBookings([]);
              }}
            >
              Close
            </button>

          </div>

          {/* ==================================
              Booking History
          ================================== */}

          <div className="customer-bookings">

            <div className="customer-bookings-header">

              <div>
                <h3>
                  Booking History
                </h3>

                <p>
                  Services booked by this customer
                </p>
              </div>

              <span className="booking-count">
                {bookings.length} Bookings
              </span>

            </div>

            {bookingLoading ? (

              <div className="booking-loading">
                Loading booking history...
              </div>

            ) : bookings.length === 0 ? (

              <div className="booking-empty">
                <p>
                  This customer has no
                  booking history.
                </p>
              </div>

            ) : (

              <div className="booking-table-wrapper">

                <table className="booking-table">

                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Service</th>
                      <th>Technician</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {bookings.map(
                      (booking) => (

                        <tr
                          key={booking._id}
                        >

                          <td>
                            {booking.bookingId ||
                              booking._id}
                          </td>

                          <td>
                            {booking.service?.name ||
                              booking.serviceName ||
                              "N/A"}
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

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* ==================================
              Customer Information
          ================================== */}

          <div className="customer-details-grid">

            <div className="customer-detail-item">
              <label>Name</label>

              <p>
                {selectedCustomer.name ||
                  "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Email</label>

              <p>
                {selectedCustomer.email ||
                  "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Phone</label>

              <p>
                {selectedCustomer.phone ||
                  "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Address</label>

              <p>
                {selectedCustomer.address ||
                  "Not Available"}
              </p>
            </div>
            </div>

                        <div className="customer-detail-item">
              <label>Gender</label>

              <p>
                {selectedCustomer.gender ||
                  "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Service Area</label>

              <p>
                {selectedCustomer.serviceArea ||
                  "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Joined</label>

              <p>
                {selectedCustomer.createdAt
                  ? new Date(
                      selectedCustomer.createdAt
                    ).toLocaleDateString()
                  : "Not Available"}
              </p>
            </div>

            <div className="customer-detail-item">
              <label>Role</label>

              <p>
                {selectedCustomer.role ||
                  "customer"}
              </p>
            </div>

          </div>

        
      )}

      {/* ==================================
          Customer Table
      ================================== */}

      {customers.length === 0 ? (

        <div className="customer-empty">

          <h3>
            No Customers Found
          </h3>

          <p>
            There are currently no
            registered customers.
          </p>

        </div>

      ) : filteredCustomers.length === 0 ? (

        <div className="customer-empty">

          <h3>
            No Matching Customers
          </h3>

          <p>
            Try a different search.
          </p>

        </div>

      ) : (
                <div className="customer-table-card">

          <div className="customer-table-wrapper">

            <table className="customer-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Address
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

                {filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer._id}
                    >

                      <td>
                        <span className="customer-name">
                          {customer.name ||
                            "Not Available"}
                        </span>
                      </td>

                      <td>
                        {customer.email ||
                          "Not Available"}
                      </td>

                      <td>
                        {customer.phone ||
                          "Not Available"}
                      </td>

                      <td>
                        {customer.address ||
                          "Not Available"}
                      </td>

                      <td>
                        {customer.createdAt
                          ? new Date(
                              customer.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>

                        <div className="customer-actions">

  <button
    className="customer-view-btn"
    onClick={() =>
      viewCustomer(customer._id)
    }
    disabled={customerLoading}
  >
    {customerLoading
      ? "Loading..."
      : "View"}
  </button>

  <button
    className="customer-delete-btn"
    onClick={() =>
      deleteCustomer(customer._id)
    }
  >
    Delete
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

export default CustomerManagement;