
const User = require("../models/User");
const Partner = require("../models/Partner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../config/mailer");

// ==========================================================
// TEST API
// ==========================================================

const testAuth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth Route Working",
  });
};

// ==========================================================
// REGISTER CUSTOMER
// ==========================================================

const register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // Public registration must not create admin or technician accounts.
    if (role && role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can register here",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================================
// LOGIN
// ==========================================================

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password, loginType } = req.body;

    if (!email || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: "Email, password and login type are required",
      });
    }

    if (!["customer", "technician", "admin"].includes(loginType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid login type",
      });
    }

    // User.password has select:false in the updated User model.
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.role !== loginType) {
      return res.status(401).json({
        success: false,
        message: "This account cannot use the selected login option",
      });
    }

    // Verify technician approval.
    if (loginType === "technician") {
      const partner = await Partner.findOne({ email: user.email });

      if (!partner) {
        return res.status(404).json({
          success: false,
          message: "Partner application not found",
        });
      }

      if (partner.status === "Pending") {
        return res.status(403).json({
          success: false,
          message: "Your application is pending admin approval",
        });
      }

      if (partner.status === "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Your application has been rejected",
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================================
// FORGOT PASSWORD
// ==========================================================

const forgotPassword = async (req, res) => {
  const responseMessage =
    "If an account exists for this email, a password reset link will be sent.";

  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address",
      });
    }

    const user = await User.findOne({ email });

    // Return a generic response to avoid revealing registered emails.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: responseMessage,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const resetUrl =
      `${frontendUrl.replace(/\/$/, "")}/reset-password` +
      `?token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset your Fixora password",
        text:
          "You requested a Fixora password reset.\n\n" +
          `Open this link within 15 minutes:\n${resetUrl}\n\n` +
          "If you did not request this, ignore this email.",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2>Reset your Fixora password</h2>
            <p>Use the button below to choose a new password.</p>
            <p>This link expires in 15 minutes.</p>
            <a href="${resetUrl}"
              style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">
              Reset Password
            </a>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("RESET EMAIL ERROR:", emailError.message);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(503).json({
        success: false,
        message: "Unable to send the reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request",
    });
  }
};

// ==========================================================
// RESET PASSWORD
// ==========================================================

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, email and new password are required",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password",
    });
  }
};

// ==========================================================
// GET PROFILE
// ==========================================================

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================================
// UPDATE PROFILE
// ==========================================================

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
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

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

// ==========================================================
// COMPLETE TECHNICIAN PROFILE
// ==========================================================

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

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.error("COMPLETE PROFILE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete profile",
    });
  }
};

// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  testAuth,
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
  updateProfile,
  completeProfile,
};
