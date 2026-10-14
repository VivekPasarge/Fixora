
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import api from "../api/axios";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token || !email) {
      setError(
        "This password reset link is incomplete. Please request a new link."
      );
      return;
    }

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
        token,
        email,
        password,
      });

      setSuccess(
        response.data?.message ||
          "Password reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      // Allow the user to read the success message before redirecting.
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

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        <Link to="/login" className="reset-back-link">
          &larr; Back to Login
        </Link>

        <div className="reset-brand">Fixora</div>

        <div className="reset-icon" aria-hidden="true">
          <FiLock />
        </div>

        <h1>Reset Your Password</h1>

        <p className="reset-description">
          Create a new password for your Fixora account.
          Choose a strong password you have not used before.
        </p>

        {!token || !email ? (
          <div className="reset-error" role="alert">
            This reset link is incomplete or invalid. Please request a new
            password reset email.
            <Link to="/forgot-password" className="reset-request-link">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="reset-password">New Password</label>

            <div className="reset-input-wrap">
              <FiLock className="reset-input-icon" />

              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <p className="reset-hint">Use at least 8 characters.</p>

            <label htmlFor="reset-confirm-password">
              Confirm New Password
            </label>

            <div className="reset-input-wrap">
              <FiLock className="reset-input-icon" />

              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="reset-visibility-button"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
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
