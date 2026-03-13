import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdvancedSearchPage = () => {
  const [locationQuery, setLocationQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(25);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const navigate = useNavigate();

  const handleApply = () => {
    const filters = {
      locationQuery,
      radiusKm: Number(radiusKm),
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      bedroomsMin: bedrooms ? Number(bedrooms) : null
    };

    window.localStorage.setItem("advancedFilters", JSON.stringify(filters));
    navigate("/properties");
  };

  return (
    <div>
      <h1>Advanced Search</h1>

      <div data-testid="search-filters">
        <input
          data-testid="location-autocomplete"
          placeholder="Enter a location"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
        />

        <input
          type="range"
          min="1"
          max="50"
          data-testid="search-radius-slider"
          value={radiusKm}
          onChange={(e) => setRadiusKm(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min price"
          data-testid="price-min-input"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max price"
          data-testid="price-max-input"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />

        <select
          data-testid="bedrooms-select"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
        >
          <option value="">Any bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>

        <button data-testid="draw-boundary-button" type="button">
          Draw boundary
        </button>
        <button
          data-testid="apply-filters-button"
          type="button"
          onClick={handleApply}
        >
          Apply filters
        </button>
      </div>
      <div data-testid="results-count">0 results</div>
    </div>
  );
};

export default AdvancedSearchPage;
