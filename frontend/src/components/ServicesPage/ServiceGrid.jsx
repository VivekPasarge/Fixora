import ServiceCard from "./ServiceCard";
import "./ServiceGrid.css";

const ServiceGrid = ({ services, searchTerm, selectedCategory }) => {
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (filteredServices.length === 0) {
    return (
      <div className="service-grid-empty">
        <h2 className="service-grid-empty-title">
          No Services Found
        </h2>

        <p className="service-grid-empty-text">
          Try searching with another keyword or category.
        </p>
      </div>
    );
  }

  return (
    <div className="service-grid">
      {filteredServices.map((service) => (
        <ServiceCard
          key={service._id}
          service={service}
        />
      ))}
    </div>
  );
};

export default ServiceGrid;