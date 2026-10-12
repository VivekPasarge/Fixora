
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./TechnicianWithdrawals.css";

const TechnicianWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wallet/transactions");
      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : data.transactions || data.data || [];

      setWithdrawals(
        records
          .filter(
            (item) =>
              String(item.type).toUpperCase() === "WITHDRAWAL"
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
      );
    } catch (err) {
      console.error("Withdrawal history error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load withdrawal history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const formatDate = (date) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
      return "—";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <>
      <Navbar />

      <main className="technician-withdrawals-page">
        <header className="technician-withdrawals-header">
          <div>
            <span className="technician-withdrawals-badge">
              Technician Wallet
            </span>
            <h1>Withdrawal History</h1>
            <p>Track all your withdrawal requests and payouts.</p>
          </div>

          <div className="technician-withdrawals-actions">
            <Link
              to="/technician/wallet"
              className="technician-withdrawals-back"
            >
              Back to Wallet
            </Link>

            <button
              type="button"
              onClick={fetchWithdrawals}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="technician-withdrawals-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="technician-withdrawals-empty">
            Loading withdrawal history...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="technician-withdrawals-empty">
            <h2>No Withdrawal Records</h2>
            <p>Your withdrawal requests will appear here.</p>
          </div>
        ) : (
          <section className="technician-withdrawals-list">
            {withdrawals.map((item) => (
              <article
                className="technician-withdrawal-item"
                key={item._id || item.reference}
              >
                <div className="technician-withdrawal-details">
                  <strong>
                    {item.description || "Withdrawal request"}
                  </strong>

                  <span>{formatDate(item.createdAt)}</span>

                  <span
                    className={`technician-withdrawal-status ${String(
                      item.status || "PENDING"
                    ).toLowerCase()}`}
                  >
                    {item.status || "PENDING"}
                  </span>

                  {item.reference && (
                    <small>Reference: {item.reference}</small>
                  )}
                </div>

                <strong className="technician-withdrawal-amount">
                  −₹
                  {Number(item.amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default TechnicianWithdrawals;
