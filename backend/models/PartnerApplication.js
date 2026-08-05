const mongoose = require("mongoose");

const partnerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    profession: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    workingCity: {
      type: String,
      required: true,
    },

    languages: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    aadhaarNumber: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PartnerApplication",
  partnerApplicationSchema
);