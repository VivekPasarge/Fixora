const Booking = require("../models/Booking");

// ==========================================
// Get All Bookings
// ==========================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(
        "customer",
        "name email phone"
      )
      .populate(
        "technician",
        "name email phone profession"
      )
      .populate(
        "service",
        "name"
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
      "GET ALL BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};


// ==========================================
// Get Single Booking
// ==========================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email phone address"
      )
      .populate(
        "technician",
        "name email phone profession"
      )
      .populate(
        "service",
        "name"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "GET BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};


// ==========================================
// Update Booking Status
// ==========================================

const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      booking,
    });

  } catch (error) {
    console.error(
      "UPDATE BOOKING STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update booking status",
      error: error.message,
    });
  }
};


// ==========================================
// Delete Booking
// ==========================================

const deleteBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await Booking.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Booking deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete booking",
      error: error.message,
    });
  }
};


module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};