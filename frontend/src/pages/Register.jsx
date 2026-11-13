
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import api from "../api/axios";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";

import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const password = formData.password;

  const passwordChecks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const strengthScore = passwordChecks.filter(Boolean).length;

  const passwordStrength = !password
    ? ""
    : strengthScore <= 2
    ? "weak"
    : strengthScore <= 4
    ? "medium"
    : "strong";

  // Confirm password validation
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Normal registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: "customer",
      });

      setSuccess(
        response.data?.message ||
          "Account created successfully!"
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirm(false);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err) {
      console.error("Registration Error:", err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // Google registration / login
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setSuccess("");

    if (!credentialResponse?.credential) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error("Invalid Google authentication response.");
      }

      if (user.role !== "customer") {
        throw new Error(
          "Google authentication is available for customers only."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/customer-dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error("Google Registration Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Google registration failed. Please try again."
      );

    } finally {
      setGoogleLoading(false);
    }
  };

  // Google authentication failure
  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="register-right"
    >
      <form
        className="register-form"
        onSubmit={handleSubmit}
      >
        <h2>Create Account</h2>

        <p className="register-subtitle">
          Create your Fixora account.
        </p>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        <div className="form-fields">

          {/* Full Name */}
          <div>
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>

            <div className="input-box">
              <FiUser className="input-icon" />

              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="John Doe"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label" htmlFor="register-email">
              Email
            </label>

            <div className="input-box">
              <FiMail className="input-icon" />

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="john@example.com"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="form-label" htmlFor="register-phone">
              Phone Number
            </label>

            <div className="input-box">
              <FiPhone className="input-icon" />

              <input
                id="register-phone"
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="register-password">
              Password
            </label>

            <div className="input-box">
              <FiLock className="input-icon" />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <span
                      key={bar}
                      className={
                        bar <= strengthScore
                          ? `strength-bar ${passwordStrength}`
                          : "strength-bar"
                      }
                    />
                  ))}
                </div>

                <p className={`strength-text ${passwordStrength}`}>
                  Password strength: {passwordStrength.toUpperCase()}
                </p>

                <p className="password-hint">
                  Use at least 8 characters, uppercase and lowercase
                  letters, a number and a special character.
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="form-label"
              htmlFor="register-confirm-password"
            >
              Confirm Password
            </label>

            <div className="input-box">
              <FiLock className="input-icon" />

              <input
                id="register-confirm-password"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirm((previous) => !previous)
                }
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password Match Feedback */}
            {formData.confirmPassword && (
              <p
                className={
                  passwordsMatch
                    ? "password-match success"
                    : "password-match error"
                }
                role="status"
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <label className="terms-label">
            <input
              type="checkbox"
              required
            />

            <span>
              I agree to the{" "}
              <Link to="#" className="terms-link">
                Terms & Conditions
              </Link>
              {" "}and{" "}
              <Link to="#" className="terms-link">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Create Account Button */}
          <button
            type="submit"
            className="register-btn"
            disabled={loading || googleLoading}
          >
            {loading ? "Creating Account..." : "Create Account"}

            {!loading && <FiArrowRight />}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Continue with Google */}
          <div
            className="google-login-container"
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              minHeight: "42px",
              margin: "5px 0",
            }}
          >
            {googleLoading ? (
              <p>Connecting to Google...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                size="medium"
                shape="rectangular"
                theme="outline"
                width="300"
              />
            )}
          </div>

          {/* Google Information */}
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Continue with Google to create your customer account
            or sign in to an existing customer account.
          </p>

          {/* Login Link */}
          <p className="login-text">
            Already have an account?{" "}

            <Link
              to="/login"
              className="login-link"
            >
              Login
            </Link>
          </p>

        </div>
      </form>
    </motion.div>
  );
};

export default Register;
