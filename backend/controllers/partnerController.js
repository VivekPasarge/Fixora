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

// const updatePartnerStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const partner = await Partner.findById(req.params.id);

//     if (!partner) {
//       return res.status(404).json({
//         success: false,
//         message: "Partner not found",
//       });
//     }

//     // Create technician account only once
//     if (status === "Approved" && !partner.user) {

//       const existingUser = await User.findOne({
//         email: partner.email,
//       });

//       if (!existingUser) {

//         const technician = await User.create({
//           name: partner.fullName,
//           email: partner.email,
//           phone: partner.phone,
//           password: partner.password,
//           role: "technician",
//         });

//         partner.user = technician._id;

//       } else {

//         partner.user = existingUser._id;

//       }
//     }

//     partner.status = status;

//     await partner.save();

//     res.status(200).json({
//       success: true,
//       message: `Partner ${status} successfully`,
//       partner,
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const updatePartnerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    console.log("========== UPDATE PARTNER STATUS ==========");
    console.log("Partner ID:", req.params.id);
    console.log("Requested Status:", status);

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    console.log("Partner:", partner.fullName);
    console.log("Email:", partner.email);
    console.log("Password exists:", !!partner.password);

    // ==========================================
    // APPROVE PARTNER
    // ==========================================

    if (status === "Approved") {

      // Technician account doesn't exist
      if (!partner.user) {

        console.log("Creating technician account...");

        let technician = await User.findOne({
          email: partner.email,
        });

        // ==========================================
        // CREATE TECHNICIAN USER
        // ==========================================

        if (!technician) {

          let technicianPassword;

          // Existing partner has password
          if (partner.password) {

            technicianPassword = partner.password;

          } else {

            console.log(
              "Partner has no password."
            );

            console.log(
              "Generating temporary password..."
            );

            technicianPassword = await bcrypt.hash(
              "Fixora@123",
              10
            );

            // IMPORTANT:
            // Save the generated password
            // into the Partner document too.
            partner.password = technicianPassword;
          }

          technician = await User.create({
            name: partner.fullName,

            email: partner.email,

            phone: partner.phone,

            password: technicianPassword,

            role: "technician",

            profession: partner.profession || "",

            experience: partner.experience || "",

            workingCity: partner.workingCity || "",

            languages: partner.languages || "",

            profilePhoto: partner.profilePhoto || "",

            availability: "Available",

            profileCompleted: false,
          });

          console.log(
            "Technician created:",
            technician._id
          );

        } else {

          console.log(
            "Existing User found:",
            technician._id
          );

          if (technician.role !== "technician") {
            return res.status(400).json({
              success: false,
              message:
                "A user already exists with this email and is not a technician.",
            });
          }

          // If old partner has no password,
          // copy the existing user's password
          // into the Partner document.
          if (!partner.password && technician.password) {
            partner.password = technician.password;
          }
        }

        // Connect Partner → User
        partner.user = technician._id;
      }

      // ==========================================
      // SAFETY CHECK
      // ==========================================

      // Partner password is required by schema.
      // Make absolutely sure it exists before save.
      if (!partner.password) {

        partner.password = await bcrypt.hash(
          "Fixora@123",
          10
        );

      }
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    partner.status = status;

    await partner.save();

    console.log(
      "Partner saved successfully."
    );

    console.log(
      "Status:",
      partner.status
    );

    console.log(
      "User:",
      partner.user
    );

    return res.status(200).json({
      success: true,
      message: `Partner ${status} successfully`,
      partner,
    });

  } catch (error) {

    console.error(
      "========== UPDATE PARTNER STATUS ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
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