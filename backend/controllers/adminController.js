
const mongoose = require("mongoose");
const User = require("../models/User");
const Booking = require("../models/Booking");

// ==========================================================
// ADMIN DASHBOARD STATISTICS
// ==========================================================

const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      customers,
      technicians,
      bookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      acceptedBookings,
      onTheWayBookings,
      inProgressBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "technician" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Completed" }),
      Booking.countDocuments({ status: "Cancelled" }),
      Booking.countDocuments({ status: "Pending" }),
      Booking.countDocuments({ status: "Accepted" }),
      Booking.countDocuments({ status: "On The Way" }),
      Booking.countDocuments({ status: "In Progress" }),
    ]);

    // VERIFIED PAYMENT REVENUE

    const revenueResult = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" },
          $or: [
            {
              paymentMethod: { $in: ["UPI", "Card"] },
              razorpayPaymentId: {
                $exists: true,
                $nin: ["", null],
              },
            },
            {
              paymentMethod: "Cash on Service",
              cashReceivedAt: { $type: "date" },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,

          revenue: {
            $sum: {
              $cond: [
                { $isNumber: "$price" },
                "$price",
                0,
              ],
            },
          },

          onlineRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ["$paymentMethod", ["UPI", "Card"]] },
                    { $isNumber: "$price" },
                  ],
                },
                "$price",
                0,
              ],
            },
          },

          cashRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$paymentMethod", "Cash on Service"] },
                    { $isNumber: "$price" },
                  ],
                },
                "$price",
                0,
              ],
            },
          },

          paidBookings: { $sum: 1 },
        },
      },
    ]);

    const revenueData = revenueResult[0] || {
      revenue: 0,
      onlineRevenue: 0,
      cashRevenue: 0,
      paidBookings: 0,
    };

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
        onTheWayBookings,
        inProgressBookings,
        revenue: revenueData.revenue,
        onlineRevenue: revenueData.onlineRevenue,
        cashRevenue: revenueData.cashRevenue,
        paidBookings: revenueData.paidBookings,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics",
    });
  }
};

// ==========================================================
// GET ALL CUSTOMERS AND TECHNICIANS
// ==========================================================

const getAdminUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {
      role: { $in: ["customer", "technician"] },
    };

    if (role) {
      if (!["customer", "technician"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      filter.role = role;
    }

    const users = await User.find(filter)
      .select(
        "_id name email phone role isActive profileCompleted createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==========================================================
// BLOCK / UNBLOCK USER
// ==========================================================

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Prevent admin from blocking their own account.
    if (req.user.id === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Only customer and technician accounts can be managed here.
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        role: { $in: ["customer", "technician"] },
      },
      {
        $set: { isActive },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "_id name email phone role isActive"
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Customer or technician account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account unblocked successfully"
        : "User account blocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("ADMIN UPDATE USER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user account status",
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
};
