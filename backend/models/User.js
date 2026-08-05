const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["customer", "technician", "admin"],
      default: "customer",
    },

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

    availability: {
      type: String,
      default: "Available",
    },

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