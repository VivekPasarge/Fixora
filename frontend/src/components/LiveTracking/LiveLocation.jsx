import { useEffect, useState } from "react";
import socket from "../../socket";
import api from "../../api/axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./LiveLocation.css";

/* =========================================================
   TECHNICIAN ICON
========================================================= */

const technicianIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],
});

/* =========================================================
   CUSTOMER ICON
========================================================= */

const customerIcon = new L.Icon({
  iconUrl:
    "https://maps.google.com/mapfiles/ms/icons/red-dot.png",

  iconSize: [40, 40],

  iconAnchor: [20, 40],

  popupAnchor: [0, -40],
});

/* =========================================================
   RECENTER MAP
========================================================= */

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (
      typeof lat !== "number" ||
      typeof lng !== "number"
    ) {
      return;
    }

    map.setView(
      [lat, lng],
      Math.max(map.getZoom(), 15),
      {
        animate: true,
      }
    );
  }, [lat, lng, map]);

  return null;
};

/* =========================================================
   LIVE LOCATION COMPONENT
========================================================= */

const LiveLocation = ({ bookingId }) => {
  const [location, setLocation] = useState(null);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [distance, setDistance] = useState(0);

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(true);

  const [locationError, setLocationError] =
    useState("");

  /* =======================================================
     FETCH SAVED TECHNICIAN LOCATION
  ======================================================= */

  const fetchSavedLocation = async () => {
    if (!bookingId) {
      return;
    }

    try {
      console.log(
        "🔎 Checking technician location..."
      );

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "📦 Booking location response:",
        response.data
      );

      const booking =
        response.data?.booking ||
        response.data;

      const savedLocation =
        booking?.technicianLocation;

      if (
        savedLocation &&
        savedLocation.latitude !== null &&
        savedLocation.latitude !== undefined &&
        savedLocation.longitude !== null &&
        savedLocation.longitude !== undefined
      ) {
        const latitude =
          Number(
            savedLocation.latitude
          );

        const longitude =
          Number(
            savedLocation.longitude
          );

        if (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          console.log(
            "📍 Technician saved location:",
            {
              latitude,
              longitude,
            }
          );

          setLocation({
            bookingId,
            latitude,
            longitude,
          });

          setLocationError("");
        }
      } else {
        console.log(
          "⏳ Technician location not available yet."
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to fetch technician location:",
        error
      );

      console.log(
        "Server response:",
        error?.response?.data
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  /* =======================================================
     INITIAL LOCATION FETCH
  ======================================================= */

  useEffect(() => {
    if (!bookingId) {
      console.log(
        "❌ LiveLocation: bookingId missing"
      );

      setLoadingLocation(false);

      return;
    }

    fetchSavedLocation();
  }, [bookingId]);

  /* =======================================================
     AUTO REFRESH SAVED LOCATION
  ======================================================= */

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    /*
      Check the backend every 3 seconds.

      Socket.IO normally updates the map instantly,
      but this acts as a fallback in case a socket
      event is missed.
    */

    const interval = setInterval(() => {
      fetchSavedLocation();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [bookingId]);

  /* =======================================================
     SOCKET.IO
  ======================================================= */

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    console.log(
      "🔵 Customer LiveLocation started"
    );

    console.log(
      "📦 Booking ID:",
      bookingId
    );

    /* =====================================================
       RECEIVE LOCATION
    ===================================================== */

    const handleLocation = (data) => {
      console.log(
        "📍 CUSTOMER RECEIVED LOCATION:",
        data
      );

      if (!data) {
        return;
      }

      if (
        String(data.bookingId) !==
        String(bookingId)
      ) {
        console.log(
          "⚠️ Location belongs to another booking:",
          data.bookingId
        );

        return;
      }

      const latitude =
        Number(data.latitude);

      const longitude =
        Number(data.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        console.log(
          "❌ Invalid location:",
          data
        );

        return;
      }

      console.log(
        "✅ Updating customer map:",
        {
          latitude,
          longitude,
        }
      );

      setLocation({
        bookingId,
        latitude,
        longitude,
      });

      setLocationError("");
    };

    /* =====================================================
       CONNECT
    ===================================================== */

    const handleConnect = () => {
      console.log(
        "🟢 Customer socket connected:",
        socket.id
      );

      setSocketConnected(true);

      /*
        Join booking room.
      */

      socket.emit(
        "join-booking",
        bookingId
      );

      console.log(
        "🚪 Customer joined booking room:",
        bookingId
      );
    };

    /* =====================================================
       DISCONNECT
    ===================================================== */

    const handleDisconnect = (
      reason
    ) => {
      console.log(
        "🔴 Customer socket disconnected:",
        reason
      );

      setSocketConnected(false);
    };

    /* =====================================================
       REGISTER LISTENERS FIRST
    ===================================================== */

    socket.on(
      "receive-location",
      handleLocation
    );

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    /* =====================================================
       SOCKET ALREADY CONNECTED
    ===================================================== */

    if (socket.connected) {
      console.log(
        "🟢 Socket already connected:",
        socket.id
      );

      setSocketConnected(true);

      socket.emit(
        "join-booking",
        bookingId
      );

      console.log(
        "🚪 Joined existing socket booking room:",
        bookingId
      );
    }

    /* =====================================================
       CUSTOMER GPS
    ===================================================== */

    if (!navigator.geolocation) {
      console.log(
        "❌ Browser does not support geolocation"
      );

      return () => {
        socket.off(
          "receive-location",
          handleLocation
        );

        socket.off(
          "connect",
          handleConnect
        );

        socket.off(
          "disconnect",
          handleDisconnect
        );
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          Number(
            position.coords.latitude
          );

        const longitude =
          Number(
            position.coords.longitude
          );

        console.log(
          "🏠 Customer location:",
          {
            latitude,
            longitude,
          }
        );

        setCustomerLocation({
          latitude,
          longitude,
        });
      },

      (error) => {
        console.log(
          "❌ Customer GPS error:",
          error.message
        );
      },

      {
        enableHighAccuracy: true,

        maximumAge: 0,

        timeout: 10000,
      }
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      console.log(
        "🧹 Cleaning LiveLocation listeners"
      );

      socket.off(
        "receive-location",
        handleLocation
      );

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

  /* =========================================================
     DISTANCE CALCULATION
  ========================================================= */

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371;

    const dLat =
      (lat2 - lat1) *
      (Math.PI / 180);

    const dLon =
      (lon2 - lon1) *
      (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

      Math.cos(
        lat1 *
          (Math.PI / 180)
      ) *
        Math.cos(
          lat2 *
            (Math.PI / 180)
        ) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  /* =========================================================
     UPDATE DISTANCE
  ========================================================= */

  useEffect(() => {
    if (
      !customerLocation ||
      !location
    ) {
      return;
    }

    const calculatedDistance =
      calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,

        location.latitude,
        location.longitude
      );

    console.log(
      "📏 Distance:",
      calculatedDistance,
      "km"
    );

    setDistance(
      calculatedDistance
    );
  }, [
    customerLocation,
    location,
  ]);

  /* =========================================================
     ETA
  ========================================================= */

  const estimatedArrival =
    Math.max(
      1,
      Math.ceil(distance * 3)
    );

  /* =========================================================
     MAP CENTER
  ========================================================= */

  const mapCenter = location
    ? [
        location.latitude,
        location.longitude,
      ]
    : customerLocation
      ? [
          customerLocation.latitude,
          customerLocation.longitude,
        ]
      : [12.9716, 77.5946];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="live-location-card">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="tracking-header">

        <div>

          <h2>
            Live Technician Tracking
          </h2>

          <p>
            Follow your technician's journey
            in real time.
          </p>

        </div>

        <div
          className={
            location
              ? "live-status"
              : "live-status waiting-status"
          }
        >

          <span
            className={
              location
                ? "live-dot"
                : "waiting-dot"
            }
          ></span>

          {location
            ? "LIVE"
            : "WAITING"}

        </div>

      </div>


      {/* =====================================================
          SOCKET STATUS
      ===================================================== */}

      {!socketConnected && (

        <div className="tracking-warning">

          Connecting to live tracking...

        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loadingLocation && (

        <div className="tracking-warning">

          Checking technician location...

        </div>

      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {locationError && (

        <div className="tracking-warning">

          {locationError}

        </div>

      )}


      {/* =====================================================
          MAP
      ===================================================== */}

      {location ? (

        <>

          <div className="location-status">

            <span className="live-dot"></span>

            Technician is live

          </div>


          <div
            className="live-map-container"
            style={{
              height: "450px",
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >

            <MapContainer
              center={mapCenter}
              zoom={15}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />


              {/* =================================================
                  RECENTER MAP
              ================================================= */}

              <RecenterMap
                lat={
                  location.latitude
                }
                lng={
                  location.longitude
                }
              />


              {/* =================================================
                  TECHNICIAN MARKER
              ================================================= */}

              <Marker
                position={[
                  location.latitude,
                  location.longitude,
                ]}
                icon={
                  technicianIcon
                }
              >

                <Popup>

                  <strong>
                    Technician
                  </strong>

                  <br />

                  Live Current Location

                </Popup>

              </Marker>


              {/* =================================================
                  CUSTOMER MARKER
              ================================================= */}

              {customerLocation && (

                <Marker
                  position={[
                    customerLocation.latitude,
                    customerLocation.longitude,
                  ]}
                  icon={
                    customerIcon
                  }
                >

                  <Popup>

                    <strong>
                      Your Location
                    </strong>

                  </Popup>

                </Marker>

              )}


              {/* =================================================
                  ROUTE LINE
              ================================================= */}

              {customerLocation && (

                <Polyline
                  positions={[
                    [
                      location.latitude,
                      location.longitude,
                    ],

                    [
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ],
                  ]}
                  pathOptions={{
                    color: "#2563eb",

                    weight: 5,

                    opacity: 0.85,

                    dashArray: "10 8",

                    lineCap: "round",

                    lineJoin: "round",
                  }}
                />

              )}

            </MapContainer>

          </div>


          {/* =================================================
              LOCATION INFORMATION
          ================================================= */}

          <div className="location-grid">

            <div className="location-item">

              <span>
                Distance
              </span>

              <strong>
                {distance.toFixed(2)} km
              </strong>

            </div>


            <div className="location-item">

              <span>
                Estimated Arrival
              </span>

              <strong>
                {estimatedArrival} min
              </strong>

            </div>


            <div className="location-item">

              <span>
                Status
              </span>

              <strong>
                Live
              </strong>

            </div>

          </div>

        </>

      ) : (

        <div className="tracking-empty">

          <div className="tracking-empty-icon">
            📍
          </div>

          <h3>
            Waiting for technician location
          </h3>

          <p>
            The map will appear automatically
            when the technician starts sharing
            their location.
          </p>

        </div>

      )}

    </section>
  );
};

export default LiveLocation;