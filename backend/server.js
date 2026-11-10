require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Booking = require("./models/Booking");
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminTechnicianRoutes = require("./routes/adminTechnicianRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const adminWalletRoutes = require("./routes/adminWalletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();

// ==========================================================
// DATABASE
// ==========================================================

connectDB();

// ==========================================================
// CORS
// ==========================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://fixora-4cdg.vercel.app",
  "https://fixora-3u5c.vercel.app",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  return /^https:\/\/fixora-[a-z0-9-]+\.vercel\.app$/i.test(
    origin
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ==========================================================
// BODY PARSING
// ==========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Fixora Backend");
});

// ==========================================================
// API ROUTES
// ==========================================================

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/partners", partnerRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/technicians", adminTechnicianRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/wallet", adminWalletRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);

// ==========================================================
// HTTP SERVER
// ==========================================================

const server = http.createServer(app);

// ==========================================================
// SOCKET.IO
// ==========================================================

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.log("Socket.IO CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ==========================================================
// SOCKET.IO JWT AUTHENTICATION
// ==========================================================

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");
      return next(new Error("Server authentication configuration error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new Error("Invalid authentication token"));
    }

    const user = await User.findById(userId).select(
      "_id name email role isAvailable availability"
    );

    if (!user) {
      return next(new Error("User account not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Invalid or expired authentication token"));
  }
});

// ==========================================================
// HELPER: CHECK BOOKING ACCESS
// ==========================================================

const canAccessBooking = (booking, user) => {
  if (!booking || !user) return false;

  const userId = user._id.toString();

  const customerId = booking.customer?.toString();
  const technicianId = booking.technician?.toString();

  return (
    user.role === "admin" ||
    customerId === userId ||
    technicianId === userId
  );
};

// ==========================================================
// HELPER: VALIDATE GPS COORDINATES
// ==========================================================

