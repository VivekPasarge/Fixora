
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUser,
} from "react-icons/hi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import logo from "../../assets/logo/fixora-logo.png";
import navLinks, {
  customerNavLinks,
  technicianNavLinks,
} from "./navLinks";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const readUser = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        setUser(token && storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    };

    readUser();
    window.addEventListener("storage", readUser);

    return () => window.removeEventListener("storage", readUser);
  }, [location.pathname]);

  const role = String(user?.role || "").toLowerCase();

  const activeNavLinks =
    role === "technician"
      ? technicianNavLinks
      : customerNavLinks || navLinks;

  const getDashboardPath = () => {
    if (role === "admin") return "/admin-dashboard";

    if (role === "technician") {
      return user?.profileCompleted
        ? "/technician-dashboard"
        : "/complete-profile";
    }

    if (role === "customer") return "/customer-dashboard";

    return "/login";
  };

  const getHomePath = () => {
    if (role === "technician") {
      return user?.profileCompleted
        ? "/technician-home"
        : "/complete-profile";
    }

    if (role === "admin") return "/admin-dashboard";

    return "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const profilePath =
    role === "technician" ? "/technician-profile" : "/profile";

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <Link
        to={getHomePath()}
        className="navbar-logo"
        aria-label="Fixora Home"
        onClick={closeMenus}
      >
        <img src={logo} alt="Fixora" />
      </Link>

      <nav className="navbar-menu" aria-label="Primary Navigation">
        {activeNavLinks.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `navbar-link ${
                isActive ||
                (item.path === "/technician-home" &&
                  location.pathname === "/technician-dashboard")
                  ? "active"
                  : ""
              }`
            }
            onClick={closeMenus}
          >
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-buttons">
        {user ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProfileOpen((previous) => !previous)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <HiOutlineUser size={19} style={{ marginRight: "8px" }} />
              <span>{user.name || "You"}</span>
              <span style={{ marginLeft: "6px", fontSize: "12px" }}>
                ▼
              </span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="navbar-profile-header">
                  <h4>{user.name || "User"}</h4>
                  <p>{user.email || "No email available"}</p>
                </div>

                <Link
                  to={getDashboardPath()}
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>

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

                    <Link
                      to="/technician-dashboard#active-job"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Active Job
                    </Link>

                    <Link
                      to="/technician/wallet"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      Earnings
                    </Link>
                  </>
                )}

                {role === "customer" && (
                  <Link
                    to="/my-bookings"
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    My Bookings
                  </Link>
                )}

                <Link
                  to={profilePath}
                  className="dropdown-item"
                  onClick={closeMenus}
                >
                  Profile
                </Link>

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

            <Link to="/choose-account" className="btn btn-primary">
              Register
            </Link>
          </>
        )}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mobile-menu-content">
              {activeNavLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
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

                  {role === "technician" && (
                    <>
                      <Link
                        to="/technician-dashboard#available-jobs"
                        className="btn btn-secondary btn-block"
                        onClick={closeMenus}
                      >
                        Available Jobs
                      </Link>

                      <Link
                        to="/technician-dashboard#assigned-jobs"
                        className="btn btn-secondary btn-block"
                        onClick={closeMenus}
                      >
                        Assigned Jobs
                      </Link>

                      <Link
                        to="/technician/wallet"
                        className="btn btn-secondary btn-block"
                        onClick={closeMenus}
                      >
                        Earnings
                      </Link>
                    </>
                  )}

                  {role === "customer" && (
                    <Link
                      to="/my-bookings"
                      className="btn btn-secondary btn-block"
                      onClick={closeMenus}
                    >
                      My Bookings
                    </Link>
                  )}

                  <Link
                    to={profilePath}
                    className="btn btn-secondary btn-block"
                    onClick={closeMenus}
                  >
                    Profile
                  </Link>

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
