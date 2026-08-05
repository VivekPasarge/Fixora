const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Home Repair",
        "Cleaning",
        "Electrical",
        "Plumbing",
        "Painting",
        "Appliance",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 4.8,
    },

    reviews: {
      type: Number,
      default: 120,
    },

    duration: {
      type: String,
      default: "30-60 min",
    },

    arrivalTime: {
      type: String,
      default: "Within 45 mins",
    },

    includedServices: [
      {
        type: String,
      },
    ],

    whyChoose: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],

    technician: {
      experience: {
        type: String,
        default: "5+ Years",
      },

      rating: {
        type: Number,
        default: 4.8,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);