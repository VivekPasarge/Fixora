import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";

import "./ServicesHero.css";

const ServicesHero = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <section className="services-hero">
      <div className="services-hero-container">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="services-hero-content"
        >
          <span className="services-badge">
            Professional Home Services
          </span>

          <h1 className="services-title">
            Find the Right Professional
          </h1>

          <p className="services-description">
            Choose from verified technicians for electrical,
            plumbing, appliance repair, painting, cleaning,
            and more.
          </p>

          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesHero;