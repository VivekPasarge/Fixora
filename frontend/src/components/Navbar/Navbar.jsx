import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUser,
} from "react-icons/hi";
import { Link, NavLink, useLocation } from "react-router-dom";

import logo from "../../assets/logo/fixora-logo.png";
import navLinks from "./navLinks";

import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();

  /* =========================
     GET LOGGED-IN USER
     ========================= */

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    user = null;
  }

  /* =========================
     DASHBOARD ROUTE
     ========================= */

  const getDashboardPath = () => {
    if (!user) {
      return "/login";
    }

    if (user.role === "admin") {
      return "/admin-dashboard";
    }

    if (user.role === "technician") {
      return "/technician-dashboard";
    }

    return "/customer";
  };

  /* =========================
     LOGOUT
     ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfileOpen(false);
    setMenuOpen(false);

    window.location.href = "/";
  };

  /* =========================
     SCROLL DETECTION
     ========================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================
     CLOSE MENUS ON ROUTE CHANGE
     ========================= */

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================
     PREVENT BODY SCROLL
     WHEN MOBILE MENU IS OPEN
     ========================= */

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      {/* =========================
          LOGO
          ========================= */}

      <Link
        to="/"
        className="navbar-logo"
        aria-label="Fixora Home"
        onClick={() => {
          setMenuOpen(false);
          setProfileOpen(false);
        }}
      >
        <img src={logo} alt="Fixora" />
      </Link>

      {/* =========================
          DESKTOP NAVIGATION
          ========================= */}

      <nav
        className="navbar-menu"
        aria-label="Primary Navigation"
      >
        {navLinks.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* =========================
          RIGHT SIDE
          ========================= */}

      <div className="navbar-buttons">

        {/* =========================
            LOGGED-IN USER
            ========================= */}

        {user ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setProfileOpen((prev) => !prev)
              }
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <HiOutlineUser
                size={19}
                style={{ marginRight: "8px" }}
              />

              <span>You</span>

              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "12px",
                }}
              >
                ▼
              </span>
            </button>

            {/* =========================
                PROFILE DROPDOWN
                ========================= */}

            {profileOpen && (
              <div className="profile-dropdown">

                {/* USER INFORMATION */}

                <div className="navbar-profile-header">
                  <h4>
                    {user.name || "User"}
                  </h4>

                  <p>
                    {user.email || "No email available"}
                  </p>
                </div>

              {/* DASHBOARD */}

<Link
  to={getDashboardPath()}
  className="dropdown-item"
>
  Dashboard
</Link>


{/* =========================
    TECHNICIAN LINKS
    ========================= */}

{user.role === "technician" && (
  <>
    <Link
      to="/technician-dashboard#available-jobs"
      className="dropdown-item"
    >
      Available Jobs
    </Link>

    <Link
      to="/technician-dashboard#assigned-jobs"
      className="dropdown-item"
    >
      Assigned Jobs
    </Link>

    <Link
      to="/technician-dashboard#active-job"
      className="dropdown-item"
    >
      Active Job
    </Link>

    <Link
      to="/technician-dashboard#earnings"
      className="dropdown-item"
    >
      Earnings
    </Link>
  </>
)}


{/* =========================
    CUSTOMER LINKS
    ========================= */}

{user.role === "customer" && (
  <Link
    to="/my-bookings"
    className="dropdown-item"
  >
    My Bookings
  </Link>
)}


{/* PROFILE */}

<Link
  to="/profile"
  className="dropdown-item"
>
  Profile
</Link>
                {/* LOGOUT */}

                <button
                  type="button"
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* LOGIN */}

            <Link
              to="/login"
              className="btn btn-secondary"
            >
              Login
            </Link>

            {/* REGISTER */}

            <Link
              to="/choose-account"
              className="btn btn-primary"
            >
              Register
            </Link>
          </>
        )}

        {/* =========================
            MOBILE MENU BUTTON
            ========================= */}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <HiOutlineX />
          ) : (
            <HiOutlineMenuAlt3 />
          )}
        </button>
      </div>

      {/* =========================
          MOBILE MENU
          ========================= */}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            <div className="mobile-menu-content">

              {/* MOBILE NAVIGATION */}

              {navLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `mobile-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  {item.title}
                </NavLink>
              ))}

              <div className="mobile-menu-divider" />

              {/* =========================
                  MOBILE USER ACTIONS
                  ========================= */}

              {user ? (
                <>
                  {/* DASHBOARD */}

                  <Link
                    to={getDashboardPath()}
                    className="btn btn-secondary btn-block"
                  >
                    Dashboard
                  </Link>

                  {/* MY BOOKINGS */}

                  {user.role === "customer" && (
                    <Link
                      to="/my-bookings"
                      className="btn btn-secondary btn-block"
                    >
                      My Bookings
                    </Link>
                  )}

                  {/* PROFILE */}

                  <Link
                    to="/profile"
                    className="btn btn-secondary btn-block"
                  >
                    Profile
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className="btn btn-secondary btn-block"
                  >
                    Login
                  </Link>

                  {/* REGISTER */}

                  <Link
                    to="/choose-account"
                    className="btn btn-primary btn-block"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;