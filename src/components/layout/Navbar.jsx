import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../assets/logos/fixora-logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Providers", path: "/providers" },
  { name: "Bookings", path: "/bookings" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030712]/95 backdrop-blur-md shadow-lg"
          : "bg-[#030712]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}

          <NavLink
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Fixora"
              className="h-12 object-contain"
            />
          </NavLink>

          {/* Desktop Menu */}

          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition ${
                    isActive
                      ? "text-cyan-400"
                      : "text-white hover:text-cyan-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}

                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 -bottom-2 w-full h-[2px] bg-cyan-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Buttons */}

          <div className="hidden lg:flex items-center gap-4">
            <button
              className="px-5 py-2 rounded-xl border border-cyan-500
              text-cyan-400 hover:bg-cyan-500 hover:text-black
              transition"
            >
              Become a Provider
            </button>

            <button
              className="flex items-center gap-2
              px-5 py-2 rounded-xl
              bg-blue-600 hover:bg-blue-700
              text-white transition"
            >
              <FiUser size={18} />
              Login / Sign Up
            </button>
          </div>

          {/* Mobile */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white"
          >
            {mobileOpen ? (
              <HiOutlineX size={30} />
            ) : (
              <HiOutlineMenuAlt3 size={30} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="lg:hidden bg-[#08101f]"
          >
            <div className="flex flex-col px-6 py-6 gap-5">
              {navLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "text-cyan-400"
                      : "text-white"
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              <button
                className="mt-2 py-3 rounded-xl
                border border-cyan-500
                text-cyan-400"
              >
                Become a Provider
              </button>

              <button
                className="py-3 rounded-xl
                bg-blue-600
                text-white"
              >
                Login / Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}