
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./EarningsCard.css";

const initialEarnings = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  lifetime: 0,
  transactions: [],
};

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const EarningsCard = () => {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState(initialEarnings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchEarnings = async () => {
      try {
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("fixoraToken") ||
          localStorage.getItem("authToken");

        const response = await api.get("/wallet/earnings", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (!response.data?.success) {
          throw new Error("Unable to load earnings.");
        }

        const data = response.data.earnings || {};

        if (active) {
          setEarnings({
            today: Number(data.today) || 0,
            thisWeek: Number(data.thisWeek) || 0,
            thisMonth: Number(data.thisMonth) || 0,
            lifetime: Number(data.lifetime) || 0,
            transactions: Array.isArray(data.transactions)
              ? data.transactions
              : [],
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load earnings."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEarnings();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Today's Earnings", amount: earnings.today },
    { label: "This Week", amount: earnings.thisWeek },
    { label: "This Month", amount: earnings.thisMonth },
    { label: "Lifetime Earnings", amount: earnings.lifetime },
  ];

  const latestPayment = earnings.transactions[0];

  return (
    <section className="earnings-card">
      <h2>Earnings Overview</h2>

      {error && (
        <div className="earnings-error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="earnings-grid">
        {cards.map((card) => (
          <div className="earning-box" key={card.label}>
            <span>{card.label}</span>
            <h3>
              {loading
                ? "Loading..."
                : formatCurrency(card.amount)}
            </h3>
          </div>
        ))}
      </div>

      <div className="recent-payments-header">
        <h3 className="recent-title">Recent Payment</h3>

        
<button
  type="button"
  className="view-all-payments-btn"
  onClick={() => navigate("/technician/wallet")}
>
  View all payments
</button>

      </div>

      {loading ? (
        <p className="no-payment">Loading latest payment...</p>
      ) : error ? (
        <p className="no-payment">
          Unable to load the latest payment.
        </p>
      ) : !latestPayment ? (
        <p className="no-payment">
          No credited earnings yet.
        </p>
      ) : (
        <div
          className="payment-row"
          key={latestPayment._id || latestPayment.reference}
        >
          <div className="payment-details">
            <span>
              {latestPayment.description || "Completed service"}
            </span>

            <small>
              {latestPayment.createdAt
                ? new Date(
                    latestPayment.createdAt
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </small>
          </div>

          <strong>
            +{formatCurrency(latestPayment.amount)}
          </strong>
        </div>
      )}
    </section>
  );
};

export default EarningsCard;
