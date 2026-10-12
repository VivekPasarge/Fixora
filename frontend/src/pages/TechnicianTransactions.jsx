
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import "./TechnicianTransactions.css";

const TechnicianTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/wallet/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : data.transactions || data.data || [];

      setTransactions(records);
    } catch (err) {
      console.error("Fetch transactions error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const type = String(transaction.type || "").toUpperCase();
      const status = String(transaction.status || "").toUpperCase();

      switch (filter) {
        case "EARNINGS":
          return type === "EARNING";

        case "WITHDRAWALS":
          return type === "WITHDRAWAL";

        case "COMPLETED":
          return status === "COMPLETED";

        case "PENDING":
          return status === "PENDING";

        case "REJECTED":
          return status === "REJECTED";

        default:
          return true;
      }
    });
  }, [transactions, filter]);

  const formatAmount = (transaction) => {
    const amount = Number(transaction.amount || 0);
    const isCredit =
      String(transaction.direction || "").toUpperCase() === "CREDIT";

    const sign = isCredit ? "+" : "-";

    return `${sign}₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "UNKNOWN").toLowerCase();

    if (
      ["completed", "pending", "rejected", "failed"].includes(normalized)
    ) {
      return normalized;
    }

    return "unknown";
  };

  return (
    <>
      <Navbar />

      <main className="technician-transactions-page">
        <header className="transactions-header">
          <div>
            <span className="transactions-badge">
              Technician Wallet
            </span>

            <h1>Recent Transactions</h1>

            <p>
              Track your earnings, withdrawal requests, and wallet activity.
            </p>
          </div>

          <div className="transactions-header-actions">
            <Link
              to="/technician/wallet"
              className="transactions-back-button"
            >
              Back to Wallet
            </Link>

            <button
              type="button"
              className="transactions-refresh-button"
              onClick={fetchTransactions}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </header>

        <section className="transactions-summary">
          <div className="transactions-summary-card">
            <span>Total Transactions</span>
            <strong>{transactions.length}</strong>
          </div>

          <div className="transactions-summary-card">
            <span>Completed</span>
            <strong>
              {
                transactions.filter(
                  (item) =>
                    String(item.status).toUpperCase() === "COMPLETED"
                ).length
              }
            </strong>
          </div>

          <div className="transactions-summary-card">
            <span>Pending</span>
            <strong>
              {
                transactions.filter(
                  (item) =>
                    String(item.status).toUpperCase() === "PENDING"
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="transactions-panel">
          <div className="transactions-panel-header">
            <div>
              <h2>Transaction History</h2>
              <p>
                View and filter your wallet transactions.
              </p>
            </div>
          </div>

          <div className="transactions-filters">
            {[
              { label: "All", value: "ALL" },
              { label: "Earnings", value: "EARNINGS" },
              { label: "Withdrawals", value: "WITHDRAWALS" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Pending", value: "PENDING" },
              { label: "Rejected", value: "REJECTED" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className={`transaction-filter ${
                  filter === item.value ? "active" : ""
                }`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="transactions-error" role="alert">
              {error}
              <button type="button" onClick={fetchTransactions}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="transactions-state">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="transactions-empty">
              <div className="transactions-empty-icon">↔</div>

              <h3>No Transactions Found</h3>

              <p>
                {transactions.length === 0
                  ? "Your wallet transactions will appear here when earnings or withdrawal requests are recorded."
                  : "There are no transactions matching this filter."}
              </p>

              {filter !== "ALL" && (
                <button
                  type="button"
                  className="transactions-reset-button"
                  onClick={() => setFilter("ALL")}
                >
                  View All Transactions
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="transactions-table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="amount-heading">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const isCredit =
                        String(transaction.direction).toUpperCase() ===
                        "CREDIT";

                      const status = String(
                        transaction.status || "UNKNOWN"
                      ).toUpperCase();

                      return (
                        <tr key={transaction._id || transaction.reference}>
                          <td>
                            <div className="transaction-description">
                              <span
                                className={`transaction-icon ${
                                  isCredit ? "credit" : "debit"
                                }`}
                              >
                                {isCredit ? "↙" : "↗"}
                              </span>

                              <div>
                                <strong>
                                  {transaction.description ||
                                    transaction.type ||
                                    "Wallet transaction"}
                                </strong>

                                <small>
                                  {String(
                                    transaction.type || "TRANSACTION"
                                  ).replace(/_/g, " ")}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td className="transaction-reference">
                            {transaction.reference || "—"}
                          </td>

                          <td className="transaction-date">
                            {formatDate(transaction.createdAt)}
                          </td>

                          <td>
                            <span
                              className={`transaction-status ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td
                            className={`transaction-amount ${
                              isCredit ? "positive" : "negative"
                            }`}
                          >
                            {formatAmount(transaction)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="transactions-footer">
                Showing {filteredTransactions.length} of{" "}
                {transactions.length} transactions
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default TechnicianTransactions;
