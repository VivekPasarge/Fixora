
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./AdminWithdrawals.css";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/wallet/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data;
      setWithdrawals(
        Array.isArray(data)
          ? data
          : data.withdrawals || []
      );
    } catch (err) {
      console.error("Fetch withdrawals error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load withdrawal requests. Check the backend API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawal = async (withdrawal, action) => {
    const id = withdrawal._id;

    if (action === "approve") {
      const confirmed = window.confirm(
        "Confirm that you have actually sent this payout before marking it completed."
      );

      if (!confirmed) return;
    }

    let reason = "";

    if (action === "reject") {
      reason = window.prompt(
        "Enter the reason for rejecting this request:"
      );

      if (reason === null) return;

      reason = reason.trim();

      if (!reason) {
        window.alert("Please enter a rejection reason.");
        return;
      }
    }

    try {
      setUpdatingId(id);
      setError("");

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const url = `/admin/wallet/withdrawals/${id}/${action}`;

      const response =
        action === "reject"
          ? await api.put(url, { reason }, config)
          : await api.put(url, {}, config);

      window.alert(
        response.data?.message || "Withdrawal updated successfully."
      );

      await fetchWithdrawals();
    } catch (err) {
      console.error("Update withdrawal error:", err);

      window.alert(
        err.response?.data?.message ||
          "Failed to update withdrawal. Check the backend route."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const payoutDetails = (withdrawal) => {
    const details = withdrawal.metadata?.payoutDetails || {};

    if (details.upiId) {
      return (
        <div>
          <strong>UPI:</strong> {details.upiId}
        </div>
      );
    }

    if (details.accountNumber) {
      const account = String(details.accountNumber);
      const maskedAccount = `••••${account.slice(-4)}`;

      return (
        <div>
          <div>
            <strong>Account:</strong> {maskedAccount}
          </div>
          <div>
            <strong>IFSC:</strong> {details.ifscCode || "—"}
          </div>
          <div>
            <strong>Holder:</strong>{" "}
            {details.accountHolderName || "—"}
          </div>
        </div>
      );
    }

    return <span>Details unavailable</span>;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <>
      <Navbar />

      <main className="admin-withdrawals-page">
        <div className="withdrawals-header">
          <div>
            <span className="withdrawals-badge">Admin Panel</span>
            <h1>Withdrawal Requests</h1>
            <p>
              Review technician payouts and manage their request status.
            </p>
          </div>

          <div className="withdrawals-header-actions">
            <Link to="/admin-dashboard" className="withdrawals-back">
              Back to Dashboard
            </Link>

            <button
              type="button"
              className="withdrawals-refresh"
              onClick={fetchWithdrawals}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="withdrawals-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="withdrawals-message">
            Loading withdrawal requests...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="withdrawals-empty">
            <h2>No Withdrawal Requests</h2>
            <p>
              Withdrawal requests will appear here when technicians request
              a payout.
            </p>
          </div>
        ) : (
          <div className="withdrawals-table-wrapper">
            <table className="withdrawals-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Amount</th>
                  <th>Payout Details</th>
                  <th>Requested On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map((withdrawal) => {
                  const technician = withdrawal.technician;
                  const status = withdrawal.status || "PENDING";
                  const isPending = status === "PENDING";
                  const isUpdating = updatingId === withdrawal._id;

                  return (
                    <tr key={withdrawal._id}>
                      <td>
                        <strong>
                          {technician?.name ||
                            technician?.fullName ||
                            "Unknown technician"}
                        </strong>
                        <small>{technician?.email || "—"}</small>
                        <small>{technician?.phone || ""}</small>
                      </td>

                      <td className="withdrawal-amount">
                        ₹{Number(withdrawal.amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="payout-details">
                        {payoutDetails(withdrawal)}
                      </td>

                      <td>{formatDate(withdrawal.createdAt)}</td>

                      <td>
                        <span
                          className={`withdrawal-status withdrawal-status-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {isPending ? (
                          <div className="withdrawal-actions">
                            <button
                              type="button"
                              className="withdrawal-approve"
                              disabled={isUpdating}
                              onClick={() =>
                                updateWithdrawal(withdrawal, "approve")
                              }
                            >
                              {isUpdating ? "Updating..." : "Mark Paid"}
                            </button>

                            <button
                              type="button"
                              className="withdrawal-reject"
                              disabled={isUpdating}
                              onClick={() =>
                                updateWithdrawal(withdrawal, "reject")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="withdrawal-no-action">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default AdminWithdrawals;
