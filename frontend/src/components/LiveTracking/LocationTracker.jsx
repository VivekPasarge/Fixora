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
//         console.log("Location Error:", error);
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

    console.log("🚀 LocationTracker started");
    console.log("📦 Booking ID:", bookingId);

    if (!bookingId) {
      console.log("❌ No booking ID");
      return;
    }

    if (!navigator.geolocation) {
      console.log("❌ Geolocation is not supported");
      return;
    }

    console.log("🌍 Requesting technician location...");

    const watchId = navigator.geolocation.watchPosition(

      (position) => {

        const location = {
          bookingId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log("📍 Sending:", location);

        socket.emit("send-location", location);

      },

      (error) => {

        console.log("❌ Geolocation Error");
        console.log("Error Code:", error.code);
        console.log("Error Message:", error.message);

      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }

    );

    console.log(
      "👀 Watching location. Watch ID:",
      watchId
    );

    return () => {

      console.log(
        "🛑 Stopping location tracking"
      );

      navigator.geolocation.clearWatch(
        watchId
      );

    };

  }, [bookingId]);

  return null;
};

export default LocationTracker;