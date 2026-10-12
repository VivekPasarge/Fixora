
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./RecentWithdrawal.css";

const RecentWithdrawal = () => {
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentWithdrawal = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/wallet/transactions");
        const data = response.data;

        const transactions = Array.isArray(data)
          ? data
          : data.transactions || data.data || [];

        const withdrawals = transactions
          .filter(
            (item) =>
              String(item.type).toUpperCase() === "WITHDRAWAL"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setWithdrawal(withdrawals[0] || null);
      } catch (err) {
        console.error("Recent withdrawal error:", err);
        setError("Unable to load recent withdrawal.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentWithdrawal();
  }, []);

  const formatDate = (date) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="recent-withdrawal-section">
      <div className="recent-withdrawal-heading">
        <h2>
          <span aria-hidden="true">↗</span>
          Recent Withdrawal
        </h2>

        <Link
  to="/technician/transactions"
  className="view-all-withdrawals"
>
  View all withdrawals
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
              className={`recent-withdrawal-status ${String(
                withdrawal.status || "PENDING"
              ).toLowerCase()}`}
            >
              {withdrawal.status || "PENDING"}
            </span>
          </div>

          <strong className="recent-withdrawal-amount">
            −₹
            {Number(withdrawal.amount || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>
      )}
    </section>
  );
};

export default RecentWithdrawal;
