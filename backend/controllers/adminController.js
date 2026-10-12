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

    // ------------------------------------------------------
    // VERIFIED PAYMENT REVENUE
    // ------------------------------------------------------

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
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboardStats,
};