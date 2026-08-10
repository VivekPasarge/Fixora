// import { useEffect } from "react";
// import socket from "../../socket";

// const LocationTracker = ({ bookingId }) => {
//   useEffect(() => {

//     if (!bookingId) return;

//     if (!navigator.geolocation) {
//       console.log("Geolocation not supported");
//       return;
//     }

//     const watchId = navigator.geolocation.watchPosition(

//       (position) => {

//         const location = {
//           bookingId,
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         };

//         console.log("📍 Sending:", location);

//         socket.emit("send-location", location);

//       },

//       (error) => {
//         console.log(error);
//       },

//       {
//         enableHighAccuracy: true,
//         maximumAge: 0,
//         timeout: 5000,
//       }

//     );

//     return () => {
//       navigator.geolocation.clearWatch(watchId);
//     };

//   }, [bookingId]);

//   return null;
// };

// export default LocationTracker;


import { useEffect } from "react";
import socket from "../../socket";

const LocationTracker = ({ bookingId }) => {
  useEffect(() => {
    if (!bookingId) {
      console.log("❌ LocationTracker: No booking ID");
      return;
    }

    console.log(
      "📍 LocationTracker started for booking:",
      bookingId
    );

    // ==========================================
    // JOIN BOOKING ROOM
    // ==========================================

    if (socket.connected) {
      console.log(
        "🟢 Socket already connected:",
        socket.id
      );

      socket.emit(
        "join-booking",
        bookingId
      );

      console.log(
        "📦 Technician joined booking room:",
        bookingId
      );
    } else {
      console.log(
        "🟡 Socket not connected yet. Waiting..."
      );

      const handleConnect = () => {
        console.log(
          "🟢 Technician socket connected:",
          socket.id
        );

        socket.emit(
          "join-booking",
          bookingId
        );

        console.log(
          "📦 Technician joined booking room:",
          bookingId
        );
      };

      socket.once(
        "connect",
        handleConnect
      );

      // Cleanup connect listener
      return () => {
        socket.off(
          "connect",
          handleConnect
        );
      };
    }

    // ==========================================
    // CHECK GEOLOCATION SUPPORT
    // ==========================================

    if (!navigator.geolocation) {
      console.log(
        "❌ Geolocation is not supported by this browser."
      );

      return;
    }

    // ==========================================
    // START WATCHING TECHNICIAN LOCATION
    // ==========================================

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            bookingId: bookingId,

            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          console.log(
            "📍 Sending:",
            location
          );

          // ====================================
          // SEND LOCATION TO BACKEND
          // ====================================

          if (socket.connected) {
            socket.emit(
              "send-location",
              location
            );
          } else {
            console.log(
              "❌ Cannot send location. Socket disconnected."
            );
          }
        },

        (error) => {
          console.log(
            "❌ Geolocation Error:",
            error
          );
        },

        {
          enableHighAccuracy: true,

          maximumAge: 0,

          timeout: 10000,
        }
      );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      console.log(
        "🛑 Stopping location tracking:",
        bookingId
      );

      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [bookingId]);

  return null;
};

export default LocationTracker;