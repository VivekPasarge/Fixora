
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Booking = require("./models/Booking");

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
// DATABASE CONNECTION
// ==========================================================

connectDB();

// ==========================================================
// ALLOWED FRONTEND ORIGINS
// ==========================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://fixora-4cdg.vercel.app",
  "https://fixora-3u5c.vercel.app",
];

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^https:\/\/fixora-[a-z0-9-]+\.vercel\.app$/i.test(
    origin
  );
};

// ==========================================================
// CORS MIDDLEWARE
// ==========================================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==========================================================
// BODY PARSING MIDDLEWARE
// MUST BE BEFORE API ROUTES
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
// SOCKET.IO CONFIGURATION
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
// SOCKET.IO EVENTS
// ==========================================================

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // --------------------------------------------------------
  // JOIN BOOKING ROOM
  // --------------------------------------------------------

  socket.on("join-booking", async (bookingId) => {
    try {
      if (!bookingId) {
        console.log("No booking ID provided");
        return;
      }

      socket.join(bookingId);

      console.log(
        `Socket ${socket.id} joined booking room: ${bookingId}`
      );

      const room = io.sockets.adapter.rooms.get(bookingId);
      const roomSize = room ? room.size : 0;

      console.log(
        `Users in booking room ${bookingId}: ${roomSize}`
      );

      const booking = await Booking.findById(bookingId).select(
        "technicianLocation trackingActive status"
      );

      if (
        booking &&
        booking.technicianLocation &&
        booking.technicianLocation.latitude != null &&
        booking.technicianLocation.longitude != null
      ) {
        socket.emit("receive-location", {
          bookingId,
          latitude: booking.technicianLocation.latitude,
          longitude: booking.technicianLocation.longitude,
          updatedAt: booking.technicianLocation.updatedAt,
          trackingActive: booking.trackingActive,
          status: booking.status,
        });

        console.log(
          "Sent saved location to newly joined socket:",
          bookingId
        );
      } else {
        console.log("No technician location available yet.");
      }
    } catch (error) {
      console.error("Join Booking Error:", error.message);
    }
  });

  // --------------------------------------------------------
  // RECEIVE AND BROADCAST TECHNICIAN LOCATION
  // --------------------------------------------------------

  socket.on("send-location", async (data) => {
    try {
      if (
        !data ||
        !data.bookingId ||
        data.latitude === undefined ||
        data.longitude === undefined
      ) {
        console.log("Invalid location data");
        return;
      }

      const { bookingId, latitude, longitude } = data;

      const numericLatitude = Number(latitude);
      const numericLongitude = Number(longitude);

      if (
        !Number.isFinite(numericLatitude) ||
        !Number.isFinite(numericLongitude)
      ) {
        console.log("Invalid latitude or longitude");
        return;
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.log("Booking not found:", bookingId);
        return;
      }

      booking.technicianLocation = {
        latitude: numericLatitude,
        longitude: numericLongitude,
        updatedAt: new Date(),
      };

      booking.trackingActive = true;

      await booking.save();

      const locationData = {
        bookingId,
        latitude: numericLatitude,
        longitude: numericLongitude,
        updatedAt: new Date(),
        trackingActive: true,
        status: booking.status,
      };

      io.to(bookingId).emit("receive-location", locationData);

      console.log("Technician location saved:", bookingId);
    } catch (error) {
      console.error("Send Location Error:", error.message);
    }
  });

  // --------------------------------------------------------
  // STOP TRACKING
  // --------------------------------------------------------

  socket.on("stop-location", async (bookingId) => {
    try {
      if (!bookingId) {
        return;
      }

      await Booking.findByIdAndUpdate(bookingId, {
        trackingActive: false,
      });

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

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// ==========================================================
// START SERVER
// ==========================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
