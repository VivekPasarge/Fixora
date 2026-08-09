import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
const [loginType, setLoginType] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending Login Request...");
      console.log("Sending:", {
  email,
  password,
});

      const response = await api.post("/auth/login", {
        email,
        password,
        loginType,
      });
      localStorage.setItem("token", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));

     // setSuccess("login Successful");

      // Save Token
      localStorage.setItem("token", response.data.token);

      // Save User
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert(response.data.message);

      // Redirect
      const user = response.data.user;

// Redirect based on role
if (user.role === "admin") {

  navigate("/admin-dashboard");

} else if (user.role === "technician") {

  if (user.profileCompleted) {

    navigate("/technician-dashboard");

  } else {

    navigate("/complete-profile");

  }

} else {

  navigate("/customer-dashboard");

}
      



    } catch (err) {
      console.log("========== LOGIN ERROR ==========");
      console.log(err);

      if (err.response) {
        console.log(err.response.data);
      }

      setError(
        err.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <div className="login-container">

          <div className="login-wrapper">

            {/* LEFT */}

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="login-left"
            >
              <div className="login-bg-circle"></div>

              <div className="login-left-content">

                <span className="login-badge">
                  FIXORA
                </span>

                <h1>
                  Welcome
                  <br />
                  Back
                </h1>

                <p>
                  Sign in to continue booking trusted professionals for your
                  home services.
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

            {/* RIGHT */}

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
                    style={{
                      color: "red",
                      marginBottom: "15px",
                    }}
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
      onClick={() => setLoginType("customer")}
    >
      Customer
    </button>

    <button
      type="button"
      className={loginType === "technician" ? "active" : ""}
      onClick={() => setLoginType("technician")}
    >
      Professional
    </button>

    <button
      type="button"
      className={loginType === "admin" ? "active" : ""}
      onClick={() => setLoginType("admin")}
    >
      Admin
    </button>

  </div>

</div>

                  {/* Email */}

                  <div>

                    <label className="form-label">
                      Email Address
                    </label>

                    <div className="input-box">

                      <FiMail className="input-icon" />

                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                      />

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
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        className="form-input"
                        value={formData.password}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>

                    </div>

                  </div>

                  {/* Remember */}

                  <div className="remember-row">

                    <label className="remember-label">
                      <input type="checkbox" />
                      Remember me
                    </label>

                    <Link
                      to="#"
                      className="forgot-link"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                  {/* Login Button */}

                  <button
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}

                    <FiArrowRight />
                  </button>

                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    className="google-btn"
                  >
                    Continue with Google
                  </button>

                  <p className="register-text">

                    Don't have an account?{" "}

                    <Link
                      to="/register"
                      className="register-link"
                    >
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