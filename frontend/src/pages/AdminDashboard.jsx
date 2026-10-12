
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    technicians: 0,
    bookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    inProgressBookings: 0,
    revenue: 0,
  });

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchPartners();
  }, []);

  // ==========================================
  // FETCH DASHBOARD STATISTICS
  // ==========================================
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Admin Dashboard Stats:", response.data);

      setStats((previousStats) => ({
        ...previousStats,
        ...(response.data.stats || {}),
      }));
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      console.error("Backend Response:", error.response?.data);
    } finally {
      setStatsLoading(false);
    }
  };

  // ==========================================
  // FETCH PARTNER APPLICATIONS
  // ==========================================
  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/partners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPartners(response.data.partners || []);
    } catch (error) {
      console.error("Fetch Partners Error:", error);
      console.error("Backend Response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // APPROVE / REJECT PARTNER
  // ==========================================
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const token = localStorage.getItem("token");

      const response = await api.put(
        `/partners/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          `Partner ${status.toLowerCase()} successfully`
      );

      await fetchPartners();
      await fetchDashboardStats();
    } catch (error) {
      console.error("Update Partner Status Error:", error);
      console.error("Backend Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to update partner status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // PENDING PARTNER APPLICATIONS
  // ==========================================
  const pendingPartners = partners.filter(
    (partner) => partner.status === "Pending"
  );

  // ==========================================
  // DASHBOARD
  // ==========================================
  return (
    <>
      <Navbar />

      <div className="admin-page">
        {/* DASHBOARD HEADER */}
        <div className="admin-header">
          <div>
            <span className="admin-badge">Admin Panel</span>

            <h1>Fixora Dashboard</h1>

            <p>
              Manage your platform, professionals and bookings.
            </p>
          </div>
        </div>

        {/* DASHBOARD STATISTICS */}
        <section className="admin-stats">
          {/* CUSTOMERS */}
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>

            <div>
              <p className="stat-label">Total Customers</p>
              <h2>
                {statsLoading ? "..." : stats.customers}
              </h2>
            </div>
          </div>

          {/* TECHNICIANS */}
          <div className="admin-stat-card">
            <div className="stat-icon">🛠️</div>

            <div>
              <p className="stat-label">Total Technicians</p>
              <h2>
                {statsLoading ? "..." : stats.technicians}
              </h2>
            </div>
          </div>

          {/* BOOKINGS */}
          <div className="admin-stat-card">
            <div className="stat-icon">📋</div>

            <div>
              <p className="stat-label">Total Bookings</p>
              <h2>
                {statsLoading ? "..." : stats.bookings}
              </h2>
            </div>
          </div>

          {/* REVENUE */}
          <div className="admin-stat-card">
            <div className="stat-icon">₹</div>

            <div>
              <p className="stat-label">Total Revenue</p>
              <h2>
                {statsLoading
                  ? "..."
                  : `₹ ${stats.revenue || 0}`}
              </h2>
            </div>
          </div>
        </section>

        {/* BOOKING OVERVIEW */}
        <section className="booking-overview">
          <div className="overview-card">
            <p>Pending</p>
            <h3>{stats.pendingBookings}</h3>
          </div>

          <div className="overview-card">
            <p>Accepted</p>
            <h3>{stats.acceptedBookings}</h3>
          </div>

          <div className="overview-card">
            <p>In Progress</p>
            <h3>{stats.inProgressBookings}</h3>
          </div>

          <div className="overview-card">
            <p>Completed</p>
            <h3>{stats.completedBookings}</h3>
          </div>

          <div className="overview-card">
            <p>Cancelled</p>
            <h3>{stats.cancelledBookings}</h3>
          </div>
        </section>

        {/* PROFESSIONAL APPLICATIONS */}
        <section className="applications-section">
          <div className="section-heading">
            <div>
              <span className="admin-badge">Professionals</span>

              <h2>Professional Applications</h2>

              <p>
                Review and manage technician applications.
              </p>
            </div>

            <div className="application-count">
              {pendingPartners.length}
              <span>Pending</span>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              Loading applications...
            </div>
          ) : pendingPartners.length === 0 ? (
            <div className="empty-applications">
              <h3>No Pending Applications</h3>

              <p>
                There are currently no professional applications
                waiting for approval.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="partner-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Profession</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingPartners.map((partner) => (
                    <tr key={partner._id}>
                      <td>{partner.fullName}</td>
                      <td>{partner.email}</td>
                      <td>{partner.profession}</td>
                      <td>{partner.workingCity}</td>

                      <td>
                        <span className="pending-status">
                          {partner.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="approve-btn"
                          disabled={updatingId === partner._id}
                          onClick={() =>
                            updateStatus(partner._id, "Approved")
                          }
                        >
                          {updatingId === partner._id
                            ? "Updating..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="reject-btn"
                          disabled={updatingId === partner._id}
                          onClick={() =>
                            updateStatus(partner._id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MANAGEMENT */}
        <section className="admin-management">
          <div className="section-heading">
            <div>
              <span className="admin-badge">Management</span>

              <h2>Manage Fixora</h2>

              <p>
                Manage customers, technicians and platform bookings.
              </p>
            </div>
          </div>

          <div className="management-grid">
            {/* CUSTOMER MANAGEMENT */}
            <Link
              to="/customer-management"
              className="management-card"
            >
              <div className="management-icon">👥</div>

              <div>
                <h3>Customer Management</h3>
                <p>View customers and their booking history.</p>
              </div>

              <span className="management-arrow">→</span>
            </Link>

            {/* TECHNICIAN MANAGEMENT */}
            <Link
              to="/technician-management"
              className="management-card"
            >
              <div className="management-icon">🛠️</div>

              <div>
                <h3>Technician Management</h3>
                <p>Manage technicians and their service activity.</p>
              </div>

              <span className="management-arrow">→</span>
            </Link>

            {/* BOOKING MANAGEMENT */}
            <Link
              to="/booking-management"
              className="management-card"
            >
              <div className="management-icon">📋</div>

              <div>
                <h3>Booking Management</h3>
                <p>View and manage all customer bookings.</p>
              </div>

              <span className="management-arrow">→</span>
            </Link>

            {/* SERVICE MANAGEMENT */}
            <Link
              to="/service-management"
              className="management-card"
            >
              <div className="management-icon">🏠</div>

              <div>
                <h3>Service Management</h3>
                <p>Add, edit and manage Fixora services.</p>
              </div>

              <span className="management-arrow">→</span>
            </Link>

            {/* WITHDRAWAL REQUESTS */}
            <Link
              to="/admin-withdrawals"
              className="management-card"
            >
              <div className="management-icon">₹</div>

              <div>
                <h3>Withdrawal Requests</h3>
                <p>
                  Review technician withdrawal requests and
                  update their payout status.
                </p>
              </div>

              <span className="management-arrow">→</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;
