import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import "./WalletCard.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://fixora-2.onrender.com/api"
).replace(/\/+$/, "");

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("fixoraToken") ||
  localStorage.getItem("authToken");

const WalletCard = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    availableBalance: 0,
    pendingWithdrawals: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchWallet = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again to view your wallet.");
      }

      const response = await axios.get(`${API_URL}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load wallet."
        );
      }

      setWallet({
        balance: Number(response.data.balance) || 0,
        availableBalance: Number(response.data.availableBalance) || 0,
        pendingWithdrawals:
          Number(response.data.pendingWithdrawals) || 0,
        transactions: Array.isArray(response.data.transactions)
          ? response.data.transactions
          : [],
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "Wallet API returned 404. Check that walletRoutes is registered and deployed on Render."
        );
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Wallet access is available to technician accounts only.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load wallet details."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleWithdrawal = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount < 100) {
      setError("Minimum withdrawal amount is ₹100.");
      return;
    }

    if (amount > wallet.availableBalance) {
      setError("Insufficient available wallet balance.");
      return;
    }

    const usingUpi = Boolean(upiId.trim());

    if (
      usingUpi &&
      !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(
        upiId.trim()
      )
    ) {
      setError("Enter a valid UPI ID.");
      return;
    }

    if (
      !usingUpi &&
      (!accountHolderName.trim() ||
        !/^[0-9]{8,18}$/.test(accountNumber.trim()) ||
        !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode.trim()))
    ) {
      setError(
        "Enter a valid account holder name, account number and IFSC code."
      );
      return;
    }

    setSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const payoutDetails = usingUpi
        ? { upiId: upiId.trim() }
        : {
            accountHolderName: accountHolderName.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.trim().toUpperCase(),
          };

      const response = await axios.post(
        `${API_URL}/wallet/withdraw`,
        {
          amount,
          payoutDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data?.message ||
          "Withdrawal request submitted successfully."
      );

      setWithdrawAmount("");
      setUpiId("");
      setAccountHolderName("");
      setAccountNumber("");
      setIfscCode("");
      setShowWithdrawalForm(false);

      await fetchWallet(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Withdrawal request failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const transactions = wallet.transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="wallet-card">
        <div className="wallet-loading">
          <FiRefreshCw className="wallet-spin" />
          <p>Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="wallet-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="wallet-header">
        <div className="wallet-heading">
          <div className="wallet-icon">
            <MdAccountBalanceWallet />
          </div>

          <div>
            <h2>My Wallet</h2>
            <p>Your earnings and transactions</p>
          </div>
        </div>

        <button
          type="button"
          className="wallet-refresh-btn"
          onClick={() => fetchWallet(false)}
          disabled={refreshing}
          aria-label="Refresh wallet"
        >
          <FiRefreshCw
            className={refreshing ? "wallet-spin" : ""}
          />
        </button>
      </div>

      {error && (
        <div className="wallet-alert wallet-alert-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="wallet-alert wallet-alert-success">
          {message}
        </div>
      )}

      <div className="wallet-balance">
        <span>Total wallet balance</span>
        <h3>{formatCurrency(wallet.balance)}</h3>

        <div className="wallet-available">
          <span>Available to withdraw</span>
          <strong>{formatCurrency(wallet.availableBalance)}</strong>
        </div>

        {wallet.pendingWithdrawals > 0 && (
          <div className="wallet-pending">
            <FiClock />
            <span>
              Pending withdrawals:{" "}
              {formatCurrency(wallet.pendingWithdrawals)}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="wallet-withdraw-btn"
        onClick={() => {
          setError("");
          setMessage("");
          setShowWithdrawalForm((previous) => !previous);
        }}
      >
        {showWithdrawalForm
          ? "Cancel withdrawal"
          : "Request withdrawal"}
      </button>

      {showWithdrawalForm && (
        <form
          className="wallet-withdraw-form"
          onSubmit={handleWithdrawal}
        >
          <h3>Withdrawal request</h3>

          <label htmlFor="withdraw-amount">Amount (₹)</label>
          <input
            id="withdraw-amount"
            type="number"
            min="100"
            max={wallet.availableBalance}
            step="0.01"
            value={withdrawAmount}
            onChange={(event) =>
              setWithdrawAmount(event.target.value)
            }
            placeholder="Enter amount"
            required
          />

          <label htmlFor="withdraw-upi">
            UPI ID (optional if using bank details)
          </label>
          <input
            id="withdraw-upi"
            type="text"
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
            placeholder="example@upi"
          />

          {!upiId.trim() && (
            <>
              <label htmlFor="withdraw-holder">
                Account holder name
              </label>
              <input
                id="withdraw-holder"
                type="text"
                value={accountHolderName}
                onChange={(event) =>
                  setAccountHolderName(event.target.value)
                }
                placeholder="Name on bank account"
                required
              />

              <label htmlFor="withdraw-account">
                Bank account number
              </label>
              <input
                id="withdraw-account"
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(event) =>
                  setAccountNumber(event.target.value)
                }
                placeholder="Account number"
                required
              />

              <label htmlFor="withdraw-ifsc">IFSC code</label>
              <input
                id="withdraw-ifsc"
                type="text"
                value={ifscCode}
                onChange={(event) =>
                  setIfscCode(event.target.value.toUpperCase())
                }
                placeholder="ABCD0123456"
                required
              />
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="wallet-submit-btn"
          >
            {submitting
              ? "Submitting..."
              : "Submit withdrawal request"}
          </button>

          <p className="wallet-form-note">
            This submits a request for review. It does not transfer
            money automatically.
          </p>
        </form>
      )}

      <div className="wallet-transactions-header">
        <h3>Recent transactions</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="wallet-empty">
          <MdAccountBalanceWallet />
          <p>No wallet transactions yet.</p>
        </div>
      ) : (
        <div className="wallet-transactions">
          {transactions.map((transaction) => {
            const isCredit = transaction.direction === "CREDIT";

            return (
              <div
                className="wallet-transaction"
                key={transaction._id}
              >
                <div
                  className={`wallet-transaction-icon ${
                    isCredit ? "credit" : "debit"
                  }`}
                >
                  {isCredit ? (
                    <FiArrowDownLeft />
                  ) : (
                    <FiArrowUpRight />
                  )}
                </div>

                <div className="wallet-transaction-info">
                  <strong>
                    {transaction.description || transaction.type}
                  </strong>

                  <span>
                    {transaction.createdAt
                      ? new Date(
                          transaction.createdAt
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date unavailable"}
                  </span>

                  <span
                    className={`wallet-status ${String(
                      transaction.status || "PENDING"
                    ).toLowerCase()}`}
                  >
                    {transaction.status}
                  </span>
                </div>

                <strong
                  className={`wallet-transaction-amount ${
                    isCredit ? "credit" : "debit"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default WalletCard;
