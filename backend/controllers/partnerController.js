const Partner = require("../models/Partner");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ===============================
// Register Partner
// ===============================

const registerPartner = async (req, res) => {
  console.log("========== PARTNER API ==========");
  console.log(req.body);

  try {
    const {
      fullName,
      email,
      phone,
      password,
      dob,
      profession,
      experience,
      workingCity,
      languages,
      accountHolder,
      accountNumber,
      ifsc,
      upiId,
      profilePhoto,
      aadhaarFront,
      aadhaarBack,
      panCard,
    } = req.body;

    // Validation
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !dob ||
      !profession ||
      !experience ||
      !workingCity ||
      !languages ||
      !accountHolder ||
      !accountNumber ||
      !ifsc
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check existing application
    const existingPartner = await Partner.findOne({ email });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "Partner application already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Partner
    const partner = await Partner.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      dob,
      profession,
      experience,
      workingCity,
      languages,
      accountHolder,
      accountNumber,
      ifsc,
      upiId,
      profilePhoto,
      aadhaarFront,
      aadhaarBack,
      panCard,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Partner application submitted successfully",
      partner,
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
// Get All Partners
// ===============================

const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: partners.length,
      partners,
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
// Get Single Partner
// ===============================

const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({
      success: true,
      partner,
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
// Update Partner Status
// ===============================

const updatePartnerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    // Create technician account only once
    if (status === "Approved" && !partner.user) {

      const existingUser = await User.findOne({
        email: partner.email,
      });

      if (!existingUser) {

        const technician = await User.create({
          name: partner.fullName,
          email: partner.email,
          phone: partner.phone,
          password: partner.password,
          role: "technician",
        });

        partner.user = technician._id;

      } else {

        partner.user = existingUser._id;

      }
    }

    partner.status = status;

    await partner.save();

    res.status(200).json({
      success: true,
      message: `Partner ${status} successfully`,
      partner,
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
  registerPartner,
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
};