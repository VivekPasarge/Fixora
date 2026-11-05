
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";

import api from "../api/axios";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = (searchParams.get("email") || "")
    .trim()
    .toLowerCase();

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verify the 6-digit OTP.
  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing. Please request a new OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-reset-otp", {
        email,
        otp,
      });

      setOtpVerified(true);

      setSuccess(
        response.data?.message ||
          "OTP verified successfully. Create your new password."
      );
    } catch (err) {
      console.error(
        "OTP verification failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update the password after OTP verification.
  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        email,
        password,
      });

      setSuccess(
        response.data?.message ||
          "Password reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(
        "Reset password failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Request another OTP.
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing. Please request a new OTP.");
      return;
    }

    try {
      setResending(true);

      const response = await api.post("/auth/forgot-password", {
        email,
      });

      setOtp("");
      setOtpVerified(false);

      setSuccess(
        response.data?.message ||
          "If an account exists for this email, a new OTP will be sent."
      );
    } catch (err) {
      console.error(
        "Resend OTP failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <main className="reset-password-page">
        <section className="reset-password-card">
          <div className="reset-brand">Fixora</div>

          <h1>Invalid Request</h1>

          <div className="reset-error" role="alert">
            Email address is missing. Please request a new OTP.
          </div>

          <Link
            to="/forgot-password"
            className="reset-request-link"
          >
            Go to Forgot Password
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        <Link to="/login" className="reset-back-link">
          &larr; Back to Login
        </Link>

        <div className="reset-brand">Fixora</div>

        <div className="reset-icon" aria-hidden="true">
          {otpVerified ? <FiLock /> : <FiMail />}
        </div>

        <h1>
          {otpVerified ? "Create New Password" : "Verify Your OTP"}
        </h1>

        <p className="reset-description">
          {otpVerified
            ? "Your email has been verified. Enter your new password."
            : `Enter the 6-digit OTP sent to ${email}.`}
        </p>

        {!otpVerified ? (
          <form onSubmit={handleVerifyOTP}>
            <label htmlFor="reset-otp">6-Digit OTP</label>

            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter 6-digit OTP"
              required
              disabled={loading}
            />

            {error && (
              <div className="reset-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-success" role="status">
                <FiCheckCircle />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="reset-submit-button"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="reset-submit-button"
              onClick={handleResendOTP}
              disabled={resending || loading}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="reset-password">
              New Password
            </label>

            <div className="reset-input-wrap">
              <FiLock className="reset-input-icon" />

              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading || Boolean(success)}
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <p className="reset-hint">
              Use at least 8 characters.
            </p>

            <label htmlFor="reset-confirm-password">
              Confirm New Password
            </label>

            <div className="reset-input-wrap">
              <FiLock className="reset-input-icon" />

              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading || Boolean(success)}
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {error && (
              <div className="reset-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-success" role="status">
                <FiCheckCircle />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="reset-submit-button"
              disabled={loading || Boolean(success)}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="reset-footer">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
