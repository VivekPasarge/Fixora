
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: cleanEmail,
      });

      setMessage(
        response.data?.message ||
          "If an account exists for this email, a password reset link will be sent."
      );
    } catch (err) {
      console.error(
        "Forgot password request failed:",
        err.response?.data || err.message
      );

      if (err.response?.status === 404) {
        setError(
          "The password reset endpoint was not found. Please check the backend route."
        );
      } else if (err.response?.status === 503) {
        setError(
          "The reset email could not be sent. Please try again later."
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the server. Check your internet connection and try again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to process your request. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (message) setMessage("");
    if (error) setError("");
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
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={loading}
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
