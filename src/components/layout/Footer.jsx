import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-[#040B16] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Company */}

          <div>
            <h2 className="text-3xl font-black text-white">
              <span className="text-cyan-400">Fix</span>ora
            </h2>

            <p className="mt-5 text-gray-400 leading-7">
              Fixora connects customers with trusted professionals for
              electrical, plumbing, cleaning, appliance repair and
              complete home maintenance services.
            </p>

            <div className="flex gap-4 mt-6">

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cyan-500 transition"
              >
                <FiFacebook />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cyan-500 transition"
              >
                <FiInstagram />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cyan-500 transition"
              >
                <FiTwitter />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cyan-500 transition"
              >
                <FiLinkedin />
              </a>

            </div>
          </div>

          {/* Links */}

          <div>
            <h3 className="text-xl font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">

              <Link className="text-gray-400 hover:text-cyan-400" to="/">
                Home
              </Link>

              <Link className="text-gray-400 hover:text-cyan-400" to="/services">
                Services
              </Link>

              <Link className="text-gray-400 hover:text-cyan-400" to="/providers">
                Providers
              </Link>

              <Link className="text-gray-400 hover:text-cyan-400" to="/about">
                About
              </Link>

              <Link className="text-gray-400 hover:text-cyan-400" to="/contact">
                Contact
              </Link>

            </div>
          </div>

          {/* Services */}

          <div>
            <h3 className="text-xl font-bold text-white">
              Popular Services
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-gray-400">

              <span>Electrical Repair</span>
              <span>Plumbing</span>
              <span>AC Repair</span>
              <span>Home Cleaning</span>
              <span>Painting</span>
              <span>Appliance Repair</span>

            </div>
          </div>

          {/* Contact */}

          <div>
            <h3 className="text-xl font-bold text-white">
              Contact
            </h3>

            <div className="mt-5 space-y-5">

              <div className="flex gap-3 text-gray-400">
                <FiPhone className="mt-1 text-cyan-400" />
                <span>+91 9876543210</span>
              </div>

              <div className="flex gap-3 text-gray-400">
                <FiMail className="mt-1 text-cyan-400" />
                <span>support@fixora.com</span>
              </div>

              <div className="flex gap-3 text-gray-400">
                <FiMapPin className="mt-1 text-cyan-400" />
                <span>Bengaluru, Karnataka</span>
              </div>

            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-gray-500">
          © {new Date().getFullYear()} Fixora. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}