import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
import socket from "./socket";
import TechnicianReviews from "./pages/TechnicianReviews";

import BookingHistory from "./pages/BookingHistory";


function App() {

  // ==========================================
  // Socket Connection
  // ==========================================

  useEffect(() => {

    socket.on("connect", () => {
      console.log(
        "✅ Connected:",
        socket.id
      );
    });

    return () => {
      socket.off("connect");
    };

  }, []);


  return (

    <Routes>

      {/* ======================================
          HOME
      ====================================== */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* ======================================
          SERVICES
      ====================================== */}

      <Route
        path="/services"
        element={<Services />}
      />

      <Route
        path="/services/:id"
        element={<ServiceDetails />}
      />


      {/* ======================================
          BOOKING
      ====================================== */}

      <Route
        path="/booking/:id"
        element={<Booking />}
      />

      <Route
        path="/booking-success"
        element={<BookingSuccess />}
      />

      <Route
        path="/booking-details"
        element={<BookingDetails />}
      />

      <Route
        path="/payment/:id"
        element={<Payment />}
      />


      {/* ======================================
          AUTHENTICATION
      ====================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/choose-account"
        element={<ChooseAccount />}
      />

      <Route
        path="/complete-profile"
        element={<CompleteProfile />}
      />


      {/* ======================================
          CUSTOMER DASHBOARD
      ====================================== */}

      <Route
        path="/customer"
        element={<CustomerDashboard />}
      />

      <Route
        path="/customer-dashboard"
        element={<CustomerDashboard />}
      />


      {/* ======================================
          TECHNICIAN DASHBOARD
      ====================================== */}

      <Route
        path="/technician-dashboard"
        element={<TechnicianDashboard />}
      />


      {/* ======================================
          ADMIN DASHBOARD
      ====================================== */}

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />


      {/* ======================================
          MY BOOKINGS
      ====================================== */}

      <Route
        path="/my-bookings"
        element={<MyBookings />}
      />
      <Route
  path="/booking-history"
  element={<BookingHistory />}
/>


      {/* ======================================
          TRACKING
      ====================================== */}

      {/* Track without booking ID */}

      <Route
        path="/track"
        element={<TrackBooking />}
      />

      {/* Track without booking ID */}

      <Route
        path="/track-booking"
        element={<TrackBooking />}
      />

      {/* Track specific booking */}

      <Route
        path="/track-booking/:id"
        element={<TrackBooking />}
      />

      {/* Also support /track/:id */}

      <Route
        path="/track/:id"
        element={<TrackBooking />}
      />


      {/* ======================================
          ABOUT / CONTACT
      ====================================== */}

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />


      {/* ======================================
          PROFILE
      ====================================== */}

      <Route
        path="/profile"
        element={<Profile />}
      />


      {/* ======================================
          BECOME PARTNER
      ====================================== */}

      <Route
        path="/become-partner"
        element={<BecomePartner />}
      />


      {/* ======================================
          TECHNICIAN PROFILE
      ====================================== */}

      <Route
        path="/technician-profile"
        element={<TechnicianProfile />}
      />


      {/* ======================================
          REVIEW
      ====================================== */}

      <Route
        path="/review"
        element={<Review />}
      />


      {/* ======================================
          ADMIN MANAGEMENT
      ====================================== */}

      <Route
        path="/customer-management"
        element={<CustomerManagement />}
      />

      <Route
        path="/technician-management"
        element={<TechnicianManagement />}
      />

      <Route
        path="/booking-management"
        element={<BookingManagement />}
      />

      <Route
        path="/service-management"
        element={<ServiceManagement />}
      />


      {/* ======================================
          404
      ====================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />


<Route
  path="/technician/wallet"
  element={<TechnicianWallet />}
/>

<Route
  path="/technician/reviews"
  element={<TechnicianReviews />}
/>
    </Routes>

  );
}

export default App;