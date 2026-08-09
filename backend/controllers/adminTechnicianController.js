const User = require("../models/User");
const Booking = require("../models/Booking");

// ==========================================
// Get All Technicians
// ==========================================

const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "technician",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: technicians.length,
      technicians,
    });

  } catch (error) {
    console.error(
      "GET TECHNICIANS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technicians",
      error: error.message,
    });
  }
};


// ==========================================
// Get Single Technician
// ==========================================

const getTechnicianById = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "technician",
    }).select("-password");

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    return res.status(200).json({
      success: true,
      technician,
    });

  } catch (error) {
    console.error(
      "GET TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician",
      error: error.message,
    });
  }
};


// ==========================================
// Get Technician Booking History
// ==========================================

const getTechnicianBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      technician: req.params.id,
    })
      .populate(
        "service",
        "name"
      )
      .populate(
        "customer",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(
      "TECHNICIAN BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch technician bookings",
      error: error.message,
    });
  }
};


// ==========================================
// Delete Technician
// ==========================================

const deleteTechnician = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "technician",
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    await User.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Technician deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete technician",
      error: error.message,
    });
  }
};


module.exports = {
  getAllTechnicians,
  getTechnicianById,
  getTechnicianBookings,
  deleteTechnician,
};