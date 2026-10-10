const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    type: {
      type: String,
      enum: ["EARNING", "WITHDRAWAL", "REFUND", "ADJUSTMENT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    direction: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "REJECTED", "FAILED"],
      default: "COMPLETED",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({
  technician: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
