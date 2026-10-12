

import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";



import api from "../api/axios";

import logo from "../assets/logo/fixora-logo.png";



import "./AdminDashboard.css";



const INITIAL_STATS = {

  customers: 0,

  technicians: 0,

  bookings: 0,

  completedBookings: 0,

  cancelledBookings: 0,

  pendingBookings: 0,

  acceptedBookings: 0,

  onTheWayBookings: 0,

  inProgressBookings: 0,

  revenue: 0,

};



const AdminDashboard = () => {

  const [stats, setStats] = useState(INITIAL_STATS);



  const [partners, setPartners] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statsLoading, setStatsLoading] = useState(true);

  const [statsError, setStatsError] = useState("");

  const [partnersError, setPartnersError] = useState("");

  const [refreshingStats, setRefreshingStats] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  const [adminProfile, setAdminProfile] = useState({
    name: "Admin",
    email: "",
  });

  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user =
          response.data?.user ||
          response.data?.profile ||
          response.data;

        setAdminProfile({
          name: user?.name || user?.fullName || "Admin",
          email: user?.email || "",
        });
      } catch (error) {
        console.error("Admin Profile Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };




  // =====================================================

  // FETCH DASHBOARD STATISTICS

  // =====================================================



  const fetchDashboardStats = useCallback(async (isRefresh = false) => {

    try {

      if (isRefresh) {

        setRefreshingStats(true);

      } else {

        setStatsLoading(true);

      }



      setStatsError("");



      const token = localStorage.getItem("token");



      if (!token) {

        throw new Error("Admin session not found. Please log in again.");

      }



      const response = await api.get("/admin/dashboard", {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      });



      if (!response.data?.success || !response.data?.stats) {

        throw new Error(

          response.data?.message || "Invalid dashboard response."

        );

      }



      const data = response.data.stats;



      setStats({

        customers: Number(data.customers) || 0,

        technicians: Number(data.technicians) || 0,

        bookings: Number(data.bookings) || 0,

        completedBookings: Number(data.completedBookings) || 0,

        cancelledBookings: Number(data.cancelledBookings) || 0,

        pendingBookings: Number(data.pendingBookings) || 0,

        acceptedBookings: Number(data.acceptedBookings) || 0,

        onTheWayBookings: Number(data.onTheWayBookings) || 0,

        inProgressBookings: Number(data.inProgressBookings) || 0,

        revenue: Number(data.revenue) || 0,

      });

    } catch (error) {

      console.error("Dashboard Stats Error:", error);

      console.error("Backend Response:", error.response?.data);



      setStatsError(

        error.response?.data?.message ||

          error.message ||

          "Unable to load dashboard statistics."

      );

    } finally {

      setStatsLoading(false);

      setRefreshingStats(false);

    }

  }, []);



  // =====================================================

  // FETCH PARTNER APPLICATIONS

  // =====================================================



  const fetchPartners = useCallback(async () => {

    try {

      setLoading(true);

      setPartnersError("");



      const token = localStorage.getItem("token");



      if (!token) {

        throw new Error("Admin session not found. Please log in again.");

      }



      const response = await api.get("/partners", {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      });



      setPartners(

        Array.isArray(response.data?.partners)

          ? response.data.partners

          : []

      );

    } catch (error) {

      console.error("Fetch Partners Error:", error);

      console.error("Backend Response:", error.response?.data);



      setPartnersError(

        error.response?.data?.message ||

          error.message ||

          "Unable to load professional applications."

      );

    } finally {

      setLoading(false);

    }

  }, []);



  // =====================================================

  // INITIAL LOAD

  // =====================================================



  useEffect(() => {

    fetchDashboardStats();

    fetchPartners();

  }, [fetchDashboardStats, fetchPartners]);



  // =====================================================

  // APPROVE / REJECT PARTNER

  // =====================================================



  const updateStatus = async (id, status) => {

    try {

      setUpdatingId(id);



      const token = localStorage.getItem("token");



      if (!token) {

        throw new Error("Admin session not found. Please log in again.");

      }



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

        response.data?.message ||

          `Partner ${status.toLowerCase()} successfully.`

      );



      await Promise.all([

        fetchPartners(),

        fetchDashboardStats(true),

      ]);

    } catch (error) {

      console.error("Update Partner Status Error:", error);

      console.error("Backend Response:", error.response?.data);



      alert(

        error.response?.data?.message ||

          error.message ||

          "Failed to update partner status."

      );

    } finally {

      setUpdatingId(null);

    }

  };



  // =====================================================

  // DERIVED DATA

  // =====================================================



  const pendingPartners = partners.filter(

    (partner) => partner.status === "Pending"

  );



  const formattedRevenue = new Intl.NumberFormat("en-IN", {

    maximumFractionDigits: 2,

  }).format(stats.revenue);



  // =====================================================

  // DASHBOARD

  // =====================================================



  return (

    <>

      {/* ADMIN COMMAND CENTER HEADER */}

      <header className="admin-command-header">

        <Link

          to="/admin-dashboard"

          className="admin-command-brand"

          aria-label="Fixora Admin Command Center"

        >

          <img src={logo} alt="Fixora Logo" />



          <div className="admin-command-brand-text">

            <span>FIXORA</span>

            <small>ADMIN COMMAND CENTER</small>

          </div>

        </Link>



        <div className="admin-command-label">

          <span className="admin-command-status-dot" />

          <span>PLATFORM MANAGEMENT SYSTEM</span>

        </div>
        <div className="admin-profile">
          <button
            type="button"
            className="admin-profile-trigger"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Open admin profile menu"
          >
            <span className="admin-avatar">
              {(adminProfile.name || "A").charAt(0).toUpperCase()}
            </span>
            <span className="admin-profile-details">
              <strong>{adminProfile.name}</strong>
              <small>Administrator</small>
            </span>
            <span className="admin-profile-chevron">
              {profileOpen ? "▲" : "▼"}
            </span>
          </button>

          {profileOpen && (
            <div className="admin-profile-menu">
              <div className="admin-profile-info">
                <strong>{adminProfile.name}</strong>
                <small>{adminProfile.email || "Admin account"}</small>
              </div>
              <button
                type="button"
                className="admin-logout-btn"
                onClick={handleLogout}
              >
                <span aria-hidden="true">↪</span>
                Logout
              </button>
            </div>
          )}
        </div>


      </header>



      <main className="admin-page">

        {/* DASHBOARD TITLE */}

        <div className="admin-header">

          <div>

            <span className="admin-badge">Admin Panel</span>



            <h1>Fixora Dashboard</h1>



            <p>Manage your platform, professionals and bookings.</p>

          </div>



          <button

            type="button"

            className="admin-refresh-btn"

            onClick={() => fetchDashboardStats(true)}

            disabled={statsLoading || refreshingStats}

          >

            {refreshingStats ? "Refreshing..." : "Refresh Statistics"}

          </button>

        </div>



        {/* STATISTICS ERROR */}

        {statsError && (

          <div className="admin-stats-error" role="alert">

            <span>{statsError}</span>



            <button

              type="button"

              onClick={() => fetchDashboardStats(true)}

              disabled={refreshingStats}

            >

              {refreshingStats ? "Retrying..." : "Try Again"}

            </button>

          </div>

        )}



        {/* DASHBOARD STATISTICS */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="stat-icon">👥</div>



            <div>

              <p className="stat-label">Total Customers</p>

              <h2>

                {statsLoading ? "..." : stats.customers}

              </h2>

            </div>

          </div>



          <div className="admin-stat-card">

            <div className="stat-icon">🛠️</div>



            <div>

              <p className="stat-label">Total Technicians</p>

              <h2>

                {statsLoading ? "..." : stats.technicians}

              </h2>

            </div>

          </div>



          <div className="admin-stat-card">

            <div className="stat-icon">📋</div>



            <div>

              <p className="stat-label">Total Bookings</p>

              <h2>

                {statsLoading ? "..." : stats.bookings}

              </h2>

            </div>

          </div>



          <div className="admin-stat-card">

            <div className="stat-icon">₹</div>



            <div>

              <p className="stat-label">Total Revenue</p>

              <h2>

                {statsLoading ? "..." : `₹ ${formattedRevenue}`}

              </h2>

            </div>

          </div>

        </section>



        {/* BOOKING STATUS OVERVIEW */}

        <section className="booking-overview">

          <div className="overview-card">

            <p>Pending</p>

            <h3>

              {statsLoading ? "..." : stats.pendingBookings}

            </h3>

          </div>



          <div className="overview-card">

            <p>Accepted</p>

            <h3>

              {statsLoading ? "..." : stats.acceptedBookings}

            </h3>

          </div>



          <div className="overview-card">

            <p>On The Way</p>

            <h3>

              {statsLoading ? "..." : stats.onTheWayBookings}

            </h3>

          </div>



          <div className="overview-card">

            <p>In Progress</p>

            <h3>

              {statsLoading ? "..." : stats.inProgressBookings}

            </h3>

          </div>



          <div className="overview-card">

            <p>Completed</p>

            <h3>

              {statsLoading ? "..." : stats.completedBookings}

            </h3>

          </div>



          <div className="overview-card">

            <p>Cancelled</p>

            <h3>

              {statsLoading ? "..." : stats.cancelledBookings}

            </h3>

          </div>

        </section>



        {/* PROFESSIONAL APPLICATIONS */}

        <section className="applications-section">

          <div className="section-heading">

            <div>

              <span className="admin-badge">Professionals</span>



              <h2>Professional Applications</h2>



              <p>Review and manage technician applications.</p>

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

          ) : partnersError ? (

            <div className="empty-applications" role="alert">

              <h3>Unable to Load Applications</h3>

              <p>{partnersError}</p>



              <button type="button" onClick={fetchPartners}>

                Try Again

              </button>

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

                      <td>{partner.fullName || "—"}</td>

                      <td>{partner.email || "—"}</td>

                      <td>{partner.profession || "—"}</td>

                      <td>{partner.workingCity || "—"}</td>



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



        {/* PLATFORM MANAGEMENT */}

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



            <Link

              to="/technician-management"

              className="management-card"

            >

              <div className="management-icon">🛠️</div>



              <div>

                <h3>Technician Management</h3>

                <p>

                  Manage technicians and their service activity.

                </p>

              </div>



              <span className="management-arrow">→</span>

            </Link>



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

      </main>

    </>

  );

};



export default AdminDashboard;
