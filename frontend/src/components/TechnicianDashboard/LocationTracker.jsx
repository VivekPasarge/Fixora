import { useEffect } from "react";
import socket from "../../socket";

const LocationTracker = ({ bookingId }) => {
  useEffect(() => {

    if (!bookingId) return;

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

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
        console.log(error);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }

    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };

  }, [bookingId]);

  return null;
};

export default LocationTracker;