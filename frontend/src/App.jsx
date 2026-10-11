
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import TechnicianTrack from "./pages/TechnicianTrack";
import CustomerDashboard from "./pages/CustomerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import TrackBooking from "./pages/TrackBooking";
import BookingDetails from "./pages/BookingDetails";
import Payment from "./pages/Payment";

import Contact from "./components/Contact/Contact";
import About from "./components/About/About";

import Profile from "./pages/Profile";
import BecomePartner from "./pages/BecomePartner";
import ChooseAccount from "./pages/ChooseAccount";
import CompleteProfile from "./pages/CompleteProfile";
import TechnicianProfile from "./pages/TechnicianProfile";
import Review from "./pages/Review";

import TechnicianManagement from "./pages/TechnicianManagement";
import CustomerManagement from "./pages/CustomerManagement";
import BookingManagement from "./pages/BookingManagement";
import ServiceManagement from "./pages/ServiceManagement";
import TechnicianWallet from "./pages/TechnicianWallet";
import TechnicianReviews from "./pages/TechnicianReviews";

import BookingHistory from "./pages/BookingHistory";
import TechnicianHome from "./pages/TechnicianHome";

import socket from "./socket";

function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetails />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-account" element={<ChooseAccount />} />

      {/* Profile completion */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* Customer dashboard */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Technician pages */}
      <Route
        path="/technician-home"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician-dashboard"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician-profile"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/wallet"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianWallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/reviews"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianReviews />
          </ProtectedRoute>
        }
      />

      {/* Admin pages */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CustomerManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TechnicianManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <BookingManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/service-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ServiceManagement />
          </ProtectedRoute>
        }
      />

      {/* Booking pages */}
      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-success"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-details"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <BookingDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/:id"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-history"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <BookingHistory />
          </ProtectedRoute>
        }
      />

      {/* Tracking */}
      <Route path="/track" element={<TrackBooking />} />
      <Route path="/track-booking" element={<TrackBooking />} />
      <Route path="/track-booking/:id" element={<TrackBooking />} />
      <Route path="/track/:id" element={<TrackBooking />} />

      {/* General pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["customer", "technician", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/become-partner" element={<BecomePartner />} />

      <Route
        path="/review"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
  path="/technician-track"
  element={
    <ProtectedRoute allowedRoles={["technician"]}>
      <TechnicianTrack />
    </ProtectedRoute>
  }
/>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
