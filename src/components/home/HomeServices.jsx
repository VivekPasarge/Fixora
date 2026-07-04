import { motion } from "framer-motion";
import LiveTracking from "./LiveTracking";
import {
  FiTool,
  FiHome,
  FiZap,
  FiDroplet,
  FiWind,
  FiSettings,
  FiArrowRight,
} from "react-icons/fi";

const services = [
  {
    icon: <FiZap size={30} />,
    title: "Electrical",
    desc: "Certified electricians for repairs, installations and maintenance.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: <FiDroplet size={30} />,
    title: "Plumbing",
    desc: "Leak repairs, bathroom fittings and complete plumbing solutions.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: <FiWind size={30} />,
    title: "AC Repair",
    desc: "Fast AC installation, servicing and gas refilling by experts.",
    color: "from-sky-400 to-indigo-500",
  },
  {
    icon: <FiHome size={30} />,
    title: "Home Cleaning",
    desc: "Professional deep cleaning for homes, offices and apartments.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: <FiSettings size={30} />,
    title: "Appliance Repair",
    desc: "Repair washing machines, refrigerators, TVs and more.",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: <FiTool size={30} />,
    title: "General Maintenance",
    desc: "Trusted technicians for all home maintenance requirements.",
    color: "from-pink-500 to-rose-500",
  },
];

export default function HomeServices() {
  return (
    <section className="bg-[#07111F] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-cyan-400 font-semibold uppercase tracking-widest">
            Our Services
          </span>

          <h2 className="mt-4 text-4xl lg:text-5xl font-black text-white">
            Professional Home Services
          </h2>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            From plumbing and electrical work to home cleaning,
            appliance repair and maintenance, Fixora connects you
            with trusted professionals in minutes.
          </p>
        </motion.div>

        {/* Services + Live Tracking */}

        <div className="mt-16 grid lg:grid-cols-4 gap-8">

          {/* Service Cards */}

          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-2"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white`}
                  >
                    {service.icon}
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-white">
                    {service.title}
                  </h3>

                  <p className="mt-4 text-gray-400 leading-7">
                    {service.desc}
                  </p>

                  <button className="mt-8 inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                    Explore Service
                    <FiArrowRight />
                  </button>
                </motion.div>
              ))}

            </div>
          </div>

          {/* Live Tracking */}

          <div className="lg:col-span-1">
            <LiveTracking />
          </div>

        </div>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-10 lg:p-16"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

            <div>
              <span className="text-cyan-400 uppercase tracking-widest font-semibold">
                Need Help?
              </span>

              <h2 className="mt-4 text-3xl lg:text-5xl font-black text-white">
                Book a Trusted Professional Today
              </h2>

              <p className="mt-5 max-w-2xl text-gray-300 leading-7">
                Whether it's an emergency repair or routine maintenance,
                Fixora connects you with verified professionals who arrive
                on time and get the job done right.
              </p>
            </div>

            <button className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition">
              Book a Service
            </button>

          </div>
        </motion.div>
      </div>
    </section>
  );
}