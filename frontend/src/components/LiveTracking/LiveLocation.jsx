import { useEffect, useRef, useState } from "react";

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
});

/* =========================================================
   CUSTOMER ICON
========================================================= */

const customerIcon = new L.Icon({
  iconUrl:
    "https://maps.google.com/mapfiles/ms/icons/red-dot.png",

  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

/* =========================================================
   RECENTER MAP
========================================================= */

const RecenterMap = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    const lat = Number(location.latitude);
    const lng = Number(location.longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    map.setView(
      [lat, lng],
      Math.max(map.getZoom(), 15),
      {
        animate: true,
        duration: 0.8,
      }
    );
  }, [location, map]);

  return null;
};

/* =========================================================
   LIVE LOCATION
========================================================= */

const LiveLocation = ({ bookingId }) => {
  const [location, setLocation] =
    useState(null);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [distance, setDistance] =
    useState(0);

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(true);

  /* =========================================================
     STORE PREVIOUS LOCATION
     Used for smooth marker movement.
  ========================================================= */

  const previousLocationRef =
    useRef(null);

  /* =========================================================
     FETCH SAVED TECHNICIAN LOCATION
     This allows the map to appear after refresh.
  ========================================================= */

  useEffect(() => {
    if (!bookingId) return;

    const fetchSavedLocation = async () => {
      try {
        console.log(
          "🔎 Checking saved technician location..."
        );

        const token =
          localStorage.getItem("token");

        const response = await api.get(
          `/bookings/${bookingId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const booking =
          response.data.booking;

        const savedLocation =
          booking?.technicianLocation;

        if (
          savedLocation &&
          savedLocation.latitude !== null &&
          savedLocation.longitude !== null
        ) {
          const latitude =
            Number(savedLocation.latitude);

          const longitude =
            Number(savedLocation.longitude);

          if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
          ) {
            console.log(
              "📍 Saved technician location:",
              {
                latitude,
                longitude,
              }
            );

            const saved = {
              bookingId,
              latitude,
              longitude,
            };

            previousLocationRef.current =
              saved;

            setLocation(saved);
          }
        } else {
          console.log(
            "⏳ No saved technician location yet."
          );
        }
      } catch (error) {
        console.log(
          "❌ Failed to fetch saved location:",
          error
        );
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchSavedLocation();
  }, [bookingId]);

  /* =========================================================
     SOCKET + CUSTOMER LOCATION
  ========================================================= */

  useEffect(() => {
    if (!bookingId) {
      console.log(
        "❌ LiveLocation: Booking ID missing"
      );

      return;
    }

    console.log(
      "🔵 Customer LiveLocation started"
    );

    console.log(
      "📦 Booking ID:",
      bookingId
    );

    /* =======================================================
       LOCATION RECEIVED FROM TECHNICIAN
    ======================================================= */

    const handleLocation = (data) => {
      console.log(
        "📍 CUSTOMER RECEIVED LOCATION:",
        data
      );

      if (
        String(data.bookingId) !==
        String(bookingId)
      ) {
        console.log(
          "⚠️ Location belongs to another booking"
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
          "❌ Invalid technician location:",
          data
        );

        return;
      }

      const newLocation = {
        bookingId:
          data.bookingId,

        latitude,
        longitude,
      };

      /* =====================================================
         SAVE CURRENT POSITION
      ===================================================== */

      previousLocationRef.current =
        newLocation;

      setLocation(newLocation);

      setLoadingLocation(false);
    };

    /* =======================================================
       SOCKET CONNECT
    ======================================================= */

    const handleConnect = () => {
      console.log(
        "🟢 Customer socket connected:",
        socket.id
      );

      setSocketConnected(true);

      socket.emit(
        "join-booking",
        bookingId
      );

      console.log(
        "🚪 Customer joined booking room:",
        bookingId
      );
    };

    /* =======================================================
       SOCKET DISCONNECT
    ======================================================= */

    const handleDisconnect = () => {
      console.log(
        "🔴 Customer socket disconnected"
      );

      setSocketConnected(false);
    };

    /* =======================================================
       LISTENERS
    ======================================================= */

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

    /* =======================================================
       ALREADY CONNECTED
    ======================================================= */

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
        "🚪 Customer joined booking room:",
        bookingId
      );
    }

    /* =======================================================
       CUSTOMER LOCATION
    ======================================================= */

    if (!navigator.geolocation) {
      console.log(
        "❌ Browser geolocation not supported"
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const customer = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          console.log(
            "🏠 Customer location:",
            customer
          );

          setCustomerLocation(customer);
        },

        (error) => {
          console.log(
            "❌ Customer location error:",
            error
          );
        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    }

    /* =======================================================
       CLEANUP
    ======================================================= */

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
        lat1 * (Math.PI / 180)
      ) *

      Math.cos(
        lat2 * (Math.PI / 180)
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

    const km =
      calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        location.latitude,
        location.longitude
      );

    setDistance(km);
  }, [
    customerLocation,
    location,
  ]);

  /* =========================================================
     WAITING STATE
  ========================================================= */

  if (
    loadingLocation &&
    !location
  ) {
    return (
      <section className="live-location-card">

        <div className="waiting-card">

          <div className="pulse"></div>

          <h3>
            Checking technician location...
          </h3>

          <p>
            Please wait while we connect
            to the technician.
          </p>

        </div>

      </section>
    );
  }

  /* =========================================================
     NO TECHNICIAN LOCATION
  ========================================================= */

  if (!location) {
    return (
      <section className="live-location-card">

        <div className="waiting-card">

          <div className="pulse"></div>

          <h3>
            Waiting for technician
          </h3>

          <p>
            The live map will appear when
            your technician starts the journey.
          </p>

          <small>
            Booking ID: {bookingId}
          </small>

        </div>

      </section>
    );
  }

  /* =========================================================
     MAP
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
            Follow your technician's
            journey in real time.
          </p>

        </div>

        <div className="live-status">

          <span className="live-dot"></span>

          {socketConnected
            ? "LIVE"
            : "RECONNECTING"}

        </div>

      </div>


      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="live-map-container">

        <MapContainer
          center={[
            location.latitude,
            location.longitude,
          ]}
          zoom={15}
          scrollWheelZoom={true}
          className="live-leaflet-map"
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />


          {/* ================================================
              FOLLOW TECHNICIAN
          ================================================ */}

          <RecenterMap
            location={location}
          />


          {/* ================================================
              TECHNICIAN
          ================================================ */}

          <Marker
            position={[
              location.latitude,
              location.longitude,
            ]}
            icon={technicianIcon}
          >

            <Popup>
              <strong>
                Technician
              </strong>

              <br />

              Live Location
            </Popup>

          </Marker>


          {/* ================================================
              CUSTOMER
          ================================================ */}

          {customerLocation && (
            <Marker
              position={[
                customerLocation.latitude,
                customerLocation.longitude,
              ]}
              icon={customerIcon}
            >

              <Popup>
                <strong>
                  Your Location
                </strong>
              </Popup>

            </Marker>
          )}


          {/* ================================================
              ROUTE / CONNECTION LINE
          ================================================ */}

          {customerLocation && (
            <Polyline
              positions={[
                [
                  customerLocation.latitude,
                  customerLocation.longitude,
                ],

                [
                  location.latitude,
                  location.longitude,
                ],
              ]}
              pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.75,
                dashArray: "10 8",
                lineCap: "round",
              }}
            />
          )}

        </MapContainer>

      </div>


      {/* =====================================================
          TRACKING STATUS
      ===================================================== */}

      <div className="tracking-info">

        <div className="info-box">

          <h3>
            Technician Status
          </h3>

          <p>
            {socketConnected
              ? "Moving"
              : "Reconnecting"}
          </p>

        </div>


        <div className="info-box">

          <h3>
            Distance
          </h3>

          <p>
            {distance.toFixed(2)} km
          </p>

        </div>


        <div className="info-box">

          <h3>
            Estimated Arrival
          </h3>

          <p>
            {Math.max(
              1,
              Math.ceil(distance * 3)
            )}{" "}
            min
          </p>

        </div>

      </div>

    </section>
  );
};

export default LiveLocation;