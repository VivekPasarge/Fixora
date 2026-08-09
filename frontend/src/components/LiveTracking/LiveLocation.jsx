import { useEffect, useState } from "react";
import socket from "../../socket";

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
// import carMarker from "../../assets/car-marker.png";

// const technicianIcon = new L.Icon({
//   iconUrl: carMarker,
//   iconSize: [45, 45],
//   iconAnchor: [22, 22],
// });
// import homeMarker from "../../assets/home-marker.png";

// const customerIcon = new L.Icon({
//   iconUrl: homeMarker,
//   iconSize: [40, 40],
//   iconAnchor: [20, 20],
// });

const technicianIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const customerIcon = new L.Icon({
  iconUrl:
    "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const RecenterMap = ({ lat, lng }) => {

  const map = useMap();

  useEffect(() => {

    map.setView([lat, lng], map.getZoom());

  }, [lat, lng, map]);

  return null;

};

const LiveLocation = ({ bookingId }) => {

  const [location, setLocation] = useState(null);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [distance, setDistance] = useState(0);
    useEffect(() => {

    if (!bookingId) return;

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setCustomerLocation({

          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

        });

      },

      (error) => {

        console.log(error);

      }

    );

    console.log("Joining Room:", bookingId);

    socket.emit("join-booking", bookingId);

    const handleLocation = (data) => {

      console.log("📍 Received:", data);

      if (data.bookingId === bookingId) {

        setLocation(data);

      }

    };

    socket.on("receive-location", handleLocation);

    return () => {

      socket.off("receive-location", handleLocation);

    };

  }, [bookingId]);

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {

    const R = 6371;

    const dLat =
      (lat2 - lat1) * (Math.PI / 180);

    const dLon =
      (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
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

  useEffect(() => {

    if (!customerLocation || !location) return;

    const km = calculateDistance(

      customerLocation.latitude,

      customerLocation.longitude,

      location.latitude,

      location.longitude

    );

    setDistance(km);

  }, [customerLocation, location]);

    return (
    <div className="live-map-card">

     <div className="tracking-header">

  <div>

    <h2>Live Technician Tracking</h2>

    <p>
      Your technician is on the way.
    </p>

  </div>

  <div className="live-badge">

    <span className="live-dot"></span>

    LIVE

  </div>

</div>

      {location ? (

        <>

          <div className="location-status">

            <span className="live-dot"></span>

            Technician is Live

          </div>
<div className="status-card">

  <h3>Current Status</h3>

  <div className="status-grid">

    <div>

      <span>Distance</span>

      <strong>
        {distance.toFixed(2)} km
      </strong>

    </div>

    <div>

      <span>ETA</span>

      <strong>
        {Math.max(
          1,
          Math.ceil(distance * 3)
        )} mins
      </strong>

    </div>

    <div>

      <span>Status</span>

      <strong className="green">

        Technician On The Way

      </strong>

    </div>

  </div>

</div>
          <MapContainer
            center={[
              location.latitude,
              location.longitude,
            ]}
            zoom={15}
            className="live-map"
            style={{
              height: "350px",
              width: "100%",
              borderRadius: "18px",
            }}
          >

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <RecenterMap
              lat={location.latitude}
              lng={location.longitude}
            />

            {/* Technician */}

            <Marker
              position={[
                location.latitude,
                location.longitude,
              ]}
              icon={technicianIcon}
            >
              <Popup>
                🚗 Technician Current Location
              </Popup>
            </Marker>

            {/* Customer */}

            {customerLocation && (

              <Marker
                position={[
                  customerLocation.latitude,
                  customerLocation.longitude,
                ]}
                icon={customerIcon}
              >
                <Popup>
                  🏠 Your Location
                </Popup>
              </Marker>

            )}

            {/* Line Between Customer & Technician */}

           {customerLocation && location && (
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
      weight: 6,
      opacity: 0.9,
      dashArray: "10 8",
      lineCap: "round",
      lineJoin: "round",
    }}
  />
            )}

          </MapContainer>

         <div className="tracking-stats">

  <div className="tracking-stat">

    <div className="stat-icon">
      📍
    </div>

    <div>

      <span>Distance</span>

      <h3>{distance.toFixed(2)} km</h3>

    </div>

  </div>

  <div className="divider"></div>

  <div className="tracking-stat">

    <div className="stat-icon">
      ⏱️
    </div>

    <div>

      <span>Estimated Arrival</span>

      <h3>{Math.max(1, Math.ceil(distance * 3))} mins</h3>

    </div>

  </div>

</div>

          

        </>

      ) : (

        <div className="waiting-card">

          <div className="pulse"></div>

          <p>
            Waiting for technician location...
          </p>

        </div>

      )}

    </div>
  );

};

export default LiveLocation;