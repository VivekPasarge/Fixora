import { FiMapPin, FiPhone, FiStar } from "react-icons/fi";

export default function LiveTracking() {
  return (
    <div className="bg-[#0B1220] rounded-3xl p-6 text-white shadow-2xl border border-white/10">

      {/* Header */}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-2xl font-bold">
            Live Tracking
          </h3>

          <p className="text-gray-400 text-sm">
            Track your service expert in real time
          </p>
        </div>

        <span className="text-green-400 text-sm font-semibold">
          ● Live
        </span>
      </div>

      {/* Map */}

      <div className="relative overflow-hidden rounded-2xl bg-gray-100 h-72">

        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=700"
          alt="Map"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-10 left-10 w-5 h-5 bg-blue-600 rounded-full border-4 border-white" />

        <div className="absolute bottom-12 right-12 w-5 h-5 bg-black rounded-full border-4 border-white" />

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M18 22 C40 40,50 55,82 78"
            stroke="#2563eb"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 3"
          />
        </svg>

      </div>

      {/* Technician */}

      <div className="mt-5 flex items-center justify-between bg-white rounded-2xl p-4">

        <div className="flex items-center gap-3">

          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt=""
            className="w-14 h-14 rounded-full"
          />

          <div>

            <h4 className="font-bold text-gray-900">
              Ramesh Kumar
            </h4>

            <p className="text-gray-500 text-sm">
              Plumber
            </p>

            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <FiStar />
              4.8
            </div>

          </div>

        </div>

        <button className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <FiPhone />
        </button>

      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
        <FiMapPin />
        Technician is approximately 10 minutes away.
      </div>

    </div>
  );
}