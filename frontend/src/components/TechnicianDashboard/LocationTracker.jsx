import { useEffect, useRef } from "react";
import socket from "../../socket";

const LocationTracker = ({ bookingId }) => {
  const watchIdRef = useRef(null);
  const activeBookingRef = useRef(null);

  useEffect(() => {
    console.log(
      "🚀 LocationTracker effect started"
    );

    console.log(
      "📦 Booking ID:",
      bookingId
    );

    if (!bookingId) {
      console.log(
        "❌ No booking ID. Location tracking cancelled."
      );

      return;
    }

    if (!navigator.geolocation) {
      console.log(
        "❌ Geolocation is not supported by this browser."
      );

      return;
    }

    /*
     * Prevent duplicate watchers for
     * the same booking.
     */

    if (
      activeBookingRef.current ===
      bookingId
    ) {
      console.log(
        "⚠️ Location tracker already active for:",
        bookingId
      );

      return;
    }

    /*
     * If another watcher exists,
     * remove it first.
     */

    if (
      watchIdRef.current !== null
    ) {
      console.log(
        "🧹 Clearing previous location watcher"
      );

      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current = null;
    }

    activeBookingRef.current =
      bookingId;

    /*
     * Make sure Socket.IO is connected.
     */

    if (!socket.connected) {
      console.log(
        "🔌 Socket not connected. Connecting..."
      );

      socket.connect();
    } else {
      console.log(
        "🟢 Socket already connected:",
        socket.id
      );
    }

    /*
     * Join booking room.
     */

    console.log(
      "📦 Technician joining booking room:",
      bookingId
    );

    socket.emit(
      "join-booking",
      bookingId
    );

    console.log(
      "🌍 Starting technician location tracking..."
    );

    /*
     * Send technician location.
     */

    const sendLocation = (
      position
    ) => {
      const location = {
        bookingId,
        latitude:
          position.coords.latitude,
        longitude:
          position.coords.longitude,
      };

      console.log(
        "📍 TECHNICIAN GPS:",
        location
      );

      if (!socket.connected) {
        console.log(
          "⚠️ Socket disconnected. Reconnecting..."
        );

        socket.connect();
      }

      console.log(
        "📤 Sending technician location..."
      );

      socket.emit(
        "send-location",
        location
      );
    };

    /*
     * Location error handler.
     */

    const handleLocationError = (
      error
    ) => {
      console.log(
        "❌ Geolocation Error"
      );

      console.log(
        "Error Code:",
        error.code
      );

      console.log(
        "Error Message:",
        error.message
      );

      if (error.code === 1) {
        console.log(
          "⚠️ Location permission denied."
        );
      }

      if (error.code === 2) {
        console.log(
          "⚠️ Location unavailable."
        );
      }

      if (error.code === 3) {
        console.log(
          "⚠️ Location request timed out."
        );
      }
    };

    /*
     * Start watching GPS.
     */

    try {
      const watchId =
        navigator.geolocation.watchPosition(
          sendLocation,
          handleLocationError,
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          }
        );

      watchIdRef.current =
        watchId;

      console.log(
        "👀 GPS watcher started."
      );

      console.log(
        "👀 Watch ID:",
        watchId
      );
    } catch (error) {
      console.log(
        "❌ Failed to start GPS watcher:",
        error
      );
    }

    /*
     * Cleanup.
     */

    return () => {
      console.log(
        "🧹 LocationTracker cleanup for booking:",
        bookingId
      );

      /*
       * Clear GPS watcher.
       */

      if (
        watchIdRef.current !== null
      ) {
        console.log(
          "🛑 Stopping GPS watcher:",
          watchIdRef.current
        );

        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current =
          null;
      }

      /*
       * Only clear the active booking
       * if this effect belongs to it.
       */

      if (
        activeBookingRef.current ===
        bookingId
      ) {
        activeBookingRef.current =
          null;
      }

      console.log(
        "📍 Location tracking cleanup completed."
      );
    };
  }, [bookingId]);

  /*
   * Listen for socket reconnects.

   * If the internet temporarily disappears,
   * Socket.IO reconnects and we rejoin
   * the booking room.
   */

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const handleConnect = () => {
      console.log(
        "🟢 Socket connected:",
        socket.id
      );

      console.log(
        "📦 Rejoining booking room:",
        bookingId
      );

      socket.emit(
        "join-booking",
        bookingId
      );
    };

    const handleDisconnect = (
      reason
    ) => {
      console.log(
        "🔴 Socket disconnected:",
        reason
      );
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );
    };
  }, [bookingId]);

  return null;
};

export default LocationTracker;