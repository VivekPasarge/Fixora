const User = require("../models/User");
const Booking = require("../models/Booking");

// ==========================================
// Admin Dashboard Statistics
// ==========================================

const getAdminDashboardStats = async (req, res) => {
  try {
    // ==========================================
    // Count Customers
    // ==========================================

    const customers = await User.countDocuments({
      role: "customer",
    });

    // ==========================================
    // Count Technicians
    // ==========================================

    const technicians = await User.countDocuments({
      role: "technician",
    });

    // ==========================================
    // Count Total Bookings
    // ==========================================

    const bookings = await Booking.countDocuments();

    // ==========================================
    // Completed Bookings
    // ==========================================

    const completedBookings =
      await Booking.countDocuments({
        status: "Completed",
      });

    // ==========================================
    // Cancelled Bookings
    // ==========================================

    const cancelledBookings =
      await Booking.countDocuments({
        status: "Cancelled",
      });

    // ==========================================
    // Pending Bookings
    // ==========================================

    const pendingBookings =
      await Booking.countDocuments({
        status: "Pending",
      });

    // ==========================================
    // Accepted Bookings
    // ==========================================

    const acceptedBookings =
      await Booking.countDocuments({
        status: "Accepted",
      });

    // ==========================================
    // In Progress Bookings
    // ==========================================

    const inProgressBookings =
      await Booking.countDocuments({
        status: "In Progress",
      });

    // ==========================================
    // Revenue
    // ==========================================

    const revenueResult =
      await Booking.aggregate([
        {
          $match: {
            status: "Completed",
            paymentStatus: "Paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$price",
            },
          },
        },
      ]);

    const revenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,

      stats: {
        customers,
        technicians,
        bookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        acceptedBookings,
        inProgressBookings,
        revenue,
      },
    });

  } catch (error) {

    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin dashboard statistics",
      error: error.message,
    });
  }
};


// ==========================================
// Export
// ==========================================

module.exports = {
  getAdminDashboardStats,
};