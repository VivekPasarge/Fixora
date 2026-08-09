import { useEffect, useState } from "react";

import api from "../api/axios";

import Navbar from "../components/Navbar/Navbar";
import ServicesHero from "../components/ServicesPage/ServicesHero";
import ServiceGrid from "../components/ServicesPage/ServiceGrid";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/services");

        setServices(response.data.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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
            <h2 className="text-center text-xl font-semibold">
              Loading Services...
            </h2>
          ) : (
            <ServiceGrid
              services={services}
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