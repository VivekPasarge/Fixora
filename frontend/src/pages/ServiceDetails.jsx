
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";

import ServiceHero from "../components/ServiceDetails/ServiceHero";
import ServiceOverview from "../components/ServiceDetails/ServiceOverview";
import IncludedServices from "../components/ServiceDetails/IncludedServices";
import BookingCard from "../components/ServiceDetails/BookingCard";

import "./ServiceDetails.css";

const ServiceDetails = () => {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const role = String(user?.role || "").toLowerCase();

  useEffect(() => {
    let cancelled = false;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");
        setService(null);

        const response = await api.get(
          `/services/${encodeURIComponent(id)}`
        );

        if (!cancelled) {
          setService(response.data?.service || null);
        }
      } catch (err) {
        console.error("Service details error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load this service."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchService();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (token && role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="service-details-page">
          <h2 style={{ textAlign: "center", padding: "80px 20px" }}>
            Loading service...
          </h2>
        </main>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <main className="service-details-page">
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h2>{error || "Service not found"}</h2>
            <Link to="/services">Back to Services</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="service-details-page">
        <ServiceHero service={service} />

        <section className="service-details-section">
          <div className="service-details-container">
            <div className="service-details-left">
              <ServiceOverview service={service} />
              <IncludedServices service={service} />
            </div>

            <div className="service-details-right">
              {role === "technician" ? (
                <div className="technician-service-notice">
                  <h3>Professional Service Details</h3>
                  <p>
                    You can explore this service, but customer bookings must
                    be made from a customer account.
                  </p>
                  <Link to="/technician-dashboard#available-jobs">
                    View Available Jobs
                  </Link>
                </div>
              ) : (
                <BookingCard service={service} />
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ServiceDetails;
