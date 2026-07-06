import { motion } from "framer-motion";
import { FiMapPin, FiCheckCircle, FiClock } from "react-icons/fi";

import technician from "../../assets/hero/technician.png";
import houseBg from "../../assets/hero/house-bg.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07111F] pt-28 pb-16 flex items-center">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,102,255,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-8">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 flex flex-col justify-center"
          >
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-white tracking-tight">
              Smart Solutions
              <span className="block mt-2 bg-gradient-to-r from-[#00F0FF] via-[#00F5C4] to-[#0066FF] bg-clip-text text-transparent">
                Trusted Care.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
              Book trusted home services in your city.
              <span className="block text-slate-400 text-base mt-1">Fast, reliable and hassle-free.</span>
            </p>

            {/* Pill Search Bar */}
            <div className="w-full max-w-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-3xl sm:rounded-full shadow-2xl p-1.5 gap-2">
                {/* Location */}
                <div className="flex items-center flex-1 px-4 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-slate-200">
                  <FiMapPin className="text-slate-400 text-xl mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    className="w-full outline-none text-slate-800 font-medium placeholder:text-slate-400 text-sm"
                  />
                </div>

                {/* Select Service Dropdown */}
                <div className="flex items-center flex-1 px-4 py-3 sm:py-0 justify-between cursor-pointer">
                  <select className="w-full bg-transparent outline-none text-slate-800 font-medium appearance-none cursor-pointer text-sm">
                    <option value="" disabled selected>Select Service</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="appliance">Appliance Repair</option>
                    <option value="painting">Painting</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0 pointer-events-none ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Book Button */}
                <button
                  className="px-8 py-3.5 sm:py-3 rounded-2xl sm:rounded-full bg-[#0066FF] hover:bg-[#0055E0] transition-all duration-300 font-semibold text-white shadow-lg text-sm flex-shrink-0"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Features Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-[#00F5C4] text-lg" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-[#00F5C4] text-lg" />
                <span>On-Time Service</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00F5C4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00F5C4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT GRAPHICS WITH OVERLAPPING FRAME */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end items-center min-h-[480px] lg:min-h-[550px] mt-12 lg:mt-0"
          >
            {/* Soft Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* House Background Card Frame */}
            <div className="relative w-[90%] sm:w-[480px] h-[320px] sm:h-[350px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-black/60 mr-4 sm:mr-10">
              <img
                src={houseBg}
                alt="Modern House"
                className="w-full h-full object-cover brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Technician & Van Overlap */}
            <img
              src={technician}
              alt="Technician"
              className="absolute z-10 w-[112%] sm:w-[580px] max-w-none object-contain translate-y-[-5px] translate-x-[-10px] sm:translate-x-[-20px] drop-shadow-[0_20px_45px_rgba(0,0,0,0.55)] pointer-events-none"
            />

            
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}