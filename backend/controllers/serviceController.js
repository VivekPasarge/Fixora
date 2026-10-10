const Service = require("../models/Service");
const Partner = require("../models/Partner");

// =========================================================
// Create Service
// =========================================================

const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      image,
      duration,
      arrivalTime,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      name,
      description,
      category,
      price,
      image,
      duration,
      arrivalTime,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Get All Services
// =========================================================

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get All Services Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Get Single Service
// =========================================================

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Get Approved Technicians For Service
// =========================================================

const getTechniciansForService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // -----------------------------------------------------
    // Match Service Category With Partner Profession
    // -----------------------------------------------------

    const professionMap = {
      Electrical: ["Electrician"],

      Plumbing: ["Plumber"],

      Painting: ["Painter"],

      Cleaning: ["Cleaning"],

      Appliance: ["Appliance Repair", "AC Repair"],

      "Home Repair": ["Carpenter"],
    };

    const professions =
      professionMap[service.category] || [];

    if (professions.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        technicians: [],
      });
    }

    // -----------------------------------------------------
    // Get ONLY Approved Partners
    // -----------------------------------------------------

    const partners = await Partner.find({
      status: "Approved",

      profession: {
        $in: professions,
      },

      user: {
        $ne: null,
      },
    })
      .populate(
        "user",
        "name email phone profession experience workingCity workingRadius profilePhoto availability"
      )
      .sort({
        createdAt: -1,
      });

    // -----------------------------------------------------
    // Convert Partner Data Into Customer-Friendly Data
    // -----------------------------------------------------

    const technicians = partners
      .filter((partner) => partner.user)
      .map((partner) => ({
        _id: partner.user._id,

        partnerId: partner._id,

        name: partner.user.name,

        email: partner.user.email,

        phone: partner.user.phone,

        profession:
          partner.user.profession ||
          partner.profession,

        experience:
          partner.user.experience ||
          partner.experience,

        workingCity:
          partner.user.workingCity ||
          partner.workingCity,

        workingRadius:
          partner.user.workingRadius || 10,

        profilePhoto:
          partner.user.profilePhoto ||
          partner.profilePhoto ||
          "",

        availability:
          partner.user.availability ||
          "Available",

        partnerStatus: partner.status,
      }));

    return res.status(200).json({
      success: true,
      count: technicians.length,
      technicians,
    });
  } catch (error) {
    console.error(
      "Get Technicians For Service Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Update Service
// =========================================================

const updateService = async (req, res) => {
  try {
    const service =
      await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Toggle Service Availability
// =========================================================

const toggleServiceStatus = async (
  req,
  res
) => {
  try {
    const service =
      await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isAvailable =
      !service.isAvailable;

    await service.save();

    res.status(200).json({
      success: true,
      message: service.isAvailable
        ? "Service activated successfully"
        : "Service deactivated successfully",
      service,
    });
  } catch (error) {
    console.error(
      "Toggle Service Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Delete Service
// =========================================================

const deleteService = async (req, res) => {
  try {
    const service =
      await Service.findByIdAndDelete(
        req.params.id
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Service Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// Exports
// =========================================================

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getTechniciansForService,
  updateService,
  toggleServiceStatus,
  deleteService,
};