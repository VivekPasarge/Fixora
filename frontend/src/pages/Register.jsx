import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiArrowRight,
} from "react-icons/fi";

import "./Register.css";

const Register = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

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
      role,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {

      setLoading(true);

      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          phone,
          password,
          role,
        }
      );

      setSuccess(response.data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "customer",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }

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

      <h2>Register</h2>

      <p className="register-subtitle">
        Create your Fixora account.
      </p>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      <div className="form-fields">

        {/* Full Name */}

        <div>

          <label className="form-label">
            Full Name
          </label>

          <div className="input-box">

            <FiUser className="input-icon" />

            <input
              type="text"
              name="name"
              placeholder="John Doe"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* Email */}

        <div>

          <label className="form-label">
            Email
          </label>

          <div className="input-box">

            <FiMail className="input-icon" />

            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* Phone */}

        <div>

          <label className="form-label">
            Phone Number
          </label>

          <div className="input-box">

            <FiPhone className="input-icon" />

            <input
              type="tel"
              name="phone"
              placeholder="+91 9876543210"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* Account Type */}

        <div>

          <label className="form-label">
            Account Type
          </label>

          <div className="input-box">

            <select
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
            >

              <option value="customer">
                Customer
              </option>

              <option value="technician">
                Technician
              </option>

            </select>

          </div>

        </div>

        {/* Password */}

        <div>

          <label className="form-label">
            Password
          </label>

          <div className="input-box">

            <FiLock className="input-icon" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="••••••••"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              <FiEye />
            </button>

          </div>

        </div>

        {/* Confirm Password */}

        <div>

          <label className="form-label">
            Confirm Password
          </label>

          <div className="input-box">

            <FiLock className="input-icon" />

            <input
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="••••••••"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirm(!showConfirm)
              }
            >
              <FiEye />
            </button>

          </div>

        </div>
                {/* Terms */}

        <label className="terms-label">

          <input type="checkbox" required />

          <span>

            I agree to the{" "}

            <Link
              to="#"
              className="terms-link"
            >
              Terms & Conditions
            </Link>

            {" "}and{" "}

            <Link
              to="#"
              className="terms-link"
            >
              Privacy Policy
            </Link>

          </span>

        </label>

        {/* Register Button */}

        <button
          type="submit"
          className="register-btn"
          disabled={loading}
        >

          {loading
            ? "Creating Account..."
            : "Create Account"}

          <FiArrowRight />

        </button>

        {/* Divider */}

        <div className="divider">

          <span>OR</span>

        </div>

        {/* Google */}

        <button
          type="button"
          className="google-btn"
        >

          Continue with Google

        </button>

        {/* Login */}

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