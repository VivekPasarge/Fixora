const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================

    name: {
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

    // ==========================================
    // PASSWORD AUTHENTICATION
    // ==========================================

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },

    // ==========================================
    // GOOGLE AUTHENTICATION
    // ==========================================

    googleId: {
      type: String,
      default: undefined,
      sparse: true,
    },

    // ==========================================
    // PASSWORD RESET OTP
    // ==========================================

    resetPasswordOTP: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordOTPExpires: {
      type: Date,
      default: undefined,
      select: false,
    },

    resetPasswordOTPVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    resetPasswordOTPVerifiedUntil: {
      type: Date,
      default: undefined,
      select: false,
    },

    // ==========================================
    // CONTACT INFORMATION
    // ==========================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // USER ROLE
    // ==========================================

    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },

    // ==========================================
    // PROFESSIONAL INFORMATION
    // ==========================================

    profession: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    workingCity: {
      type: String,
      default: "",
    },

    workingRadius: {
      type: Number,
      default: 10,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    // ==========================================
    // IDENTITY INFORMATION
    // ==========================================

    aadhaarNumber: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      default: "",
    },
        // ==========================================
    // PROFILE DETAILS
    // ==========================================

    about: {
      type: String,
      default: "",
    },

    skills: {
      type: String,
      default: "",
    },

    languages: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
    },

    serviceArea: {
      type: String,
      default: "",
    },

    // ==========================================
    // TECHNICIAN AVAILABILITY
    // ==========================================

    availability: {
      type: String,
      default: "Available",
    },

    // ==========================================
    // PROFILE COMPLETION
    // ==========================================

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// CREATE USER MODEL
// ==========================================

const User = mongoose.model("User", userSchema);

module.exports = User;