import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import api from "../../api/axios";

import "./AvailableTechnicians.css";

const AvailableTechnicians = ({ serviceId }) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!serviceId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/services/${serviceId}/technicians`
        );

        setTechnicians(
          response.data?.technicians || []
        );
      } catch (error) {
        console.error(
          "Fetch Technicians Error:",
          error
        );

        setTechnicians([]);

        setError(
          error.response?.data?.message ||
            "Unable to load technicians."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, [serviceId]);

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <section className="available-technicians">
        <div className="technicians-heading">
          <div>
            <span className="technicians-label">
              FIXORA PARTNERS
            </span>

            <h2>Available Technicians</h2>

            <p>
              Finding approved technicians for this
              service.
            </p>
          </div>
        </div>

        <div className="technicians-loading">
          <FiLoader className="technicians-spinner" />

          <span>
            Loading approved technicians...
          </span>
        </div>
      </section>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (error) {
    return (
      <section className="available-technicians">
        <div className="technicians-heading">
          <div>
            <span className="technicians-label">
              FIXORA PARTNERS
            </span>

            <h2>Available Technicians</h2>
          </div>
        </div>

        <div className="technicians-message error">
          <FiUsers />

          <p>{error}</p>
        </div>
      </section>
    );
  }

  // =====================================================
  // No Technicians
  // =====================================================

  if (technicians.length === 0) {
    return (
      <section className="available-technicians">
        <div className="technicians-heading">
          <div>
            <span className="technicians-label">
              FIXORA PARTNERS
            </span>

            <h2>Available Technicians</h2>

            <p>
              Approved technicians for this service
              will appear here.
            </p>
          </div>
        </div>

        <div className="technicians-message">
          <FiUsers />

          <div>
            <h3>No technicians available yet</h3>

            <p>
              There are currently no approved
              technicians for this service.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // Technicians
  // =====================================================

  return (
    <section className="available-technicians">
      <div className="technicians-heading">
        <div>
          <span className="technicians-label">
            FIXORA PARTNERS
          </span>

          <h2>Available Technicians</h2>

          <p>
            Trusted professionals approved by Fixora
            for this service.
          </p>
        </div>

        <div className="technician-count">
          <FiUsers />

          <span>
            {technicians.length}{" "}
            {technicians.length === 1
              ? "Technician"
              : "Technicians"}
          </span>
        </div>
      </div>

      <div className="technicians-grid">
        {technicians.map((technician) => {
          const initials =
            technician.name
              ?.split(" ")
              .map((word) =>
                word.charAt(0)
              )
              .join("")
              .slice(0, 2)
              .toUpperCase() || "T";

          const isAvailable =
            technician.availability ===
            "Available";

          return (
            <div
              className="technician-card"
              key={technician._id}
            >
              {/* Profile */}
              <div className="technician-profile">
                {technician.profilePhoto ? (
                  <img
                    src={technician.profilePhoto}
                    alt={technician.name}
                    className="technician-image"
                  />
                ) : (
                  <div className="technician-avatar">
                    {initials}
                  </div>
                )}

                <div className="verified-badge">
                  <FiCheckCircle />
                  Verified
                </div>
              </div>

              {/* Information */}
              <div className="technician-content">
                <div className="technician-name-row">
                  <h3>
                    {technician.name}
                  </h3>

                  <span
                    className={
                      isAvailable
                        ? "availability available"
                        : "availability unavailable"
                    }
                  >
                    <span className="availability-dot" />

                    {isAvailable
                      ? "Available"
                      : technician.availability ||
                        "Unavailable"}
                  </span>
                </div>

                <p className="technician-profession">
                  {technician.profession ||
                    "Service Professional"}
                </p>

                <div className="technician-details">
                  <div>
                    <FiUser />

                    <span>
                      {technician.experience ||
                        "Experience not specified"}
                    </span>
                  </div>

                  <div>
                    <FiMapPin />

                    <span>
                      {technician.workingCity ||
                        "Location not specified"}
                    </span>
                  </div>
                </div>

                <div className="technician-bottom">
                  <div className="technician-rating">
                    <FiStar />

                    <strong>4.8</strong>

                    <span>
                      Trusted Partner
                    </span>
                  </div>

                  {technician.phone && (
                    <a
                      href={`tel:${technician.phone}`}
                      className="technician-call"
                      aria-label={`Call ${technician.name}`}
                    >
                      <FiPhone />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AvailableTechnicians;