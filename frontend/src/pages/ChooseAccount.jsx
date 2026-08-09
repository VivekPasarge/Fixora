import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiTool,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

import Navbar from "../components/Navbar/Navbar";
import "./ChooseAccount.css";

const ChooseAccount = () => {
  return (
    <>
      <Navbar />

      <main className="choose-account-page">

        <div className="choose-account-container">

          {/* Heading */}

          <motion.div
            className="choose-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            <span className="choose-badge">
              JOIN FIXORA
            </span>

            <h1>
              Choose Your Account
            </h1>

            <p>
              Join Fixora the way that suits you best.
              Whether you need trusted home services or
              want to earn as a skilled professional,
              we've got you covered.
            </p>

          </motion.div>

          {/* Cards */}

          <div className="account-grid">

            {/* Customer */}

            <motion.div
              className="account-card"
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
            >

              <div className="account-icon customer">
                <FiUser />
              </div>

              <h2>Customer</h2>

              <p>
                Book trusted home services from
                verified professionals.
              </p>

              <ul>

                <li>
                  <FiCheckCircle />
                  Live Technician Tracking
                </li>

                <li>
                  <FiCheckCircle />
                  Secure Payments
                </li>

                <li>
                  <FiCheckCircle />
                  Verified Professionals
                </li>

              </ul>

              <Link
                to="/register"
                className="account-btn"
              >
                Continue as Customer

                <FiArrowRight />

              </Link>

            </motion.div>

            {/* Partner */}

            <motion.div
              className="account-card"
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
            >

              <div className="account-icon partner">
                <FiTool />
              </div>

              <h2>Partner</h2>

              <p>
                Earn by offering your professional
                services through Fixora.
              </p>

              <ul>

                <li>
                  <FiCheckCircle />
                  Flexible Working Hours
                </li>

                <li>
                  <FiCheckCircle />
                  Weekly Earnings
                </li>

                <li>
                  <FiCheckCircle />
                  Grow Your Business
                </li>

              </ul>

              <Link
                to="/become-partner"
                className="account-btn partner-btn"
              >
                Become a Partner

                <FiArrowRight />

              </Link>

            </motion.div>

          </div>

        </div>

      </main>

    </>
  );
};

export default ChooseAccount;