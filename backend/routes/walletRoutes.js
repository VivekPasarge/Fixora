
const express = require("express");
const router = express.Router();

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getWallet,
  getWalletTransactions,
  requestWithdrawal,
  getEarningsOverview,
} = require("../controllers/walletController");

router.use(protect);
router.use(authorizeRoles("technician"));

router.get("/", getWallet);
router.get("/transactions", getWalletTransactions);
router.get("/earnings", getEarningsOverview);
router.post("/withdraw", requestWithdrawal);

module.exports = router;
