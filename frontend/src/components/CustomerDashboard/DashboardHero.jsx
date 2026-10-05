import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiSearch,
} from "react-icons/fi";

import api from "../../api/axios";

import "./DashboardHero.css";

const DashboardHero = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [greeting, setGreeting] = useState("");

  // =========================================================
  // GET GREETING BASED ON CURRENT TIME
  // =========================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening";
    }

    return "Good night";
  };

  // =========================================================
  // FETCH LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    let interval;

    const loadProfile = async () => {
      try {
        /*
         * First try the locally stored user.
         * This makes the dashboard appear immediately after login.
         */
        const storedUser = localStorage.getItem("user");

        if (storedUser && storedUser !== "undefined") {
          try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser) {
              setProfile(parsedUser);
            }
          } catch (error) {
            console.log("Stored user parsing error:", error);
          }
        }

        /*
         * Then get the latest profile from backend.
         * This ensures the name/email is real and up to date.
         */
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.user) {
          setProfile(response.data.user);

          /*
           * Keep localStorage synchronized.
           */
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        console.error("Dashboard Profile Error:", error);
      }
    };

    // Initial greeting
    setGreeting(getGreeting());

    // Fetch real user
    loadProfile();

    /*
     * Update greeting every minute.
     * So if the page remains open from afternoon
     * until evening, it changes automatically.
     */
    interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // USER NAME
  // =========================================================

  const userName = profile?.name || "Customer";

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name) => {
    if (!name) return "C";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initials = getInitials(userName);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const searchValue =
      event.target.elements.serviceSearch.value.trim();

    if (!searchValue) {
      navigate("/services");
      return;
    }

    navigate("/services", {
      state: {
        search: searchValue,
      },
    });
  };

  // =========================================================
  // BOOK SERVICE
  // =========================================================

  const handleBookService = () => {
    navigate("/services");
  };

  return (
    <section className="dashboard-hero-card">

      {/* Decorative background elements */}
      <div className="hero-decoration hero-decoration-one"></div>
      <div className="hero-decoration hero-decoration-two"></div>
      <div className="hero-decoration hero-decoration-three"></div>


      {/* =====================================================
          TOP ROW
      ===================================================== */}

      <div className="dashboard-hero-top">

        <div className="hero-greeting">
          <span className="greeting-pill">
            <span className="greeting-dot"></span>
            {greeting || "Welcome"}, {userName}
          </span>
        </div>

        <div className="hero-availability">
          <span className="availability-dot"></span>
          <span>Available now</span>
        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="dashboard-hero-content">

        <div className="hero-content-left">

          <h1>
            What can we help you with
            <span> today?</span>
          </h1>

          <p>
            Book trusted professionals for your home services
            and track your technician in real time.
          </p>


          {/* =================================================
              SEARCH + BOOK
          ================================================= */}

          <form
            className="hero-search-row"
            onSubmit={handleSearch}
          >

            <div className="hero-search-box">

              <FiSearch />

              <input
                type="text"
                name="serviceSearch"
                placeholder="Search for plumbing, AC repair..."
                autoComplete="off"
              />

            </div>

            <button
              type="button"
              className="hero-book-button"
              onClick={handleBookService}
            >
              <FiPlus />
              Book Service
            </button>

          </form>


          {/* =================================================
              TRUST FEATURES
          ================================================= */}

          <div className="hero-features">

            <div className="hero-feature">
              <FiCheckCircle />
              <span>Verified Professionals</span>
            </div>

            <div className="hero-feature">
              <FiClock />
              <span>Quick Service</span>
            </div>

            <div className="hero-feature">
              <FiShield />
              <span>Secure Booking</span>
            </div>

          </div>

        </div>


        {/* =====================================================
            USER PROFILE
        ===================================================== */}

        <div className="hero-user-area">

          <div className="hero-avatar-ring">

            <div className="hero-avatar">
              {initials}
            </div>

            <span className="hero-online-dot"></span>

          </div>

          <div className="hero-user-name">
            {userName}
          </div>

          <div className="hero-user-status">
            <span></span>
            Available now
          </div>

        </div>

      </div>

    </section>
  );
};

export default DashboardHero;