import { motion } from "framer-motion";
import {
  FiMapPin,
  FiSearch,
  FiStar,
  FiCheckCircle,
  FiShield,
  FiClock,
} from "react-icons/fi";

import technician from "../../assets/hero/technician.png";
import houseBg from "../../assets/hero/house-bg.png";

const features = [
  {
    icon: <FiCheckCircle />,
    title: "Verified Experts",
  },
  {
    icon: <FiShield />,
    title: "Secure Payments",
  },
  {
    icon: <FiClock />,
    title: "24/7 Support",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07111F] pt-24">
      {/* Background */}

      <img
        src={houseBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#07111F] via-[#07111F]/90 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        <div className="grid lg:grid-cols-2 items-center min-h-[90vh] gap-10">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >

            <span className="inline-flex items-center rounded-full bg-cyan-500/15 border border-cyan-500/30 px-4 py-2 text-cyan-300 text-sm">
              Trusted Home Services
            </span>

            <h1 className="mt-6 text-5xl lg:text-7xl font-black leading-tight text-white">
              Smart
              <span className="text-cyan-400"> Solutions.</span>

              <br />

              Trusted Care.
            </h1>

            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              Book trusted electricians, plumbers,
              AC repair, cleaning, painting,
              appliance repair and more in just
              a few clicks.
            </p>

            {/* Search */}

            <div className="mt-10 bg-white rounded-2xl p-3 shadow-2xl">

              <div className="grid md:grid-cols-3 gap-3">

                <div className="flex items-center gap-3 px-4">

                  <FiMapPin
                    className="text-cyan-500"
                    size={20}
                  />

                  <input
                    type="text"
                    placeholder="Your Location"
                    className="w-full outline-none py-3"
                  />

                </div>

                <div className="flex items-center gap-3 px-4">

                  <FiSearch
                    className="text-cyan-500"
                    size={20}
                  />

                  <input
                    type="text"
                    placeholder="Search Service"
                    className="w-full outline-none py-3"
                  />

                </div>

                <button className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition">
                  Book Now
                </button>

              </div>

            </div>

            {/* Features */}

            <div className="mt-10 flex flex-wrap gap-6">

              {features.map((item) => (

                <div
                  key={item.title}
                  className="flex items-center gap-3 text-white"
                >

                  <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center text-black">

                    {item.icon}

                  </div>

                  <span className="font-medium">
                    {item.title}
                  </span>

                </div>

              ))}

            </div>

          </motion.div>
                    {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Technician */}

            <img
              src={technician}
              alt="Technician"
              className="relative z-20 w-full max-w-xl object-contain"
            />

            {/* Rating Card */}

            <motion.div
              initial={{ y: -20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-12 left-0 lg:-left-8 z-30 bg-white rounded-2xl shadow-xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                  <FiStar className="text-white" />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    4.9 Rating
                  </h3>

                  <p className="text-sm text-gray-500">
                    20k+ Reviews
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Experience Card */}

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute bottom-24 right-0 bg-white rounded-2xl shadow-xl p-5 z-30"
            >
              <h2 className="text-3xl font-black text-cyan-500">
                12+
              </h2>

              <p className="text-gray-600">
                Years Experience
              </p>
            </motion.div>

            {/* Customers */}

            <div className="absolute bottom-0 left-4 bg-[#07111F] border border-cyan-500/30 rounded-2xl px-6 py-5 z-30 shadow-xl">
              <h3 className="text-3xl font-black text-cyan-400">
                15K+
              </h3>

              <p className="text-gray-300">
                Happy Customers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}