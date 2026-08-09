import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}`);

        setService(response.data.service);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!service) {
    return <h2 style={{ textAlign: "center" }}>Service Not Found</h2>;
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

              <BookingCard service={service} />

            </div>

          </div>

        </section>

      </main>
    </>
  );
};

export default ServiceDetails;