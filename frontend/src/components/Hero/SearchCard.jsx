import { FiMapPin, FiSearch } from "react-icons/fi";
import "./SearchCard.css";

const SearchCard = () => {
  return (
    <div className="search-card">

      <h3 className="search-title">
        Book a Home Service
      </h3>

      <p className="search-subtitle">
        Find trusted professionals near your location.
      </p>

      <form className="search-form">

        <div className="input-group">

          <FiSearch className="input-icon" />

          <input
            type="text"
            placeholder="What service do you need?"
            aria-label="Service Name"
          />

        </div>

        <div className="input-group">

          <FiMapPin className="input-icon" />

          <input
            type="text"
            placeholder="Enter your location"
            aria-label="Location"
          />

        </div>

        <button
          type="submit"
          className="search-btn"
        >
          <FiSearch />

          <span>Search Services</span>

        </button>

      </form>

    </div>
  );
};

export default SearchCard;