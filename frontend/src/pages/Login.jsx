
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import Navbar from "../components/Navbar/Navbar";
import api from "../api/axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveSessionAndRedirect = (token, user) => {
    if (!token || !user) {
      throw new Error("The server returned an invalid login response.");
    }

    const role = String(user.role || "").toLowerCase();

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    if (role === "technician") {
      navigate(
        user.profileCompleted
          ? "/technician-home"
          : "/complete-profile",
        { replace: true }
      );
      return;
    }

    if (role === "customer") {
      navigate("/customer-dashboard", { replace: true });
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error("Your account role is not recognized.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
        loginType,
      });

      const { token, user } = response.data || {};

      if (!token || !user) {
        setError("The server returned an invalid login response.");
        return;
      }

      if (String(user.role).toLowerCase() !== loginType) {
        setError(
          `This account cannot use the selected ${loginType} login option.`
        );
        return;
      }

      saveSessionAndRedirect(token, user);
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    if (loginType !== "customer") {
      setError("Google login is available for customers only.");
      return;
    }

    if (!credentialResponse?.credential) {
      setError("Google did not return a valid credential. Please try again.");
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { token, user } = response.data || {};

      if (!token || !user || user.role !== "customer") {
        throw new Error("Invalid customer login response.");
      }

      saveSessionAndRedirect(token, user);
    } catch (err) {
      console.error(
        "Google login failed:",
        err.response?.data?.message || err.message
      );

      setError(
        err.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <div className="login-container">
          <div className="login-wrapper">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="login-left"
            >
              <div className="login-bg-circle" />

              <div className="login-left-content">
                <span className="login-badge">FIXORA</span>

                <h1>
                  Welcome
                  <br />
                  Back
                </h1>

                <p>
                  Sign in to continue booking trusted professionals
                  for your home services.
                </p>

                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <FiShield size={26} />
                    </div>
                    <div>
                      <h3>Verified Professionals</h3>
                      <p>Background checked technicians.</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <FiClock size={26} />
                    </div>
                    <div>
                      <h3>Fast Booking</h3>
                      <p>Book services within minutes.</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">
                      <FiCheckCircle size={26} />
                    </div>
                    <div>
                      <h3>Trusted by Thousands</h3>
                      <p>Premium home service experience.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="login-right"
            >
              <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <p className="login-subtitle">
                  Enter your account details below.
                </p>

                {error && (
                  <p
                    role="alert"
                    style={{ color: "red", marginBottom: "15px" }}
                  >
                    {error}
                  </p>
                )}

                <div className="login-type">
                  <label>Login As</label>

                  <div className="login-type-options">
                    <button
                      type="button"
                      className={loginType === "customer" ? "active" : ""}
                      onClick={() => {
                        setLoginType("customer");
                        setError("");
                      }}
                    >
                      Customer
                    </button>

                    <button
                      type="button"
                      className={loginType === "technician" ? "active" : ""}
                      onClick={() => {
                        setLoginType("technician");
                        setError("");
                      }}
                    >
                      Professional
                    </button>

                    <button
                      type="button"
                      className={loginType === "admin" ? "active" : ""}
                      onClick={() => {
                        setLoginType("admin");
                        setError("");
                      }}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="login-email">
                    Email Address
                  </label>

                  <div className="input-box">
                    <FiMail className="input-icon" />

                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>

                  <div className="input-box">
                    <FiLock className="input-icon" />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
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
                </div>

                <div className="remember-row">
                  <label className="remember-label">
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading || googleLoading}
                >
                  {loading ? "Logging in..." : "Login"}
                  {!loading && <FiArrowRight />}
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <div
                  className="google-login-container"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    margin: "12px 0",
                  }}
                >
                  {googleLoading ? (
                    <p>Signing in with Google...</p>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setError("Google sign-in was unsuccessful.");
                      }}
                      text="continue_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                      width="280"
                    />
                  )}
                </div>

                <p className="register-text">
                  Don't have an account?{" "}
                  <Link to="/register" className="register-link">
                    Create Account
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
