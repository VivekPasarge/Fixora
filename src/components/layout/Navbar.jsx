import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiUser, FiUserPlus } from "react-icons/fi";
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
                      ? "text-[#00F5C4]"
                      : "text-white hover:text-[#00F5C4]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}

                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-[10%] bottom-[-8px] w-[80%] h-[3px] bg-[#00F5C4] rounded-full"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#00F5C4]/30
              text-[#00F5C4] hover:bg-[#00F5C4]/10 transition font-medium text-sm"
            >
              <FiUserPlus size={16} />
              Become a Provider
            </button>

            <button
              className="flex items-center gap-2
              px-5 py-2.5 rounded-xl
              bg-[#0066FF] hover:bg-[#0055E0]
              text-white transition font-medium text-sm shadow-lg shadow-blue-600/20"
            >
              <FiUser size={16} />
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
                      ? "text-[#00F5C4] font-semibold"
                      : "text-white hover:text-[#00F5C4]"
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              <button
                className="mt-2 py-3 rounded-xl flex items-center justify-center gap-2
                border border-[#00F5C4]/30
                text-[#00F5C4]"
              >
                <FiUserPlus size={18} />
                Become a Provider
              </button>

              <button
                className="py-3 rounded-xl flex items-center justify-center gap-2
                bg-[#0066FF]
                text-white"
              >
                <FiUser size={18} />
                Login / Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}