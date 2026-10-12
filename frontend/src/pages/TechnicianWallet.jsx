
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import RecentWithdrawal from "../components/TechnicianDashboard/RecentWithdrawal";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import "./TechnicianWallet.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("fixoraToken") ||
  localStorage.getItem("authToken");

const getStatusClass = (status) =>
  String(status || "PENDING").toLowerCase();

const TechnicianWallet = () => {
  const navigate = useNavigate();

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

  const [showWithdrawalForm, setShowWithdrawalForm] =
    useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
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

      const response = await api.get("/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load wallet."
        );
      }

      setWallet({
        balance: Number(response.data.balance) || 0,
        availableBalance:
          Number(response.data.availableBalance) || 0,
        pendingWithdrawals:
          Number(response.data.pendingWithdrawals) || 0,
        transactions: Array.isArray(response.data.transactions)
          ? response.data.transactions
          : [],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load wallet."
      );
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
      setError("The minimum withdrawal amount is ₹100.");
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
      setError("Please enter a valid UPI ID.");
      return;
    }

    if (
      !usingUpi &&
      (
        !accountHolderName.trim() ||
        !/^[0-9]{8,18}$/.test(accountNumber.trim()) ||
        !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(
          ifscCode.trim()
        )
      )
    ) {
      setError(
        "Enter a valid account holder name, account number and IFSC code."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const payoutDetails = usingUpi
      ? { upiId: upiId.trim() }
      : {
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
        };

    setSubmitting(true);

    try {
      const response = await api.post(
        "/wallet/withdraw",
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

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to submit withdrawal request."
        );
      }

      setMessage(
        response.data.message ||
          "Withdrawal request submitted for review."
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

  if (loading) {
    return (
      <main className="technician-wallet-page">
        <div className="wallet-page-container">
          <div className="wallet-page-loading">
            <FiRefreshCw className="wallet-spinner" />
            <p>Loading your wallet...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="technician-wallet-page">
      <div className="wallet-page-container">
        <button
          type="button"
          className="wallet-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <motion.header
          className="wallet-page-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="wallet-page-label">
              FINANCIAL OVERVIEW
            </span>

            <h1>My Wallet</h1>

            <p>
              View your earnings, available balance,
              withdrawal requests and transaction history.
            </p>
          </div>

          <div className="wallet-page-header-actions">
            <button
              type="button"
              className="wallet-refresh-btn"
              onClick={() => fetchWallet(false)}
              disabled={refreshing}
              aria-label="Refresh wallet"
              title="Refresh wallet"
            >
              <FiRefreshCw
                className={refreshing ? "wallet-spin" : ""}
              />
            </button>

            <div className="wallet-page-icon">
              <FiCreditCard />
            </div>
          </div>
        </motion.header>

        {error && (
          <div className="wallet-page-alert error" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className="wallet-page-alert success"
            role="status"
          >
            <FiCheckCircle />
            <span>{message}</span>
          </div>
        )}

        <section className="wallet-summary-grid">
          <motion.article
            className="wallet-summary-card primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>Total Wallet Balance</span>

            <strong>{formatCurrency(wallet.balance)}</strong>

            <small>
              Net wallet balance after completed transactions
            </small>
          </motion.article>

          <motion.article
            className="wallet-summary-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <span>Available to Withdraw</span>

            <strong>
              {formatCurrency(wallet.availableBalance)}
            </strong>

            <small>Available for a new withdrawal request</small>
          </motion.article>

          <motion.article
            className="wallet-summary-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span>Pending Withdrawals</span>

            <strong>
              {formatCurrency(wallet.pendingWithdrawals)}
            </strong>

            <small>Awaiting review or processing</small>
          </motion.article>
        </section>

        <section className="wallet-withdraw-section">
          <div className="wallet-withdraw-copy">
            <span className="wallet-section-eyebrow">
              PAYOUTS
            </span>

            <h2>Withdraw your earnings</h2>

            <p>
              Submit a withdrawal request using your UPI ID
              or bank account details.
            </p>

            <small>
              Minimum withdrawal: ₹100
            </small>
          </div>

          <button
            type="button"
            className="wallet-withdraw-btn"
            onClick={() => {
              setError("");
              setMessage("");
              setShowWithdrawalForm((previous) => !previous);
            }}
            disabled={
              wallet.availableBalance < 100 && !showWithdrawalForm
            }
          >
            <FiDownload />

            {showWithdrawalForm
              ? "Cancel Withdrawal"
              : "Request Withdrawal"}
          </button>
        </section>

        {showWithdrawalForm && (
          <motion.form
            className="wallet-withdraw-form"
            onSubmit={handleWithdrawal}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="wallet-form-header">
              <div>
                <h2>Withdrawal Request</h2>
                <p>
                  Available balance:{" "}
                  <strong>
                    {formatCurrency(wallet.availableBalance)}
                  </strong>
                </p>
              </div>

              <span className="wallet-minimum-note">
                Min. ₹100
              </span>
            </div>

            <div className="wallet-form-grid">
              <div className="wallet-form-field">
                <label htmlFor="withdraw-amount">
                  Withdrawal Amount (₹)
                </label>

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
              </div>

              <div className="wallet-form-field">
                <label htmlFor="withdraw-upi">
                  UPI ID (optional)
                </label>

                <input
                  id="withdraw-upi"
                  type="text"
                  value={upiId}
                  onChange={(event) =>
                    setUpiId(event.target.value)
                  }
                  placeholder="example@upi"
                />

                <small>
                  Enter a UPI ID, or leave blank to use bank details.
                </small>
              </div>

              {!upiId.trim() && (
                <>
                  <div className="wallet-form-field">
                    <label htmlFor="withdraw-holder">
                      Account Holder Name
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
                  </div>

                  <div className="wallet-form-field">
                    <label htmlFor="withdraw-account">
                      Bank Account Number
                    </label>

                    <input
                      id="withdraw-account"
                      type="text"
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(event) =>
                        setAccountNumber(event.target.value)
                      }
                      placeholder="Enter account number"
                      required
                    />
                  </div>

                  <div className="wallet-form-field">
                    <label htmlFor="withdraw-ifsc">
                      IFSC Code
                    </label>

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
                  </div>
                </>
              )}
            </div>

            <div className="wallet-form-note">
              <FiClock />
              <span>
                Submitting this form creates a pending withdrawal
                request. It does not automatically transfer money.
              </span>
            </div>

            <div className="wallet-form-actions">
              <button
                type="button"
                className="wallet-cancel-btn"
                onClick={() => setShowWithdrawalForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="wallet-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Withdrawal Request"}
              </button>
            </div>
          </motion.form>
        )}

        <motion.section
          className="wallet-history-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="wallet-history-header">
            <div>
              <span className="wallet-section-eyebrow">
                WALLET ACTIVITY
              </span>

              <h2>Transaction History</h2>

              <p>
                Your recorded earnings, debits and withdrawal requests.
              </p>
            </div>

            <div className="wallet-history-header-icon">
              <FiClock />
            </div>
          </div>

          {wallet.transactions.length === 0 ? (
            <div className="wallet-empty">
              <FiCreditCard />

              <h3>No transactions yet</h3>

              <p>
                Your recorded wallet activity will appear here.
              </p>
            </div>
          ) : (
            <div className="wallet-history-list">
              {wallet.transactions.map((transaction, index) => {
                const direction = String(
                  transaction.direction || ""
                ).toUpperCase();

                const status = String(
                  transaction.status || "PENDING"
                ).toUpperCase();

                const isCredit = direction === "CREDIT";
                const isWithdrawal =
                  String(transaction.type).toUpperCase() ===
                  "WITHDRAWAL";

                const Icon = isCredit
                  ? FiArrowDownLeft
                  : FiArrowUpRight;

                return (
                  <article
                    key={
                      transaction._id ||
                      transaction.reference ||
                      index
                    }
                    className="wallet-history-item"
                  >
                    <div className="wallet-history-left">
                      <div
                        className={`wallet-history-icon ${
                          isCredit ? "income" : "expense"
                        }`}
                      >
                        <Icon />
                      </div>

                      <div className="wallet-history-details">
                        <h3>
                          {transaction.description ||
                            (isWithdrawal
                              ? "Withdrawal Request"
                              : transaction.type || "Wallet Transaction")}
                        </h3>

                        <p>{formatDate(transaction.createdAt)}</p>

                        {transaction.reference && (
                          <small>
                            Ref: {transaction.reference}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="wallet-history-right">
                      <strong
                        className={
                          isCredit ? "income" : "expense"
                        }
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </strong>

                      <span
                        className={`wallet-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status === "COMPLETED" ? (
                          <FiCheckCircle />
                        ) : status === "REJECTED" ||
                          status === "FAILED" ? (
                          <FiXCircle />
                        ) : (
                          <FiClock />
                        )}

                        {status}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </motion.section>

        <p className="wallet-security-note">
          Wallet balances and transaction statuses are supplied by
          the Fixora backend. Pending withdrawal requests are not
          confirmed bank transfers.
        </p>
      </div>
    </main>
  );
};

export default TechnicianWallet;
