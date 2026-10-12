
const express = require("express");
const router = express.Router();

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getPendingWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} = require("../controllers/adminWalletController");

router.use(protect);
router.use(authorizeRoles("admin"));

// View withdrawal requests
router.get("/withdrawals", getAllWithdrawals);
router.get("/withdrawals/pending", getPendingWithdrawals);

// Review withdrawal requests
router.put("/withdrawals/:id/approve", approveWithdrawal);
router.put("/withdrawals/:id/reject", rejectWithdrawal);

module.exports = router;
