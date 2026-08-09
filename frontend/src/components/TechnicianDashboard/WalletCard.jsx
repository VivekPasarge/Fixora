import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiDownload,
  FiArrowUpRight,
} from "react-icons/fi";

import "./WalletCard.css";

const transactions = [
  {
    id: 1,
    title: "Service Payment",
    date: "Today • 10:30 AM",
    amount: "+ ₹850",
    color: "income",
  },
  {
    id: 2,
    title: "Weekly Payout",
    date: "Yesterday",
    amount: "+ ₹5,200",
    color: "income",
  },
  {
    id: 3,
    title: "Platform Fee",
    date: "Yesterday",
    amount: "- ₹350",
    color: "expense",
  },
];

const WalletCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="wallet-card"
    >
      <h2 className="wallet-title">
        Wallet
      </h2>

      <p className="wallet-subtitle">
        Manage your earnings and payouts.
      </p>

      <div className="wallet-balance-card">

        <div className="wallet-balance-header">

          <div>

            <p className="wallet-balance-label">
              Available Balance
            </p>

            <h2 className="wallet-balance">
              ₹18,540
            </h2>

          </div>

          <FiCreditCard className="wallet-icon" />

        </div>

      </div>

      <div className="wallet-transactions">

        {transactions.map((item) => (
          <div
            key={item.id}
            className="wallet-transaction"
          >
            <div>

              <h3 className="transaction-title">
                {item.title}
              </h3>

              <p className="transaction-date">
                {item.date}
              </p>

            </div>

            <span className={`transaction-amount ${item.color}`}>
              {item.amount}
            </span>

          </div>
        ))}

      </div>

      <div className="wallet-actions">

        <button className="withdraw-btn">
          <FiDownload />
          Withdraw
        </button>

        <button className="viewall-btn">
          <FiArrowUpRight />
          View All
        </button>

      </div>

    </motion.div>
  );
};

export default WalletCard;