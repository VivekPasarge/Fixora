const User = require("../models/User");
const Partner = require("../models/Partner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// Test API
// ===============================

const testAuth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth Route Working",
  });
};

// ===============================
// Register Customer
// ===============================

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    console.log("Existing User:", existingUser);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Customer
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Login
// ===============================

const login = async (req, res) => {
  console.log("======== Login Controller ========");

  try {

    console.log("Request Body:", req.body);

    const {
      email,
      password,
      loginType,
    } = req.body;

    // Validation
    if (!email || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: "Email, Password and Login Type are required",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Customer Login
    if (
      loginType === "customer" &&
      user.role !== "customer"
    ) {
      return res.status(401).json({
        success: false,
        message: "This account is not registered as a Customer.",
      });
    }

    // Professional Login
    if (
      loginType === "technician" &&
      user.role !== "technician"
    ) {
      return res.status(401).json({
        success: false,
        message: "This account is not registered as a Professional.",
      });
    }

    // Admin Login
    if (
      loginType === "admin" &&
      user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "This account is not an Admin account.",
      });
    }

    // Partner Approval Check
    if (loginType === "technician") {

      const partner = await Partner.findOne({
        email: user.email,
      });

      if (!partner) {
        return res.status(404).json({
          success: false,
          message: "Partner application not found.",
        });
      }

      if (partner.status === "Pending") {
        return res.status(403).json({
          success: false,
          message: "Your application is pending admin approval.",
        });
      }

      if (partner.status === "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Your application has been rejected.",
        });
      }

    }

    // Compare Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileCompleted: user.profileCompleted,
    };

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: userResponse,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
// ===============================
// Get Profile
// ===============================

const profile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
// ===============================
// Update Profile
// ===============================

const updateProfile = async (req, res) => {
  try {

    const {
      name,
      phone,
      address,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ===============================
// Complete Technician Profile
// ===============================

const completeProfile = async (req, res) => {
  try {

    const {
      profession,
      experience,
      address,
      workingCity,
      workingRadius,
      profilePhoto,
      aadhaarNumber,
      panNumber,
      about,
      skills,
      languages,
      gender,
      dateOfBirth,
      serviceArea,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profession = profession;
    user.experience = experience;
    user.address = address;
    user.workingCity = workingCity;
    user.workingRadius = workingRadius;
    user.profilePhoto = profilePhoto;
    user.aadhaarNumber = aadhaarNumber;
    user.panNumber = panNumber;
    user.about = about;

    user.skills = skills;
    user.languages = languages;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.serviceArea = serviceArea;

    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  testAuth,
  register,
  login,
  profile,
   updateProfile,
  completeProfile,
};