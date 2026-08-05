const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    // Personal Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
  type: String,
  required: true,
},

    dob: {
      type: Date,
      required: true,
    },

    // Professional Details
    profession: {
      type: String,
      required: true,
      enum: [
        "Electrician",
        "Plumber",
        "Carpenter",
        "Painter",
        "AC Repair",
        "Cleaning",
        "Appliance Repair",
      ],
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
      required: true,
    },

    // Documents
    profilePhoto: {
      type: String,
      default: "",
    },

    aadhaarFront: {
      type: String,
      default: "",
    },

    aadhaarBack: {
      type: String,
      default: "",
    },

    panCard: {
      type: String,
      default: "",
    },

    // Bank Details
    accountHolder: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
    },

    ifsc: {
      type: String,
      required: true,
    },

    upiId: {
      type: String,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Partner", partnerSchema);