
import { useEffect, useRef } from "react";
import socket from "../../socket";

const TechnicianLocationTracker = () => {
  const watchId = useRef(null);
  const latestLocation = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Location Tracker: No login token found.");
      return;
    }

    const sendLocation = () => {
      if (!latestLocation.current) return;

      if (!socket.connected) {
        console.log("Waiting for socket connection...");
        return;
      }

      socket.emit("update-my-location", latestLocation.current);

      console.log(
        "Technician GPS location sent:",
        latestLocation.current
      );
    };

    const startTracking = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported.");
        return;
      }

      if (watchId.current !== null) return;

      console.log("Starting technician GPS tracking...");

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          latestLocation.current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          console.log("GPS coordinates received:", latestLocation.current);

          sendLocation();
        },
        (error) => {
          console.error(
            "Technician GPS Error:",
            error.code,
            error.message
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    };

    const stopTracking = () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }

      latestLocation.current = null;

      console.log("Stopping technician GPS tracking...");
    };

    const checkAvailability = () => {
      const isOnline =
        localStorage.getItem("technicianOnline") === "true";

      if (isOnline) {
        startTracking();
      } else {
        stopTracking();
      }
    };

    const handleAvailabilityChange = () => {
      checkAvailability();
    };

    const handleSocketConnect = () => {
      console.log("GPS tracker: Socket connected.");
      sendLocation();
    };

    const handleLocationUpdated = (data) => {
      console.log("Backend saved technician location:", data);
    };

    const handleLocationError = (data) => {
      console.error("Backend GPS update error:", data);
    };

    socket.on("connect", handleSocketConnect);
    socket.on("location-updated", handleLocationUpdated);
    socket.on("location-update-error", handleLocationError);

    window.addEventListener(
      "technicianAvailabilityChanged",
      handleAvailabilityChange
    );

    checkAvailability();

    // If socket was already connected before this component mounted.
    if (socket.connected) {
      sendLocation();
    }

    return () => {
      stopTracking();

      socket.off("connect", handleSocketConnect);
      socket.off("location-updated", handleLocationUpdated);
      socket.off("location-update-error", handleLocationError);

      window.removeEventListener(
        "technicianAvailabilityChanged",
        handleAvailabilityChange
      );
    };
  }, []);

  return null;
};

export default TechnicianLocationTracker;
