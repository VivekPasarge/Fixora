
const mongoose = require("mongoose");
const WalletTransaction = require("../models/WalletTransaction");

// ======================================================
// GET ALL WITHDRAWALS - ADMIN
// GET /api/admin/wallet/withdrawals
// ======================================================
const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { type: "WITHDRAWAL" };

    if (status) {
      const allowedStatuses = [
        "PENDING",
        "COMPLETED",
        "REJECTED",
        "FAILED",
      ];

      const normalizedStatus = String(status).toUpperCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid withdrawal status",
        });
      }

      filter.status = normalizedStatus;
    }

    const withdrawals = await WalletTransaction.find(filter)
      .populate("technician", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error("Get All Withdrawals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal requests",
    });
  }
};

// ======================================================
// GET PENDING WITHDRAWALS - ADMIN
// GET /api/admin/wallet/withdrawals/pending
// ======================================================
const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WalletTransaction.find({
      type: "WITHDRAWAL",
      status: "PENDING",
    })
      .populate("technician", "name email phone")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error("Get Pending Withdrawals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending withdrawals",
    });
  }
};

// ======================================================
// APPROVE WITHDRAWAL REQUEST
// PUT /api/admin/wallet/withdrawals/:id/approve
//
// Approval here means marking the request approved for
// payout. It does NOT prove that money was transferred.
// ======================================================
const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal ID",
      });
    }

    // Atomically change only a pending withdrawal.
    const withdrawal = await WalletTransaction.findOneAndUpdate(
      {
        _id: id,
        type: "WITHDRAWAL",
        status: "PENDING",
      },
      {
        $set: {
          status: "COMPLETED",
          processedAt: new Date(),
          description: "Withdrawal payout marked completed by admin",
          "metadata.reviewedAt": new Date(),
          "metadata.reviewedBy": req.user._id || req.user.id,
          "metadata.reviewAction": "APPROVED",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("technician", "name email phone");

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message:
          "Pending withdrawal not found. It may already have been reviewed.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Withdrawal marked completed. Confirm the actual payout was sent.",
      withdrawal,
    });
  } catch (error) {
    console.error("Approve Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve withdrawal",
    });
  }
};

// ======================================================
// REJECT WITHDRAWAL REQUEST
// PUT /api/admin/wallet/withdrawals/:id/reject
// ======================================================
const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal ID",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for rejection",
      });
    }

    // Atomically reject only a pending withdrawal.
    const withdrawal = await WalletTransaction.findOneAndUpdate(
      {
        _id: id,
        type: "WITHDRAWAL",
        status: "PENDING",
      },
      {
        $set: {
          status: "REJECTED",
          processedAt: new Date(),
          description: "Withdrawal request rejected by admin",
          "metadata.reviewedAt": new Date(),
          "metadata.reviewedBy": req.user._id || req.user.id,
          "metadata.reviewAction": "REJECTED",
          "metadata.rejectionReason": reason,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("technician", "name email phone");

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message:
          "Pending withdrawal not found. It may already have been reviewed.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Withdrawal rejected. The reserved balance is available again.",
      withdrawal,
    });
  } catch (error) {
    console.error("Reject Withdrawal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject withdrawal",
    });
  }
};

module.exports = {
  getAllWithdrawals,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
};
