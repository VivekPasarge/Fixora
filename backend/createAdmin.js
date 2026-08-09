require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "admin@fixora.com",
    });

    if (existingAdmin) {

      console.log("Admin already exists");

      await mongoose.disconnect();

      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({

      name: "Fixora Admin",

      email: "admin@fixora.com",

      password: hashedPassword,

      phone: "",

      role: "admin",

      profession: "",

      experience: "",

      address: "",

      workingCity: "",

      workingRadius: 10,

      profilePhoto: "",

      aadhaarNumber: "",

      panNumber: "",

      about: "",

      skills: "",

      languages: "",

      gender: "",

      serviceArea: "",

      availability: "Available",

      profileCompleted: true,

    });

    console.log("================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("================================");
    console.log("Email:", admin.email);
    console.log("Password: Admin@123");
    console.log("Role:", admin.role);
    console.log("================================");

    await mongoose.disconnect();

  } catch (error) {

    console.error(
      "Failed to create admin:",
      error.message
    );

    process.exit(1);

  }
};

createAdmin();