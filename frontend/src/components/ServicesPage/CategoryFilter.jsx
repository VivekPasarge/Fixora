import { motion } from "framer-motion";

import "./CategoryFilter.css";

const categories = [
  "All",
  "Electrical",
  "Plumbing",
  "Cleaning",
  "AC",
  "Furniture",
  "Appliance",
  "Salon",
  "Installation",
];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <motion.button
          key={category}
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          onClick={() => setSelectedCategory(category)}
          className={
            selectedCategory === category
              ? "category-btn active"
              : "category-btn"
          }
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;