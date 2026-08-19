require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// =========================
// Models
// =========================

const Booking = require("./models/Booking");

// =========================
// Routes
// =========================

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminTechnicianRoutes = require("./routes/adminTechnicianRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");

// =========================
// App
// =========================

const app = express();

// =========================
// Database
// =========================

connectDB();

// =========================
// CORS
// =========================

const allowedOrigins = [
  "http://localhost:5173",
  "https://fixora-4cdg.vercel.app",
];

const isAllowedOrigin = (origin) => {

  if (!origin) {
    return true;
  }

  if (
    allowedOrigins.includes(origin)
  ) {
    return true;
  }

  if (
    /^https:\/\/fixora-4cdg-[a-z0-9-]+\.vercel\.app$/i.test(
      origin
    )
  ) {
    return true;
  }

  return false;
};

// =========================
// Express CORS
// =========================

app.use(
  cors({
    origin: function (
      origin,
      callback
    ) {

      if (
        isAllowedOrigin(origin)
      ) {

        callback(null, true);

      } else {

        console.log(
          "❌ CORS blocked origin:",
          origin
        );

        callback(
          new Error(
            "Not allowed by CORS"
          )
        );

      }

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

// =========================
// JSON
// =========================

app.use(
  express.json()
);

// =========================
// Routes
// =========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/services",
  serviceRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/partners",
  partnerRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

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
// Home
// =========================

app.get(
  "/",
  (req, res) => {

    res.send(
      "Welcome to Fixora Backend"
    );

  }
);

// =========================
// HTTP SERVER
// =========================

const server =
  http.createServer(app);

// =========================
// SOCKET.IO
// =========================

const io = new Server(
  server,
  {
    cors: {

      origin: function (
        origin,
        callback
      ) {

        if (
          isAllowedOrigin(origin)
        ) {

          callback(
            null,
            true
          );

        } else {

          console.log(
            "❌ Socket.IO CORS blocked origin:",
            origin
          );

          callback(
            new Error(
              "Not allowed by CORS"
            )
          );

        }

      },

      methods: [
        "GET",
        "POST",
      ],

      credentials: true,

    },
  }
);


// =========================================================
// SOCKET CONNECTION
// =========================================================

io.on(
  "connection",
  (socket) => {

    console.log(
      "🟢 User Connected:",
      socket.id
    );


    // =======================================================
    // JOIN BOOKING ROOM
    // =======================================================

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


          // -----------------------------------------------
          // Join room
          // -----------------------------------------------

          socket.join(
            bookingId
          );


          console.log(
            `📦 Socket ${socket.id} joined booking room: ${bookingId}`
          );


          // -----------------------------------------------
          // Room users
          // -----------------------------------------------

          const room =
            io.sockets.adapter.rooms.get(
              bookingId
            );

          const roomSize =
            room
              ? room.size
              : 0;


          console.log(
            `👥 Users in booking room ${bookingId}: ${roomSize}`
          );


          // -----------------------------------------------
          // Get booking
          // -----------------------------------------------

          const booking =
            await Booking.findById(
              bookingId
            ).select(
              "technicianLocation trackingActive status"
            );


          // -----------------------------------------------
          // Send previous location
          // -----------------------------------------------

          if (
            booking &&
            booking.technicianLocation &&
            booking
              .technicianLocation
              .latitude !== null &&
            booking
              .technicianLocation
              .longitude !== null
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
                  booking
                    .trackingActive,

                status:
                  booking.status,

              }
            );


            console.log(
              "📤 Sent saved location to newly joined socket:",
              bookingId
            );

          } else {

            console.log(
              "⏳ No technician location available yet."
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


    // =======================================================
    // TECHNICIAN SENDS LOCATION
    // =======================================================

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


          // -----------------------------------------------
          // Find booking
          // -----------------------------------------------

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


          // -----------------------------------------------
          // Save location
          // -----------------------------------------------

          booking.technicianLocation = {

            latitude:
              Number(latitude),

            longitude:
              Number(longitude),

            updatedAt:
              new Date(),

          };


          booking.trackingActive =
            true;


          if (
            booking.status ===
            "On The Way"
          ) {

            booking.trackingActive =
              true;

          }


          await booking.save();


          console.log(
            "💾 Technician location saved:",
            bookingId
          );


          // -----------------------------------------------
          // Send location to customer
          // -----------------------------------------------

          const locationData = {

            bookingId,

            latitude:
              Number(latitude),

            longitude:
              Number(longitude),

            updatedAt:
              new Date(),

            trackingActive:
              true,

            status:
              booking.status,

          };


          io.to(
            bookingId
          ).emit(
            "receive-location",
            locationData
          );


          console.log(
            "📤 Sent location to booking room:",
            bookingId
          );


          // -----------------------------------------------
          // Room users
          // -----------------------------------------------

          const room =
            io.sockets.adapter.rooms.get(
              bookingId
            );

          const roomSize =
            room
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


    // =======================================================
    // STOP LIVE TRACKING
    // =======================================================

    socket.on(
      "stop-location",
      async (bookingId) => {

        try {

          if (!bookingId) {
            return;
          }


          await Booking.findByIdAndUpdate(
            bookingId,
            {
              trackingActive:
                false,
            }
          );


          io.to(
            bookingId
          ).emit(
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
            "❌ Stop Tracking Error:",
            error.message
          );

        }

      }
    );


    // =======================================================
    // DISCONNECT
    // =======================================================

    socket.on(
      "disconnect",
      () => {

        console.log(
          "🔴 User Disconnected:",
          socket.id
        );

      }
    );

  }
);


// =========================================================
// SERVER
// =========================================================

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {

    console.log(
      `🚀 Server running on port ${PORT}`
    );

  }
);