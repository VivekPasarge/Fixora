
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUser,
} from "react-icons/hi";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logo from "../../assets/logo/fixora-logo.png";

import {
  customerNavLinks,
  technicianNavLinks,
} from "./navLinks";

import "./Navbar.css";

// =========================================
// READ USER FROM LOCAL STORAGE
// =========================================

const getStoredUser = () => {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) return null;

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [user, setUser] = useState(getStoredUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const role = String(user?.role || "").toLowerCase();

  // =========================================
  // HIDE NAVBAR ON LOGIN PAGE
  // =========================================

  const isLoginPage = location.pathname === "/login";

  // =========================================
  // SYNC USER WHEN ROUTE CHANGES
  // =========================================

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  // =========================================
  // SYNC USER BETWEEN BROWSER TABS
  // =========================================

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // =========================================
  // ROLE-BASED DASHBOARD
  // =========================================

  const getHomePath = () => {
    if (!user || !localStorage.getItem("token")) {
      return "/";
    }

    switch (role) {
      case "customer":
        return "/customer-dashboard";

      case "technician":
        return user.profileCompleted
          ? "/technician-dashboard"
          : "/complete-profile";

      case "admin":
        return "/admin-dashboard";

      default:
        return "/";
    }
  };

  // =========================================
  // NAVIGATION LINKS
  // =========================================

  const activeNavLinks =
    role === "technician"
      ? technicianNavLinks
      : customerNavLinks;

  const getNavPath = (item) => {
    if (item.title?.trim().toLowerCase() === "home") {
      return getHomePath();
    }

    return item.path;
  };

  // =========================================
  // DASHBOARD PATH
  // =========================================

  const getDashboardPath = () => getHomePath();

  // =========================================
  // PROFILE PATH
  // =========================================

  const profilePath =
    role === "technician"
      ? "/technician-profile"
      : "/profile";

  // =========================================
  // CLOSE MENUS
  // =========================================

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    closeMenus();

    navigate("/", { replace: true });
  };

  // =========================================
  // SCROLL EFFECT
  // =========================================

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

  // =========================================
  // CLOSE MENUS ON NAVIGATION
  // =========================================

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // =========================================
  // PREVENT BODY SCROLL
  // =========================================

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // =========================================
  // HIDE COMPLETE NAVBAR ON LOGIN
  // =========================================

  if (isLoginPage) {
    return null;
  }

  // =========================================
  // NAVBAR UI
  // =========================================

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      {/* LOGO */}

      <Link
        to={getHomePath()}
        className="navbar-logo"
        onClick={closeMenus}
        aria-label="Fixora Home"
      >
        <img src={logo} alt="Fixora" />
      </Link>

      {/* DESKTOP NAVIGATION */}

      <nav className="navbar-menu">
        {activeNavLinks.map((item) => (
          <NavLink
            key={item.id}
            to={getNavPath(item)}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
            onClick={closeMenus}
          >
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* RIGHT SIDE */}

      <div className="navbar-buttons">
        {user ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setProfileOpen((previous) => !previous)
              }
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <HiOutlineUser size={19} />
              <span>{user.name || "My Account"}</span>
              <span>▼</span>
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="navbar-profile-header">
                  <h4>{user.name || "User"}</h4>
                  <p>{user.email || ""}</p>
                </div>

                <Link
                  to={getDashboardPath()}
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>

                {role === "customer" && (
                  <Link
                    to="/my-bookings"
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    My Bookings
                  </Link>
                )}

                {role === "technician" && (
                  <>
                    <Link
                      to="/technician-dashboard#available-jobs"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Available Jobs
                    </Link>

                    <Link
                      to="/technician-dashboard#assigned-jobs"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Assigned Jobs
                    </Link>
                  </>
                )}

                {role !== "admin" && (
                  <Link
                    to={profilePath}
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    Profile
                  </Link>
                )}

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
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>

            <Link
              to="/choose-account"
              className="btn btn-primary"
            >
              Register
            </Link>
          </>
        )}

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-menu-content">
              {activeNavLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={getNavPath(item)}
                  className={({ isActive }) =>
                    `mobile-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenus}
                >
                  {item.title}
                </NavLink>
              ))}

              <div className="mobile-menu-divider" />

              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="btn btn-secondary btn-block"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>

                  {role === "customer" && (
                    <Link
                      to="/my-bookings"
                      className="btn btn-secondary btn-block"
                      onClick={closeMenus}
                    >
                      My Bookings
                    </Link>
                  )}

                  {role !== "admin" && (
                    <Link
                      to={profilePath}
                      className="btn btn-secondary btn-block"
                      onClick={closeMenus}
                    >
                      Profile
                    </Link>
                  )}

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
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-block"
                    onClick={closeMenus}
                  >
                    Login
                  </Link>

                  <Link
                    to="/choose-account"
                    className="btn btn-primary btn-block"
                    onClick={closeMenus}
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
