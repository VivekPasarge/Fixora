
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Public pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Contact from "./components/Contact/Contact";
import About from "./components/About/About";
import BecomePartner from "./pages/BecomePartner";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChooseAccount from "./pages/ChooseAccount";
import ForgotPassword from "./pages/ForgotPassword";

// Customer pages
import CustomerDashboard from "./pages/CustomerDashboard";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import BookingHistory from "./pages/BookingHistory";
import BookingDetails from "./pages/BookingDetails";
import Payment from "./pages/Payment";
import Review from "./pages/Review";

// Technician pages
import TechnicianTrack from "./pages/TechnicianTrack";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianHome from "./pages/TechnicianHome";
import TechnicianProfile from "./pages/TechnicianProfile";
import TechnicianWallet from "./pages/TechnicianWallet";
import TechnicianWithdrawals from "./pages/TechnicianWithdrawals";
import TechnicianReviews from "./pages/TechnicianReviews";
import CompleteProfile from "./pages/CompleteProfile";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminWelcome from "./pages/AdminWelcome";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import TechnicianManagement from "./pages/TechnicianManagement";
import CustomerManagement from "./pages/CustomerManagement";
import BookingManagement from "./pages/BookingManagement";
import ServiceManagement from "./pages/ServiceManagement";

// Shared pages and components
import Profile from "./pages/Profile";
import TrackBooking from "./pages/TrackBooking";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

import socket from "./socket";

import ResetPassword from "./pages/ResetPassword";

//
import FixoraWelcome from "./pages/FixoraWelcome";

function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    socket.on("connect", handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  return (
    <Routes>
      {/* PUBLIC PAGES */}
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={<FixoraWelcome />} />
      <Route path="/services" element={<Services />} />
      <Route
        path="/services/:id"
        element={<ServiceDetails />}
      />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/become-partner"
        element={<BecomePartner />}
      />

      {/* AUTHENTICATION */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/choose-account"
        element={<ChooseAccount />}
      />
      <Route
  path="/reset-password"
  element={<ResetPassword />}
/>
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* PROFILE COMPLETION */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* CUSTOMER DASHBOARD */}
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

      {/* CUSTOMER BOOKING PAGES */}
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
      <Route
        path="/review"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Review />
          </ProtectedRoute>
        }
      />

      {/* TECHNICIAN PAGES */}
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
        path="/technician/withdrawals"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianWithdrawals />
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
      <Route
        path="/technician-track"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianTrack />
          </ProtectedRoute>
        }
      />

      {/* TRACKING PAGES */}
      <Route path="/track" element={<TrackBooking />} />
      <Route
        path="/track-booking"
        element={<TrackBooking />}
      />
      <Route
        path="/track-booking/:id"
        element={<TrackBooking />}
      />
      <Route
        path="/track/:id"
        element={<TrackBooking />}
      />

      {/* ADMIN PAGES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminWelcome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-withdrawals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminWithdrawals />
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

      {/* SHARED PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute
            allowedRoles={["customer", "technician", "admin"]}
          >
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/welcome" element={<FixoraWelcome />} />

      {/* 404 PAGE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
