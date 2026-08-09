const User = require("../models/User");
const Booking = require("../models/Booking");

// ==========================================
// Get All Customers
// ==========================================

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });

  } catch (error) {
    console.error(
      "GET CUSTOMERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};


// ==========================================
// Get Single Customer
// ==========================================

const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });

  } catch (error) {
    console.error(
      "GET CUSTOMER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};


// ==========================================
// Get Customer Booking History
// ==========================================

const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.params.id,
    })
      .populate(
        "service",
        "name"
      )
      .populate(
        "technician",
        "name phone profession"
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
      "CUSTOMER BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer bookings",
      error: error.message,
    });
  }
};


// ==========================================
// Delete Customer
// ==========================================

const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await User.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE CUSTOMER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};


module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerBookings,
  deleteCustomer,
};