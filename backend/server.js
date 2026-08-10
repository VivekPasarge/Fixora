// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// const connectDB = require("./config/db");
// const Booking = require("./models/Booking");

// // =========================
// // Routes
// // =========================

// const authRoutes = require("./routes/authRoutes");
// const serviceRoutes = require("./routes/serviceRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const partnerRoutes = require("./routes/partnerRoutes");
// const adminRoutes = require("./routes/adminRoutes");

// const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
// const adminTechnicianRoutes = require("./routes/adminTechnicianRoutes");
// const adminBookingRoutes = require("./routes/adminBookingRoutes");

// // =========================
// // App
// // =========================

// const app = express();

// connectDB();

// // =========================
// // Middleware
// // =========================

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());

// // =========================
// // API Routes
// // =========================

// app.use("/api/auth", authRoutes);

// app.use("/api/services", serviceRoutes);

// app.use("/api/bookings", bookingRoutes);

// app.use("/api/reviews", reviewRoutes);

// app.use("/api/partners", partnerRoutes);

// app.use("/api/admin", adminRoutes);

// app.use(
//   "/api/admin/customers",
//   adminCustomerRoutes
// );

// app.use(
//   "/api/admin/technicians",
//   adminTechnicianRoutes
// );

// app.use(
//   "/api/admin/bookings",
//   adminBookingRoutes
// );

// // =========================
// // Home Route
// // =========================

// app.get("/", (req, res) => {
//   res.send("Welcome to Fixora Backend");
// });

// // =========================
// // HTTP Server
// // =========================

// const server = http.createServer(app);

// // =========================
// // Socket.IO
// // =========================

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // =========================
// // Socket Connection
// // =========================

// io.on("connection", (socket) => {
//   console.log(
//     "🟢 User Connected:",
//     socket.id
//   );

//   // =====================================================
//   // CUSTOMER / USER JOINS BOOKING ROOM
//   // =====================================================

//   socket.on(
//     "join-booking",
//     async (bookingId) => {
//       try {
//         if (!bookingId) {
//           console.log(
//             "❌ No booking ID received"
//           );

//           return;
//         }

//         // Join Socket.IO room
//         socket.join(bookingId);

//         console.log(
//           `📦 Socket ${socket.id} joined booking room: ${bookingId}`
//         );

//         // =================================================
//         // GET LAST SAVED TECHNICIAN LOCATION
//         // =================================================

//         const booking =
//           await Booking.findById(bookingId);

//         if (!booking) {
//           console.log(
//             "❌ Booking not found:",
//             bookingId
//           );

//           return;
//         }

//         const savedLocation =
//           booking.technicianLocation;

//         if (
//           savedLocation &&
//           savedLocation.latitude !== null &&
//           savedLocation.longitude !== null
//         ) {
//           // Send previous location immediately
//           // to the customer who just refreshed.

//           socket.emit(
//             "receive-location",
//             {
//               bookingId: bookingId,

//               latitude:
//                 savedLocation.latitude,

//               longitude:
//                 savedLocation.longitude,

//               trackingActive:
//                 booking.trackingActive,

//               updatedAt:
//                 savedLocation.updatedAt,
//             }
//           );

//           console.log(
//             "📍 Sent saved technician location:",
//             {
//               bookingId,
//               latitude:
//                 savedLocation.latitude,
//               longitude:
//                 savedLocation.longitude,
//             }
//           );
//         } else {
//           console.log(
//             "⏳ No technician location saved yet."
//           );
//         }
//       } catch (error) {
//         console.error(
//           "❌ Join booking error:",
//           error
//         );
//       }
//     }
//   );

//   // =====================================================
//   // TECHNICIAN SENDS LOCATION
//   // =====================================================

//   socket.on(
//     "send-location",
//     async (data) => {
//       try {
//         console.log(
//           "📍 Location received from technician:",
//           data
//         );

//         // Validate data
//         if (
//           !data ||
//           !data.bookingId ||
//           data.latitude === undefined ||
//           data.longitude === undefined
//         ) {
//           console.log(
//             "❌ Invalid location data"
//           );

//           return;
//         }

//         // =================================================
//         // FIND BOOKING
//         // =================================================

//         const booking =
//           await Booking.findById(
//             data.bookingId
//           );

//         if (!booking) {
//           console.log(
//             "❌ Booking not found:",
//             data.bookingId
//           );

//           return;
//         }

//         // =================================================
//         // ONLY SAVE LOCATION FOR ACTIVE JOB
//         // =================================================

//         if (
//           booking.status !==
//           "In Progress"
//         ) {
//           console.log(
//             "⚠️ Booking is not In Progress."
//           );

//           return;
//         }

//         // =================================================
//         // SAVE LATEST TECHNICIAN LOCATION
//         // =================================================

//         booking.technicianLocation = {
//           latitude: Number(
//             data.latitude
//           ),

//           longitude: Number(
//             data.longitude
//           ),

//           updatedAt: new Date(),
//         };

//         booking.trackingActive = true;

//         await booking.save();

//         console.log(
//           "💾 Technician location saved to MongoDB."
//         );

//         // =================================================
//         // SEND LOCATION TO CUSTOMER
//         // =================================================

//         io.to(data.bookingId).emit(
//           "receive-location",
//           {
//             bookingId:
//               data.bookingId,

//             latitude:
//               Number(data.latitude),

//             longitude:
//               Number(data.longitude),

//             trackingActive: true,

//             updatedAt: new Date(),
//           }
//         );

