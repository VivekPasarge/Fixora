
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineBell,
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

import api from "../../api/axios";
import socket from "../../socket";

import "./Navbar.css";

// ==========================================
// GET USER FROM LOCAL STORAGE
// ==========================================

const getStoredUser = () => {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) return null;

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("User data error:", error);
    return null;
  }
};

const Navbar = () => {
  const [user, setUser] = useState(getStoredUser);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const role = String(user?.role || "").toLowerCase();

  const token = localStorage.getItem("token");

  // ==========================================
  // AUTHENTICATION PAGES
  // ==========================================

  const authPages = [
    "/login",
    "/register",
    "/choose-account",
    "/forgot-password",
    "/reset-password",
  ];

  const isAuthPage = authPages.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
  );

  // ==========================================
  // ROLE-BASED VISIBILITY
  // ==========================================

  const showProfile =
    Boolean(token) &&
    Boolean(user) &&
    !isAuthPage;

  const showNotifications =
    showProfile &&
    (role === "customer" || role === "technician");

  // ==========================================
  // ROLE-BASED NAVIGATION
  // ==========================================

  const activeNavLinks =
    role === "technician"
      ? technicianNavLinks
      : role === "customer"
        ? customerNavLinks
        : [];

  // ==========================================
  // DASHBOARD PATH
  // ==========================================

  const getDashboardPath = () => {
    switch (role) {
      case "customer":
        return "/customer-dashboard";

      case "technician":
        return user?.profileCompleted
          ? "/technician-dashboard"
          : "/complete-profile";

      case "admin":
        return "/admin-dashboard";

      default:
        return "/";
    }
  };

  const getHomePath = () => {
    return showProfile ? getDashboardPath() : "/";
  };

  // ==========================================
  // PROFILE PATH
  // ==========================================

  const profilePath =
    role === "technician"
      ? "/technician-profile"
      : "/profile";

  // ==========================================
  // SYNC USER ON ROUTE CHANGE
  // ==========================================

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  // ==========================================
  // SYNC USER BETWEEN TABS
  // ==========================================

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // ==========================================
  // CLOSE MENUS
  // ==========================================

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  };

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    if (!localStorage.getItem("token")) return;

    try {
      setNotificationLoading(true);

      const [notificationResponse, countResponse] =
        await Promise.all([
          api.get("/notifications"),
          api.get("/notifications/unread-count"),
        ]);

      setNotifications(
        notificationResponse.data?.notifications || []
      );

      setUnreadCount(
        countResponse.data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Notification Fetch Error:",
        error.response?.data || error.message
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!showNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
  }, [showNotifications, location.pathname]);

  // ==========================================
  // REAL-TIME SOCKET NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!showNotifications) return;

    const handleNewNotification = (notification) => {
      setNotifications((previous) => {
        const exists = previous.some(
          (item) => item._id === notification._id
        );

        if (exists) return previous;

        return [notification, ...previous].slice(0, 30);
      });

      if (!notification.isRead) {
        setUnreadCount((previous) => previous + 1);
      }
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [showNotifications]);

  // ==========================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.find(
        (item) => item._id === notificationId
      );

      if (!notification || notification.isRead) return;

      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Mark Read Error:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);

    setNotificationOpen(false);

    if (notification.booking) {
      if (role === "technician") {
        navigate("/technician-dashboard");
      } else {
        navigate("/my-bookings");
      }
    }
  };

  // ==========================================
  // NOTIFICATION TIME
  // ==========================================

  const getNotificationTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const difference =
      Date.now() - notificationDate.getTime();

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";

    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days} day ago`;

    return notificationDate.toLocaleDateString("en-IN");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    setUser(null);
    setNotifications([]);
    setUnreadCount(0);

    closeMenus();

    navigate("/", { replace: true });
  };

  // ==========================================
  // SCROLL EFFECT
  // ==========================================

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

  // ==========================================
  // CLOSE MENUS ON NAVIGATION
  // ==========================================

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // ==========================================
  // MOBILE BODY SCROLL
  // ==========================================

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ==========================================
  // NAVBAR UI
  // ==========================================

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
            to={
              item.title?.trim().toLowerCase() === "home"
                ? getHomePath()
                : item.path
            }
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

        {showProfile ? (
          <>
            {/* NOTIFICATION BELL: CUSTOMER AND TECHNICIAN */}

            {showNotifications && (
              <div className="notification-wrapper">

                <button
                  type="button"
                  className={`notification-bell ${
                    unreadCount > 0 ? "has-unread" : ""
                  }`}
                  onClick={() => {
                    setNotificationOpen((previous) => !previous);
                    setProfileOpen(false);
                  }}
                  aria-label={`Notifications, ${unreadCount} unread`}
                  aria-expanded={notificationOpen}
                  aria-haspopup="true"
                >
                  <HiOutlineBell size={23} />

                  {unreadCount > 0 && (
                    <span className="notification-count">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      className="notification-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="notification-header">
                        <div>
                          <h3>Notifications</h3>

                          <p>
                            {unreadCount > 0
                              ? `${unreadCount} unread notifications`
                              : "You're all caught up"}
                          </p>
                        </div>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="mark-all-read"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notification-list">
                        {notificationLoading ? (
                          <div className="notification-empty">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="notification-empty">
                            <HiOutlineBell size={30} />
                            <h4>No notifications yet</h4>
                            <p>
                              Updates about your bookings will appear here.
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              type="button"
                              key={notification._id}
                              className={`notification-item ${
                                !notification.isRead ? "unread" : ""
                              }`}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <span className="notification-dot" />

                              <span className="notification-content">
                                <strong>{notification.title}</strong>
                                <span>{notification.message}</span>
                                <small>
                                  {getNotificationTime(
                                    notification.createdAt
                                  )}
                                </small>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* PROFILE BUTTON */}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setProfileOpen((previous) => !previous);
                setNotificationOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <HiOutlineUser size={19} />
              <span>{user?.name || "My Account"}</span>
              <span>▼</span>
            </button>

            {/* PROFILE DROPDOWN */}

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="navbar-profile-header">
                    <h4>{user?.name || "User"}</h4>
                    <p>{user?.email || ""}</p>
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
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {!isAuthPage && (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>

                <Link to="/choose-account" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </>
        )}

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((previous) => !previous)}
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
                  to={
                    item.title?.trim().toLowerCase() === "home"
                      ? getHomePath()
                      : item.path
                  }
                  className={({ isActive }) =>
                    `mobile-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenus}
                >
                  {item.title}
                </NavLink>
              ))}

              <div className="mobile-menu-divider" />

              {showProfile ? (
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
                  {!isAuthPage && (
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
