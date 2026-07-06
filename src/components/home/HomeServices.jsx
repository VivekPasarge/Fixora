import { motion } from "framer-motion";
import LiveTracking from "./LiveTracking";
import {
  MdOutlinePlumbing,
  MdOutlineLocalLaundryService,
  MdOutlineCleaningServices,
} from "react-icons/md";
import { HiOutlineLightBulb } from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";
import { FaPaintRoller, FaStar, FaHammer } from "react-icons/fa";

const services = [
  {
    icon: <MdOutlinePlumbing className="text-4xl" />,
    title: "Plumbing",
    rating: 4.7,
    desc: "Fix leaks, installations & more",
    color: "bg-blue-50 text-blue-500 border-blue-100",
  },
  {
    icon: <HiOutlineLightBulb className="text-4xl" />,
    title: "Electrical",
    rating: 4.6,
    desc: "Wiring, repair & other electrical work",
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
  {
    icon: <FaHammer className="text-4xl" />,
    title: "Carpentry",
    rating: 4.6,
    desc: "Furniture repair, wood work & more",
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    icon: <MdOutlineLocalLaundryService className="text-4xl" />,
    title: "Appliance Repair",
    rating: 4.7,
    desc: "AC, Fridge, Washing Machine & more",
    color: "bg-indigo-50 text-indigo-500 border-indigo-100",
  },
  {
    icon: <FaPaintRoller className="text-3xl" />,
    title: "Painting",
    rating: 4.5,
    desc: "Wall painting, texture & wall designs",
    color: "bg-rose-50 text-rose-500 border-rose-100",
  },
  {
    icon: <MdOutlineCleaningServices className="text-4xl" />,
    title: "Cleaning",
    rating: 4.6,
    desc: "Home, kitchen, sofa cleaning & more",
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
];

export default function HomeServices() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Popular <span className="text-[#0066FF]">Services</span>
          </h2>
          <div className="w-14 h-1 bg-[#0066FF] rounded-full mt-3.5" />
        </motion.div>

        {/* Services Grid + Live Tracking */}
        <div className="mt-14 grid xl:grid-cols-[1fr_340px] gap-6 xl:gap-8 items-stretch">
          {/* Service Cards (6 Columns on desktop, wrapping on smaller screens) */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    {/* Icon container */}
                    <div
                      className={`w-18 h-18 rounded-full border ${service.color} flex items-center justify-center mb-5 flex-shrink-0 shadow-inner`}
                    >
                      {service.icon}
                    </div>

                    <h3 className="text-[17px] font-bold text-slate-800 leading-snug">
                      {service.title}
                    </h3>

                    {/* Rating */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-100/50">
                      <FaStar className="text-[10px]" />
                      <span className="text-slate-700">{service.rating}</span>
                    </div>

                    <p className="mt-4 text-[13px] text-slate-500 leading-relaxed font-medium">
                      {service.desc}
                    </p>
                  </div>

                  <button className="mt-6 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0066FF] hover:text-[#0055E0] hover:gap-2.5 transition-all w-full pt-4 border-t border-slate-50">
                    Book Now
                    <FiArrowRight className="text-[11px]" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Tracking Card */}
          <div className="w-full xl:w-[340px] flex-shrink-0">
            <LiveTracking />
          </div>
        </div>

        {/* View All Services Button */}
        <div className="mt-14 flex justify-center">
          <button className="flex items-center gap-2 border-2 border-[#0066FF]/20 text-[#0066FF] hover:border-[#0066FF] hover:bg-[#0066FF]/5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            View All Services
          </button>
        </div>

        {/* Statistics Unified Bar */}
        <div className="mt-20 bg-[#F0F4FA] rounded-[32px] p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 items-center">
            {/* Stat 1 */}
            <div className="flex items-center gap-4 px-4">
              <div className="w-14 h-14 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] text-2xl flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#07111F] block">500+</span>
                <span className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5 block">Verified Professionals</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 px-4 border-t sm:border-t-0 sm:border-l border-slate-300/40">
              <div className="w-14 h-14 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8] text-2xl flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#07111F] block">10K+</span>
                <span className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5 block">Services Completed</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 px-4 border-t lg:border-t-0 lg:border-l border-slate-300/40">
              <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#A855F7] text-2xl flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#07111F] block">1000+</span>
                <span className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5 block">Happy Customers</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4 px-4 border-t sm:border-t-0 sm:border-l border-slate-300/40">
              <div className="w-14 h-14 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] text-2xl flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#07111F] block">99%</span>
                <span className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5 block">Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}