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
// AUTOMATIC TECHNICIAN MATCHING WORKER
// ==========================================================

// Each technician gets exactly 30 seconds to respond.
// This worker checks persisted deadlines every 2 seconds.

const MATCHING_WORKER_INTERVAL = 2000;
const TECHNICIAN_RESPONSE_TIME = 30 * 1000;

let matchingWorkerRunning = false;

// Assign the next technician from the saved matching queue.
const assignNextTechnician = async (bookingId, expectedIndex) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const booking = await Booking.findOne({
      _id: bookingId,
      status: "Pending",
      technician: null,
      currentOfferTechnician: null,
      matchingCurrentIndex: expectedIndex,
    }).select(
      "matchingQueue matchingCurrentIndex declinedTechnicians"
    );

    if (!booking) return;

    const queue = Array.isArray(booking.matchingQueue)
      ? booking.matchingQueue
      : [];

    const declinedIds = new Set(
      (booking.declinedTechnicians || []).map((id) =>
        id.toString()
      )
    );

    let nextIndex = expectedIndex;

    while (nextIndex < queue.length) {
      const candidate = queue[nextIndex]?.technician;

      if (
        candidate &&
        !declinedIds.has(candidate.toString())
      ) {
        break;
      }

      nextIndex += 1;
    }

    const now = new Date();

    // No more eligible technicians.
    if (nextIndex >= queue.length) {
      await Booking.updateOne(
        {
          _id: bookingId,
          status: "Pending",
          technician: null,
          currentOfferTechnician: null,
          matchingCurrentIndex: expectedIndex,
        },
        {
          $set: {
            matchingCurrentIndex: nextIndex,
            matchingStatus: "No Technician",
            currentOfferTechnician: null,
            currentOfferExpiresAt: null,
            matchingLastUpdatedAt: now,
          },
        }
      );

      return;
    }

    const nextTechnician = queue[nextIndex].technician;

    // Atomically offer the job to exactly one technician.
    const offered = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "Pending",
        technician: null,
        currentOfferTechnician: null,
        matchingCurrentIndex: expectedIndex,
      },
      {
        $set: {
          matchingCurrentIndex: nextIndex,
          matchingStatus: "Offering",
          currentOfferTechnician: nextTechnician,
          currentOfferExpiresAt: new Date(
            now.getTime() + TECHNICIAN_RESPONSE_TIME
          ),
          matchingLastUpdatedAt: now,
        },
      },
      { new: true }
    );

    if (offered) {
      console.log(
        `Booking ${bookingId} offered to technician ${nextTechnician}`
      );
      return;
    }

    return;
  }
};

// Find expired offers and advance each booking.
const processExpiredOffers = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const now = new Date();

  const expiredBookings = await Booking.find({
    status: "Pending",
    technician: null,
    currentOfferTechnician: { $ne: null },
    currentOfferExpiresAt: { $lte: now },
  })
    .select(
      "_id matchingCurrentIndex currentOfferTechnician currentOfferExpiresAt"
    )
    .limit(100);

  for (const booking of expiredBookings) {
    const oldIndex = Number(booking.matchingCurrentIndex || 0);
    const oldTechnician = booking.currentOfferTechnician;

    // Claim this expired offer once, preventing duplicate advancement.
    const claimed = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "Pending",
        technician: null,
        matchingCurrentIndex: oldIndex,
        currentOfferTechnician: oldTechnician,
        currentOfferExpiresAt: { $lte: now },
      },
      {
        $set: {
          matchingCurrentIndex: oldIndex + 1,
          currentOfferTechnician: null,
          currentOfferExpiresAt: null,
          matchingStatus: "Searching",
          matchingLastUpdatedAt: now,
        },
      },
      { new: true }
    );

    if (!claimed) continue;

    console.log(
      `Technician offer expired for booking ${booking._id}`
    );

    await assignNextTechnician(
      booking._id,
      oldIndex + 1
    );
  }
};

// Prevent overlapping worker executions.
const runMatchingWorker = async () => {
  if (matchingWorkerRunning) return;

  matchingWorkerRunning = true;

  try {
    await processExpiredOffers();
  } catch (error) {
    console.error(
      "Technician Matching Worker Error:",
      error.message
    );
  } finally {
    matchingWorkerRunning = false;
  }
};

setInterval(runMatchingWorker, MATCHING_WORKER_INTERVAL);

// ==========================================================
// SOCKET.IO EVENTS
// ==========================================================