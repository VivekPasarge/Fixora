const mongoose = require("mongoose");
const WalletTransaction = require("../models/WalletTransaction");

const getWallet = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;

    const transactions = await WalletTransaction.find({
      technician: technicianId,
    }).sort({ createdAt: -1 });

    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "COMPLETED"
    );

    const balance = completedTransactions.reduce(
      (total, transaction) => {
        return transaction.direction === "CREDIT"
          ? total + transaction.amount
          : total - transaction.amount;
      },
      0
    );

    const pendingWithdrawals = transactions
      .filter(
        (transaction) =>
          transaction.type === "WITHDRAWAL" &&
          transaction.status === "PENDING"
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    const availableBalance = Math.max(
      0,
      balance - pendingWithdrawals
    );

    return res.status(200).json({
      success: true,
      balance: Number(balance.toFixed(2)),
      pendingWithdrawals: Number(pendingWithdrawals.toFixed(2)),
      availableBalance: Number(availableBalance.toFixed(2)),
      transactions,
    });
  } catch (error) {
    console.error("Get Wallet Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet",
    });
  }
};

const getWalletTransactions = async (req, res) => {
  try {
    const technicianId = req.user._id || req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({
        technician: technicianId,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      WalletTransaction.countDocuments({
        technician: technicianId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Wallet Transactions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet transactions",
    });
  }
};

const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const technicianId = req.user._id || req.user.id;
    const amount = Number(req.body.amount);
    const payoutDetails = req.body.payoutDetails;

    if (!Number.isFinite(amount) || amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is ₹100",
      });
    }

    if (
      !payoutDetails ||
      typeof payoutDetails !== "object" ||
      Array.isArray(payoutDetails) ||
      !Object.keys(payoutDetails).length
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid payout details are required",
      });
    }

    const safePayoutDetails = {};

    if (payoutDetails.accountHolderName) {
      safePayoutDetails.accountHolderName =
        String(payoutDetails.accountHolderName).trim();
    }

    if (payoutDetails.accountNumber) {
      safePayoutDetails.accountNumber =
        String(payoutDetails.accountNumber).trim();
    }

    if (payoutDetails.ifscCode) {
      safePayoutDetails.ifscCode =
        String(payoutDetails.ifscCode).trim().toUpperCase();
    }

    if (payoutDetails.upiId) {
      safePayoutDetails.upiId =
        String(payoutDetails.upiId).trim();
    }

    if (
      !safePayoutDetails.upiId &&
      !(
        safePayoutDetails.accountHolderName &&
        safePayoutDetails.accountNumber &&
        safePayoutDetails.ifscCode
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a UPI ID or account holder name, account number and IFSC code",
      });
    }

    if (
      safePayoutDetails.accountNumber &&
      !/^[0-9]{8,18}$/.test(safePayoutDetails.accountNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid bank account number",
      });
    }

    if (
      safePayoutDetails.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(safePayoutDetails.ifscCode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code",
      });
    }

    if (
      safePayoutDetails.upiId &&
      !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(
        safePayoutDetails.upiId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid UPI ID",
      });
    }

    await session.withTransaction(async () => {
      const transactions = await WalletTransaction.find({
        technician: technicianId,
      }).session(session);

      const completedBalance = transactions.reduce(
        (total, transaction) => {
          if (transaction.status !== "COMPLETED") {
            return total;
          }

          return transaction.direction === "CREDIT"
            ? total + transaction.amount
            : total - transaction.amount;
        },
        0
      );

      const pendingWithdrawalAmount = transactions
        .filter(
          (transaction) =>
            transaction.type === "WITHDRAWAL" &&
            transaction.status === "PENDING"
        )
        .reduce(
          (total, transaction) => total + transaction.amount,
          0
        );

      const availableBalance =
        completedBalance - pendingWithdrawalAmount;

      if (amount > availableBalance) {
        const error = new Error(
          "Insufficient available wallet balance"
        );
        error.statusCode = 400;
        throw error;
      }

      const reference =
        `withdrawal:${technicianId}:${new mongoose.Types.ObjectId()}`;

      await WalletTransaction.create(
        [
          {
            technician: technicianId,
            type: "WITHDRAWAL",
            amount,
            direction: "DEBIT",
            status: "PENDING",
            description: "Withdrawal request awaiting review",
            reference,
            metadata: {
              payoutDetails: safePayoutDetails,
            },
          },
        ],
        { session }
      );
    });

    return res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted. The funds remain reserved until the request is reviewed.",
    });
  } catch (error) {
    console.error("Request Withdrawal Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 400
          ? error.message
          : "Failed to submit withdrawal request",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getWallet,
  getWalletTransactions,
  requestWithdrawal,
};