const isValidCoordinates = (latitude, longitude) => {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// ==========================================================
// SOCKET.IO EVENTS
// ==========================================================

io.on("connection", (socket) => {
  const user = socket.user;
  const userId = user._id.toString();

  console.log(
    `Authenticated socket connected: ${user.name} (${user.role})`
  );

  // Private room for every authenticated user.
  socket.join(`user:${userId}`);

  // --------------------------------------------------------
  // UPDATE TECHNICIAN'S CURRENT LOCATION
  // Works before a booking is assigned.
  // --------------------------------------------------------

  socket.on("update-my-location", async (data) => {
    try {
      if (user.role !== "technician") {
        socket.emit("location-update-error", {
          message: "Only technicians can update their location",
        });
        return;
      }

      if (
        !data ||
        data.latitude === undefined ||
        data.longitude === undefined
      ) {
        socket.emit("location-update-error", {
          message: "Latitude and longitude are required",
        });
        return;
      }

      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);

      if (!isValidCoordinates(latitude, longitude)) {
        socket.emit("location-update-error", {
          message: "Invalid GPS coordinates",
        });
        return;
      }

      // Refresh technician status from the database.
      const technician = await User.findById(userId).select(
        "isAvailable availability"
      );

      if (!technician) {
        return;
      }

      const isOnline =
        technician.isAvailable === true ||
        technician.availability === "Available";

      if (!isOnline) {
        socket.emit("location-update-error", {
          message: "Go online before updating your location",
        });
        return;
      }

      const updatedAt = new Date();

      await User.findByIdAndUpdate(userId, {
        $set: {
          technicianLocation: {
            latitude,
            longitude,
            updatedAt,
          },
        },
      });

      socket.emit("location-updated", {
        success: true,
        latitude,
        longitude,
        updatedAt,
      });

    } catch (error) {
      console.error(
        "Update Technician Location Error:",
        error.message
      );

      socket.emit("location-update-error", {
        message: "Failed to update technician location",
      });
    }
  });

  // --------------------------------------------------------
  // JOIN BOOKING ROOM
  // --------------------------------------------------------

  socket.on("join-booking", async (bookingId) => {
    try {
      if (
        !bookingId ||
        !mongoose.Types.ObjectId.isValid(bookingId)
      ) {
        socket.emit("tracking-error", {
          message: "Invalid booking ID",
        });
        return;
      }

      const booking = await Booking.findById(bookingId).select(
        "customer technician technicianLocation trackingActive status"
      );

      if (!booking) {
        socket.emit("tracking-error", {
          message: "Booking not found",
        });
        return;
      }

      if (!canAccessBooking(booking, user)) {
        socket.emit("tracking-error", {
          message: "You are not authorized to view this booking",
        });
        return;
      }

      socket.join(bookingId);

      console.log(
        `${user.name} joined booking room: ${bookingId}`
      );

      const location = booking.technicianLocation;

      if (
        location &&
        location.latitude != null &&
        location.longitude != null
      ) {
        socket.emit("receive-location", {
          bookingId,
          latitude: location.latitude,
          longitude: location.longitude,
          updatedAt: location.updatedAt,
          trackingActive: booking.trackingActive,
          status: booking.status,
        });
      }
    } catch (error) {
      console.error("Join Booking Error:", error.message);
    }
  });

    // --------------------------------------------------------
  // SEND TECHNICIAN LOCATION FOR AN ACTIVE BOOKING
  // --------------------------------------------------------

  socket.on("send-location", async (data) => {
    try {
      if (user.role !== "technician") {
        socket.emit("tracking-error", {
          message: "Only technicians can send tracking locations",
        });
        return;
      }

      if (
        !data ||
        !data.bookingId ||
        data.latitude === undefined ||
        data.longitude === undefined
      ) {
        return;
      }

      const { bookingId } = data;

      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return;
      }

      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);

      if (!isValidCoordinates(latitude, longitude)) {
        return;
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return;
      }

      // Verify that this technician owns the booking.
      if (booking.technician?.toString() !== userId) {
        socket.emit("tracking-error", {
          message: "You are not assigned to this booking",
        });
        return;
      }

      // Only allow tracking for active bookings.
      const allowedStatuses = [
        "Accepted",
        "On The Way",
        "In Progress",
      ];

      if (!allowedStatuses.includes(booking.status)) {
        return;
      }

      const updatedAt = new Date();

      // Save location in the booking.
      booking.technicianLocation = {
        latitude,
        longitude,
        updatedAt,
      };

      booking.trackingActive = true;

      await booking.save();

      // Also save the technician's latest location in User.
      await User.findByIdAndUpdate(userId, {
        $set: {
          technicianLocation: {
            latitude,
            longitude,
            updatedAt,
          },
        },
      });

      const locationData = {
        bookingId,
        latitude,
        longitude,
        updatedAt,
        trackingActive: true,
        status: booking.status,
      };

      // Broadcast only to authorized booking-room members.
      io.to(bookingId).emit("receive-location", locationData);

    } catch (error) {
      console.error("Send Location Error:", error.message);
    }
  });

  // --------------------------------------------------------
  // STOP TRACKING
  // --------------------------------------------------------

  socket.on("stop-location", async (bookingId) => {
    try {
      if (user.role !== "technician") {
        return;
      }

      if (
        !bookingId ||
        !mongoose.Types.ObjectId.isValid(bookingId)
      ) {
        return;
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) return;

      if (booking.technician?.toString() !== userId) {
        return;
      }

      booking.trackingActive = false;

      await booking.save();

      io.to(bookingId).emit("tracking-stopped", {
        bookingId,
      });

      console.log("Tracking stopped:", bookingId);

    } catch (error) {
      console.error("Stop Tracking Error:", error.message);
    }
  });

  // --------------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------------

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${user.name}, Reason: ${reason}`
    );
  });
});

// ==========================================================
// START SERVER
// ==========================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});