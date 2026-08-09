require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminTechnicianRoutes = require("./routes/adminTechnicianRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");


connectDB();

app.use(cors());
app.use(express.json());

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to Fixora Backend");
});
app.use(
  "/api/admin/customers",
  adminCustomerRoutes
);
app.use(
  "/api/admin/technicians",
  adminTechnicianRoutes
);
app.use(
  "/api/admin/bookings",
  adminBookingRoutes
);

// =========================
// Socket.IO Setup
// =========================

// =========================
// Socket.IO Setup
// =========================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  console.log("🟢 User Connected:", socket.id);

  socket.on("join-booking", (bookingId) => {

    socket.join(bookingId);

    console.log(`📦 Joined Room: ${bookingId}`);

  });

  socket.on("send-location", (data) => {

  console.log("📍 Received From Technician:", data);

  io.to(data.bookingId).emit(
    "receive-location",
    data
  );

  console.log("📤 Sent To Customer Room:", data.bookingId);

});

  socket.on("disconnect", () => {

    console.log("🔴 User Disconnected:", socket.id);

  });

});

// =========================



// =========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});