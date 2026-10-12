import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./RecentWithdrawal.css";

const getTransactions = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.transactions)) {
    return data.data.transactions;
  }
  if (Array.isArray(data?.wallet?.transactions)) {
    return data.wallet.transactions;
  }
  return [];
};

const RecentWithdrawal = () => {
  const navigate = useNavigate();

  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchRecentWithdrawal = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/wallet/transactions");
        const transactions = getTransactions(response.data);

        const withdrawals = transactions
          .filter((item) => {
            const type = String(item.type || "").toUpperCase();
            return type === "WITHDRAWAL";
          })
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

        if (!cancelled) {
          setWithdrawal(withdrawals[0] || null);
        }
      } catch (err) {
        console.error("Recent withdrawal error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load the latest withdrawal."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecentWithdrawal();

    return () => {
      cancelled = true;
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
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="recent-withdrawal-section">
      <div className="recent-withdrawal-heading">
        <div>
          <h2>Recent withdrawal</h2>
          <p>Your latest withdrawal request</p>
        </div>

        <button
          type="button"
          className="view-all-withdrawals"
          onClick={() => navigate("/technician/withdrawals")}
        >
          View all withdrawals →
        </button>
      </div>

      {loading ? (
        <div className="recent-withdrawal-state">
          Loading latest withdrawal...
        </div>
      ) : error ? (
        <div className="recent-withdrawal-state error" role="alert">
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
            −₹{formatAmount(withdrawal.amount)}
          </strong>
        </div>
      )}
    </section>
  );
};

export default RecentWithdrawal;