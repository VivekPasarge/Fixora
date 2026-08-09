import { motion } from "framer-motion";
import {
  FiHome,
  FiMapPin,
  FiNavigation,
  FiTruck,
} from "react-icons/fi";

import "./TrackingCard.css";

const TrackingCard = ({ technician }) => {

  return (

    <div className="tracking-card">

      {/* Background */}

      <div className="tracking-bg"></div>

      <div className="tracking-pattern"></div>

      <div className="tracking-content">

        {/* Header */}

        <div className="tracking-header">

          <div>

            <p className="tracking-subtitle">
              Live Tracking
            </p>

            <h2 className="tracking-title">
              Technician On The Way
            </h2>

          </div>

          <div className="tracking-live">

            <span className="live-dot"></span>

            LIVE

          </div>

        </div>

        {/* Map */}

        <div className="tracking-map">

          {/* Route */}

          <svg
            className="tracking-route"
            viewBox="0 0 600 420"
          >

            <motion.path
              d="M95 335 C170 275 255 215 345 170 C430 125 485 95 520 75"

              fill="none"

              stroke="#2563EB"

              strokeWidth="7"

              strokeLinecap="round"

              strokeDasharray="14 10"

              initial={{
                pathLength:0,
              }}

              animate={{
                pathLength:1,
              }}

              transition={{
                duration:2,
              }}

            />

          </svg>

          {/* Home */}

          <div className="home-marker">

            <motion.div

              className="home-icon"

              animate={{
                scale:[1,1.12,1],
              }}

              transition={{
                duration:2,
                repeat:Infinity,
              }}

            >

              <FiHome size={30}/>

            </motion.div>

            <p className="home-text">

              Your Home

            </p>

          </div>
                    {/* Technician */}

          <motion.div
            className="truck-marker"
            animate={{
              x: [-8, 8, -8],
              y: [0, -6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >

            <div className="truck-icon">

              <FiTruck size={30} />

            </div>

            <p className="truck-name">

              Rahul

            </p>

          </motion.div>

          {/* Destination Pin */}

          <motion.div
            className="location-pin"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [1, .65, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >

            <FiMapPin size={34} />

          </motion.div>

          {/* ETA Card */}

          <motion.div
            className="eta-card"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >

            <div className="eta-header">

              <FiNavigation />

              <span>ETA</span>

            </div>

            <h2 className="eta-time">

              {technician.eta}

            </h2>

            <p className="eta-distance">

              {technician.distance} Away

            </p>

          </motion.div>

        </div>

      </div>

    </div>

  );

};

export default TrackingCard;