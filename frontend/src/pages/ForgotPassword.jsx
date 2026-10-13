
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Forgot Password button clicked");

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending reset request...");
      console.log("FORGOT PASSWORD REQUEST RECEIVED");
console.log("Request body:", req.body);

      const response = await api.post(
        "/auth/forgot-password",
        { email: cleanEmail }
      );

      console.log("Forgot password response:", response.data);

      setMessage(
        response.data.message ||
          "If an account exists for this email, a reset link will be sent."
      );
    } catch (err) {
      console.error(
        "Forgot password request failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to send the reset email. Check the backend terminal."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-card">
        <Link to="/login" className="forgot-back-link">
          &larr; Back to Login
        </Link>

        <div className="forgot-brand">Fixora</div>

        <h1>Forgot Password?</h1>

        <p className="forgot-description">
          Enter your registered email address and we will
          send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">
            Email Address
          </label>

          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />

          {message && (
            <div className="forgot-message" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="forgot-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="forgot-footer">
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;
