const User = require("../models/User");
const Partner = require("../models/Partner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../config/mailer");
const googleClient = require("../config/googleAuth");

// ==========================================================
// TEST API
// ==========================================================

const testAuth = (req, res) => {
  return res.status(200).json({
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reject blocked accounts after verifying the password.
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact the administrator.",
      });
    }

    // Verify technician approval after password verification.
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
// FORGOT PASSWORD - SEND OTP
// ==========================================================

const forgotPassword = async (req, res) => {
  const responseMessage =
    "If an account exists with this email, a verification OTP has been sent.";

  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address",
      });
    }

    // Find only an already registered Fixora email.
    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: responseMessage,
      });
    }

    // Generate a secure six-digit OTP.
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store only the hashed OTP.
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.resetPasswordOTPVerified = false;
    user.resetPasswordOTPVerifiedUntil = undefined;
    user.resetPasswordOTPAttempts = 0;

    await user.save({ validateBeforeSave: false });

    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Your Fixora Password Reset OTP",

        text:
          `Your Fixora password reset OTP is ${otp}.\n\n` +
          "This OTP expires in 5 minutes.\n" +
          "You have a maximum of 5 verification attempts.\n\n" +
          "If you did not request this, ignore this email.",

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:20px;
            border:1px solid #eee;
            border-radius:10px;
          ">
            <h2 style="color:#2563eb">Fixora Password Reset</h2>

            <p>You requested to reset your Fixora password.</p>

            <p>Your verification OTP is:</p>

            <h1 style="
              letter-spacing:8px;
              color:#2563eb;
              text-align:center;
              padding:15px;
            ">${otp}</h1>

            <p>This OTP expires in <strong>5 minutes</strong>.</p>

            <p>You have a maximum of 5 verification attempts.</p>

            <p>If you did not request this, ignore this email.</p>

            <p>Regards,<br>Fixora Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("RESET OTP EMAIL ERROR:", emailError.message);

      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      user.resetPasswordOTPVerified = false;
      user.resetPasswordOTPVerifiedUntil = undefined;
      user.resetPasswordOTPAttempts = 0;

      await user.save({ validateBeforeSave: false });

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP. Please try again later.",
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
// VERIFY RESET OTP
// ==========================================================

const verifyResetOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP " +
      "+resetPasswordOTPExpires " +
      "+resetPasswordOTPVerified " +
      "+resetPasswordOTPVerifiedUntil " +
      "+resetPasswordOTPAttempts"
    );

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Request a new OTP.",
      });
    }

    if (
      !user.resetPasswordOTPExpires ||
      user.resetPasswordOTPExpires.getTime() <= Date.now()
    ) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      user.resetPasswordOTPVerified = false;
      user.resetPasswordOTPVerifiedUntil = undefined;
      user.resetPasswordOTPAttempts = 0;

      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if ((user.resetPasswordOTPAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (hashedOTP !== user.resetPasswordOTP) {
      user.resetPasswordOTPAttempts =
        (user.resetPasswordOTPAttempts || 0) + 1;

      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
        attemptsRemaining: Math.max(
          0,
          5 - user.resetPasswordOTPAttempts
        ),
      });
    }

    // Mark OTP as verified.
    user.resetPasswordOTPVerified = true;

    // Allow password reset for 10 minutes.
    user.resetPasswordOTPVerifiedUntil = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // OTP cannot be reused.
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.resetPasswordOTPAttempts = 0;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

// ==========================================================
// RESET PASSWORD
// ==========================================================

const resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordOTPVerified " +
      "+resetPasswordOTPVerifiedUntil"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset request",
      });
    }

    if (
      user.resetPasswordOTPVerified !== true ||
      !user.resetPasswordOTPVerifiedUntil ||
      user.resetPasswordOTPVerifiedUntil.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please verify your OTP before resetting your password",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    // Clear reset data after successful password reset.
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.resetPasswordOTPVerified = false;
    user.resetPasswordOTPVerifiedUntil = undefined;
    user.resetPasswordOTPAttempts = 0;

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
// GOOGLE LOGIN / REGISTER
// ==========================================================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      console.error("Google authentication configuration missing:", {
        googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        jwtSecret: Boolean(process.env.JWT_SECRET),
      });

      return res.status(500).json({
        success: false,
        message: "Google login is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const email = payload.email.trim().toLowerCase();

    let user = await User.findOne({ email });
    let isNewUser = false;

    // Reject an existing blocked account before linking or creating a session.
    if (user && user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact the administrator.",
      });
    }

    if (user && user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message:
          "Google login is available for customer accounts only. Please use your regular login.",
      });
    }

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        phone: "",
        role: "customer",
      });

      isNewUser = true;
      console.log("New Google customer account created");
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();

      console.log("Google account linked to existing customer");
    } else if (user.googleId !== payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed",
      });
    }

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

    return res.status(200).json({
      success: true,
      isNewUser,
      message: isNewUser
        ? "Account created successfully! Welcome to Fixora."
        : "Welcome back to Fixora!",
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
    console.error("GOOGLE LOGIN ERROR:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please try signing in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Google authentication failed. Please try again.",
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
  verifyResetOTP,
  resetPassword,
  profile,
  updateProfile,
  completeProfile,
  googleLogin,
};