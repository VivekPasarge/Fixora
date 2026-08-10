import { useState } from "react";

import api from "../../api/axios";

import "./VerifyOTP.css";

const VerifyOTP = ({
  booking,
  refreshBookings,
}) => {
  const [otp, setOtp] = useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     HANDLE OTP INPUT
  ========================================================= */

  const handleOtpChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Maximum 4 digits
    if (value.length > 4) {
      return;
    }

    setOtp(value);
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const handleVerify = async () => {
    if (!otp.trim()) {
      alert("Please enter OTP.");
      return;
    }

    if (otp.length !== 4) {
      alert("Please enter the 4 digit OTP.");
      return;
    }

    if (!booking?._id) {
      alert("Booking information is missing.");
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Your session has expired. Please login again."
        );

        return;
      }

      const response = await api.put(
        `/bookings/${booking._id}/verify-otp`,
        {
          otp: otp.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "OTP verified successfully."
      );

      setOtp("");

      // Refresh technician bookings.
      //
      // Backend changes:
      //
      // On The Way
      //      ↓
      // In Progress
      //
      if (refreshBookings) {
        await refreshBookings();
      }
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "OTP Verification Failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="verify-otp-card">

      <div className="verify-otp-header">

        <span className="verify-otp-badge">
          Service Verification
        </span>

        <h2>
          Customer OTP Verification
        </h2>

        <p>
          Ask the customer for the 4 digit OTP
          before starting the service.
        </p>

      </div>


      {/* ==============================================
          BOOKING ID
      ============================================== */}

      <div className="verify-booking-id">

        <span>
          Booking ID
        </span>

        <strong>
          {booking?.bookingId || "N/A"}
        </strong>

      </div>


      {/* ==============================================
          OTP INPUT
      ============================================== */}

      <div className="otp-input-section">

        <label htmlFor="customer-otp">
          Enter Customer OTP
        </label>

        <input
          id="customer-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="0000"
          value={otp}
          maxLength={4}
          onChange={handleOtpChange}
          disabled={loading}
        />

        <small>
          The customer should provide this OTP
          after you arrive at their location.
        </small>

      </div>


      {/* ==============================================
          VERIFY BUTTON
      ============================================== */}

      <button
        type="button"
        className="verify-otp-btn"
        onClick={handleVerify}
        disabled={
          loading ||
          otp.length !== 4
        }
      >
        {loading
          ? "Verifying..."
          : "Verify OTP"}
      </button>

    </div>
  );
};

export default VerifyOTP;