//         console.log(
//           "📤 Location sent to booking room:",
//           data.bookingId
//         );
//       } catch (error) {
//         console.error(
//           "❌ Location update error:",
//           error
//         );
//       }
//     }
//   );

//   // =====================================================
//   // DISCONNECT
//   // =====================================================

//   socket.on("disconnect", () => {
//     console.log(
//       "🔴 User Disconnected:",
//       socket.id
//     );
//   });
// });

// // =========================
// // Server
// // =========================

// const PORT =
//   process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(
//     `🚀 Server running on port ${PORT}`
//   );
// });



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

const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminTechnicianRoutes = require("./routes/adminTechnicianRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");

// Booking model
const Booking = require("./models/Booking");

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

app.get("/", (req, res) => {
  res.send("Welcome to Fixora Backend");
});

// =========================
// HTTP Server
// =========================

const server = http.createServer(app);

// =========================
// Socket.IO Setup
// =========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// =========================
// Socket Connection
// =========================

io.on("connection", (socket) => {
  console.log(
    "🟢 User Connected:",
    socket.id
  );

  // ========================================
  // JOIN BOOKING ROOM
  // ========================================

  socket.on(
    "join-booking",
    async (bookingId) => {
      try {
        if (!bookingId) {
          console.log(
            "❌ No booking ID provided"
          );

          return;
        }

        socket.join(bookingId);

        console.log(
          `📦 Socket ${socket.id} joined booking room: ${bookingId}`
        );

        // Check current number of users in room
        const room =
          io.sockets.adapter.rooms.get(
            bookingId
          );

        const roomSize = room
          ? room.size
          : 0;

        console.log(
          `👥 Users in booking room ${bookingId}: ${roomSize}`
        );

        // ====================================
        // SEND LAST SAVED LOCATION
        // ====================================

        const booking =
          await Booking.findById(
            bookingId
          ).select(
            "technicianLocation trackingActive status"
          );

        if (
          booking &&
          booking.technicianLocation &&
          booking.technicianLocation.latitude !==
            null &&
          booking.technicianLocation.longitude !==
            null
        ) {
          socket.emit(
            "receive-location",
            {
              bookingId,

              latitude:
                booking
                  .technicianLocation
                  .latitude,

              longitude:
                booking
                  .technicianLocation
                  .longitude,

              updatedAt:
                booking
                  .technicianLocation
                  .updatedAt,

              trackingActive:
                booking.trackingActive,

              status:
                booking.status,
            }
          );

          console.log(
            "📤 Sent saved location to newly joined socket:",
            bookingId
          );
        }
      } catch (error) {
        console.error(
          "❌ Join Booking Error:",
          error.message
        );
      }
    }
  );

  // ========================================
  // TECHNICIAN SENDS LOCATION
  // ========================================

  socket.on(
    "send-location",
    async (data) => {
      try {
        console.log(
          "📍 Received From Technician:",
          data
        );

        if (
          !data ||
          !data.bookingId ||
          data.latitude === undefined ||
          data.longitude === undefined
        ) {
          console.log(
            "❌ Invalid location data"
          );

          return;
        }

        const {
          bookingId,
          latitude,
          longitude,
        } = data;

        // ====================================
        // SAVE LOCATION IN DATABASE
        // ====================================

        const booking =
          await Booking.findById(
            bookingId
          );

        if (!booking) {
          console.log(
            "❌ Booking not found:",
            bookingId
          );

          return;
        }

        booking.technicianLocation = {
          latitude: Number(latitude),

          longitude: Number(longitude),

          updatedAt: new Date(),
        };

        booking.trackingActive = true;

        // If technician is travelling,
        // keep status as On The Way
        if (
          booking.status === "On The Way"
        ) {
          booking.trackingActive = true;
        }

        await booking.save();

        console.log(
          "💾 Technician location saved:",
          bookingId
        );

        // ====================================
        // SEND TO CUSTOMER
        // ====================================

        const locationData = {
          bookingId,

          latitude: Number(latitude),

          longitude: Number(longitude),

          updatedAt: new Date(),

          trackingActive: true,

          status: booking.status,
        };

        io.to(bookingId).emit(
          "receive-location",
          locationData
        );

        console.log(
          "📤 Sent location to booking room:",
          bookingId
        );

        // ====================================
        // CHECK ROOM USERS
        // ====================================

        const room =
          io.sockets.adapter.rooms.get(
            bookingId
          );

        const roomSize = room
          ? room.size
          : 0;

        console.log(
          `👥 Booking room ${bookingId} currently has ${roomSize} socket(s)`
        );
      } catch (error) {
        console.error(
          "❌ Send Location Error:",
          error
        );
      }
    }
  );

  // ========================================
  // STOP LIVE TRACKING
  // ========================================

  socket.on(
    "stop-location",
    async (bookingId) => {
      try {
        if (!bookingId) return;

        await Booking.findByIdAndUpdate(
          bookingId,
          {
            trackingActive: false,
          }
        );

        io.to(bookingId).emit(
          "tracking-stopped",
          {
            bookingId,
          }
        );

        console.log(
          "🛑 Tracking stopped:",
          bookingId
        );
      } catch (error) {
        console.error(
          "Stop Tracking Error:",
          error.message
        );
      }
    }
  );

  // ========================================
  // DISCONNECT
  // ========================================

  socket.on("disconnect", () => {
    console.log(
      "🔴 User Disconnected:",
      socket.id
    );
  });
});

// =========================
// Start Server
// =========================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});