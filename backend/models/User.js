
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic user information
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

    // Password is required for local accounts.
    // Google-only accounts can use an empty password.
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },

    // Google authentication
    googleId: {
      type: String,
      default: undefined,
      sparse: true,
    },

    // Password reset
    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
      select: false,
    },

    // Contact information
    phone: {
      type: String,
      default: "",
    },

    // User role
    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },

    // Professional information
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

    // Identity information
    aadhaarNumber: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      default: "",
    },

    // Profile details
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

    // Availability
    availability: {
      type: String,
      default: "Available",
    },

    // Technician profile completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
