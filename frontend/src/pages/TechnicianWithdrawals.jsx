import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./TechnicianWithdrawals.css";

const TechnicianWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ALL WITHDRAWAL RECORDS
  // ==========================================

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wallet/transactions");
      const data = response.data;

      // Support common API response formats.
      let records = [];

      if (Array.isArray(data)) {
        records = data;
      } else if (Array.isArray(data?.transactions)) {
        records = data.transactions;
      } else if (Array.isArray(data?.data)) {
        records = data.data;
      } else if (Array.isArray(data?.data?.transactions)) {
        records = data.data.transactions;
      } else if (Array.isArray(data?.wallet?.transactions)) {
        records = data.wallet.transactions;
      }

      // Keep withdrawal transactions only and show newest first.
      const withdrawalRecords = records
        .filter(
          (item) =>
            String(item?.type || "").toUpperCase() === "WITHDRAWAL"
        )
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();

          return (
            (Number.isNaN(dateB) ? 0 : dateB) -
            (Number.isNaN(dateA) ? 0 : dateA)
          );
        });

      setWithdrawals(withdrawalRecords);
    } catch (err) {
      console.error("Withdrawal history error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load withdrawal history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  const formatAmount = (amount) => {
    const value = Number(amount);

    return (Number.isFinite(value) ? value : 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    const value = String(status || "PENDING");

    return value
      .replace(/[_-]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const getStatusClass = (status) => {
    return String(status || "PENDING")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
  };

  // ==========================================
  // PAGE UI
  // ==========================================

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

            <p>
              Track all your withdrawal requests and payouts.
            </p>
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
          <div
            className="technician-withdrawals-error"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchWithdrawals}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="technician-withdrawals-empty">
            Loading withdrawal history...
          </div>
        ) : error ? null : withdrawals.length === 0 ? (
          <div className="technician-withdrawals-empty">
            <h2>No Withdrawal Records</h2>

            <p>
              Your withdrawal requests will appear here after you
              submit a withdrawal request.
            </p>

            <Link
              to="/technician/wallet"
              className="technician-withdrawals-back"
            >
              Go to Wallet
            </Link>
          </div>
        ) : (
          <section
            className="technician-withdrawals-list"
            aria-label="All withdrawal records"
          >
            <div className="technician-withdrawals-list-header">
              <h2>All Withdrawals</h2>

              <span>
                {withdrawals.length}{" "}
                {withdrawals.length === 1
                  ? "record"
                  : "records"}
              </span>
            </div>

            {withdrawals.map((item, index) => (
              <article
                className="technician-withdrawal-item"
                key={
                  item._id ||
                  item.reference ||
                  `${item.createdAt || "withdrawal"}-${index}`
                }
              >
                <div className="technician-withdrawal-details">
                  <strong>
                    {item.description || "Withdrawal request"}
                  </strong>

                  <span>{formatDate(item.createdAt)}</span>

                  <span
                    className={`technician-withdrawal-status ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>

                  {item.reference && (
                    <small>
                      Reference: {item.reference}
                    </small>
                  )}
                </div>

                <strong className="technician-withdrawal-amount">
                  −₹{formatAmount(item.amount)}
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