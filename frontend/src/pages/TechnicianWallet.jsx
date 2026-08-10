import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCheckCircle,
  FiClock,
  FiDownload,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import "./TechnicianWallet.css";


const TechnicianWallet = () => {

  const navigate = useNavigate();

  const [earnings, setEarnings] = useState(null);

  const [loading, setLoading] = useState(true);


  /* =========================================================
     FETCH TECHNICIAN EARNINGS
  ========================================================= */

  useEffect(() => {

    const fetchEarnings = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response = await api.get(
          "/bookings/technician/earnings",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Technician Earnings:",
          response.data
        );

        setEarnings(
          response.data
        );

      } catch (error) {

        console.log(
          "Earnings Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    fetchEarnings();

  }, []);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <main className="technician-wallet-page">

        <div className="wallet-page-container">

          <div className="wallet-page-loading">

            <div className="wallet-spinner"></div>

            <p>
              Loading wallet...
            </p>

          </div>

        </div>

      </main>
    );

  }


  /* =========================================================
     DATA
  ========================================================= */

  const balance =
    earnings?.balance ??
    earnings?.totalEarnings ??
    0;


  const totalEarnings =
    earnings?.totalEarnings ??
    0;


  const completedJobs =
    earnings?.completedJobs ??
    0;


  const transactions =
    earnings?.transactions ??
    [];


  /* =========================================================
     UI
  ========================================================= */

  return (

    <main className="technician-wallet-page">

      <div className="wallet-page-container">


        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          className="wallet-back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <FiArrowLeft />

          Back to Dashboard

        </button>


        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          className="wallet-page-header"

          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div>

            <span className="wallet-page-label">
              FINANCIAL OVERVIEW
            </span>

            <h1>
              My Wallet
            </h1>

            <p>
              Track your earnings,
              completed services and
              wallet transactions.
            </p>

          </div>


          <div className="wallet-page-icon">

            <FiCreditCard />

          </div>

        </motion.div>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="wallet-summary-grid">


          <div className="wallet-summary-card primary">

            <span>
              Available Balance
            </span>

            <strong>
              ₹{Number(balance).toLocaleString("en-IN")}
            </strong>

            <small>
              Available for withdrawal
            </small>

          </div>


          <div className="wallet-summary-card">

            <span>
              Total Earnings
            </span>

            <strong>
              ₹{Number(totalEarnings).toLocaleString("en-IN")}
            </strong>

            <small>
              Lifetime earnings
            </small>

          </div>


          <div className="wallet-summary-card">

            <span>
              Completed Jobs
            </span>

            <strong>
              {completedJobs}
            </strong>

            <small>
              Successfully completed
            </small>

          </div>


        </div>


        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <motion.section
          className="wallet-history-card"

          initial={{
            opacity: 0,
            y: 25,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.2,
          }}
        >

          <div className="wallet-history-header">

            <div>

              <h2>
                Transaction History
              </h2>

              <p>
                Complete record of your
                wallet activity.
              </p>

            </div>


            <FiClock />

          </div>


          {transactions.length === 0 ? (

            <div className="wallet-empty">

              <FiCreditCard />

              <h3>
                No transactions yet
              </h3>

              <p>
                Your completed service
                payments will appear here.
              </p>

            </div>

          ) : (

            <div className="wallet-history-list">

              {transactions.map(
                (transaction, index) => (

                  <div
                    key={
                      transaction._id ||
                      transaction.id ||
                      index
                    }
                    className="wallet-history-item"
                  >

                    <div className="wallet-history-left">

                      <div
                        className={`wallet-history-icon ${
                          transaction.type ===
                          "expense"
                            ? "expense"
                            : "income"
                        }`}
                      >

                        {transaction.type ===
                        "expense" ? (
                          <FiArrowDownLeft />
                        ) : (
                          <FiArrowUpRight />
                        )}

                      </div>


                      <div>

                        <h3>
                          {transaction.title ||
                            transaction.description ||
                            "Service Payment"}
                        </h3>

                        <p>
                          {transaction.date ||
                            transaction.createdAt ||
                            "Recent transaction"}
                        </p>

                      </div>

                    </div>


                    <div className="wallet-history-right">

                      <strong
                        className={
                          transaction.type ===
                          "expense"
                            ? "expense"
                            : "income"
                        }
                      >

                        {transaction.amount ||
                          "₹0"}

                      </strong>


                      <span>

                        <FiCheckCircle />

                        Completed

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </motion.section>


        {/* =================================================
            WITHDRAW
        ================================================= */}

        <div className="wallet-withdraw-section">

          <div>

            <h2>
              Need to withdraw?
            </h2>

            <p>
              Transfer your available
              earnings to your registered
              bank account.
            </p>

          </div>


          <button
            type="button"
            className="wallet-withdraw-btn"
            onClick={() =>
              alert(
                "Withdrawal feature will be available soon."
              )
            }
          >

            <FiDownload />

            Withdraw Earnings

          </button>

        </div>


      </div>

    </main>

  );
};


export default TechnicianWallet;