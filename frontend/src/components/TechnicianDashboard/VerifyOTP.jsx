import { useState } from "react";
import api from "../../api/axios";
import "./VerifyOTP.css";

const VerifyOTP = ({ booking, refreshBookings }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.trim() === "") {
      alert("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${booking._id}/verify-otp`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      setOtp("");

      if (refreshBookings) {
        refreshBookings();
      }

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "OTP Verification Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="verify-otp-card">

      <h2>Customer OTP Verification</h2>

      <p>
        Booking ID :
        <strong> {booking.bookingId}</strong>
      </p>

      <input
        type="text"
        placeholder="Enter 4 Digit OTP"
        value={otp}
        maxLength={4}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

    </div>
  );
};

export default VerifyOTP;