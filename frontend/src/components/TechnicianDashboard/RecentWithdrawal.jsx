
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./RecentWithdrawal.css";

const RecentWithdrawal = () => {
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchRecentWithdrawal = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("fixoraToken") ||
          localStorage.getItem("authToken");

        const response = await api.get("/wallet/transactions", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        const data = response.data;

        const transactions = Array.isArray(data)
          ? data
          : Array.isArray(data?.transactions)
          ? data.transactions
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const withdrawals = transactions
          .filter(
            (item) =>
              String(item.type || "").toUpperCase() ===
              "WITHDRAWAL"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );

        if (active) {
          setWithdrawal(withdrawals[0] || null);
        }
      } catch (err) {
        console.error("Recent withdrawal error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load recent withdrawal."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchRecentWithdrawal();

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const status = String(withdrawal?.status || "PENDING")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <section className="recent-withdrawal-section">
      <div className="recent-withdrawal-heading">
        <h2>
          <span aria-hidden="true">↗</span>
          Recent Withdrawal
        </h2>

        <Link
          to="/technician/withdrawals"
          className="view-all-withdrawals"
        >
          View all withdrawals →
        </Link>
      </div>

      {loading ? (
        <div className="recent-withdrawal-state">
          Loading recent withdrawal...
        </div>
      ) : error ? (
        <div className="recent-withdrawal-state error">
          {error}
        </div>
      ) : !withdrawal ? (
        <div className="recent-withdrawal-state">
          No withdrawal requests yet.
        </div>
      ) : (
        <div className="recent-withdrawal-card">
          <div className="recent-withdrawal-info">
            <strong>
              {withdrawal.description || "Withdrawal request"}
            </strong>

            <span>{formatDate(withdrawal.createdAt)}</span>

            <span
              className={`recent-withdrawal-status ${status}`}
            >
              {withdrawal.status || "PENDING"}
            </span>
          </div>

          <strong className="recent-withdrawal-amount">
            −₹{formatAmount(withdrawal.amount)}
          </strong>
        </div>
      )}
    </section>
  );
};

export default RecentWithdrawal;
