import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiDownload,
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./WalletCard.css";


const WalletCard = () => {

  const navigate = useNavigate();


  /* =========================================================
     TEMPORARY WALLET DATA

     We will connect this to the backend earnings/wallet
     API after the frontend buttons are working.
  ========================================================= */

  const balance = 18540;


  const transactions = [
    {
      id: 1,
      title: "Service Payment",
      date: "Today • 10:30 AM",
      amount: "+ ₹850",
      type: "income",
      status: "Completed",
    },

    {
      id: 2,
      title: "Weekly Payout",
      date: "Yesterday",
      amount: "+ ₹5,200",
      type: "income",
      status: "Completed",
    },

    {
      id: 3,
      title: "Platform Fee",
      date: "Yesterday",
      amount: "- ₹350",
      type: "expense",
      status: "Completed",
    },
  ];


  /* =========================================================
     WITHDRAW
  ========================================================= */

  const handleWithdraw = () => {

    /*
      Temporary behaviour.

      Later this button will connect to the
      technician withdrawal/payment backend.
    */

    alert(
      "Withdrawal feature will be available soon."
    );
  };


  /* =========================================================
     VIEW ALL TRANSACTIONS
  ========================================================= */
const handleViewAll = () => {
  navigate("/technician/wallet");
};
  /* =========================================================
     FORMAT BALANCE
  ========================================================= */

  const formattedBalance =
    balance.toLocaleString("en-IN");


  /* =========================================================
     UI
  ========================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="wallet-card"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="wallet-header">

        <div>

          <h2 className="wallet-title">
            Wallet
          </h2>

          <p className="wallet-subtitle">
            Manage your earnings and payouts.
          </p>

        </div>


        <div className="wallet-header-icon">

          <FiCreditCard />

        </div>

      </div>


      {/* =====================================================
          BALANCE
      ===================================================== */}

      <div className="wallet-balance-card">

        <div className="wallet-balance-header">

          <div>

            <p className="wallet-balance-label">
              Available Balance
            </p>

            <h2 className="wallet-balance">
              ₹{formattedBalance}
            </h2>

          </div>


          <FiCreditCard
            className="wallet-icon"
          />

        </div>


        <div className="wallet-balance-footer">

          <span>
            Available for withdrawal
          </span>

          <span className="wallet-active-status">

            <span className="wallet-status-dot"></span>

            Active

          </span>

        </div>

      </div>


      {/* =====================================================
          TRANSACTIONS
      ===================================================== */}

      <div
        id="wallet-transactions"
        className="wallet-transactions"
      >

        <div className="wallet-section-heading">

          <div>

            <h3>
              Recent Transactions
            </h3>

            <p>
              Your latest wallet activity
            </p>

          </div>

          <FiClock />

        </div>


        {transactions.map((item) => (

          <div
            key={item.id}
            className="wallet-transaction"
          >

            {/* LEFT */}

            <div className="transaction-left">

              <div
                className={`transaction-icon ${item.type}`}
              >

                {item.type === "income" ? (
                  <FiArrowUpRight />
                ) : (
                  <FiDownload />
                )}

              </div>


              <div>

                <h3 className="transaction-title">
                  {item.title}
                </h3>

                <p className="transaction-date">
                  {item.date}
                </p>

              </div>

            </div>


            {/* RIGHT */}

            <div className="transaction-right">

              <span
                className={`transaction-amount ${item.type}`}
              >
                {item.amount}
              </span>

              <span className="transaction-status">

                <FiCheckCircle />

                {item.status}

              </span>

            </div>

          </div>

        ))}

      </div>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="wallet-actions">

        <button
          type="button"
          className="withdraw-btn"
          onClick={handleWithdraw}
        >

          <FiDownload />

          <span>
            Withdraw
          </span>

        </button>


        <button
  type="button"
  className="viewall-btn"
  onClick={handleViewAll}
>
  <span>View All</span>
  <FiArrowUpRight />
</button>

      </div>

    </motion.div>
  );
};


export default WalletCard;