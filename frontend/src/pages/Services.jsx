
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import ServicesHero from "../components/ServicesPage/ServicesHero";
import ServiceGrid from "../components/ServicesPage/ServiceGrid";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const role = String(user?.role || "").toLowerCase();

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/services");

        const data = response.data?.services;

        if (!cancelled) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching services:", err);

        if (!cancelled) {
          setServices([]);
          setError(
            err.response?.data?.message ||
              "Unable to load services. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !search ||
        [service.name, service.title, service.description, service.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesCategory =
        selectedCategory === "All" ||
        String(service.category || "").toLowerCase() ===
          String(selectedCategory).toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  if (token && role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-slate-50">
        <ServicesHero
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          {loading ? (
            <p className="text-center text-xl font-semibold">
              Loading services...
            </p>
          ) : error ? (
            <div className="text-center">
              <p role="alert">{error}</p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <p className="text-center text-lg">
              No services found. Try another search or category.
            </p>
          ) : (
            <ServiceGrid
              services={filteredServices}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          )}
        </section>
      </main>
    </>
  );
};

export default Services;
