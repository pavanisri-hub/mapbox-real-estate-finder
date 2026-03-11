import React from 'react';

const AdvancedSearchPage = () => {
  return (
    <div>
      <h1>Advanced Search</h1>

      <div data-testid="search-filters">
        <input
          data-testid="location-autocomplete"
          placeholder="Enter a location"
        />

        <input
          type="range"
          min="1"
          max="50"
          data-testid="search-radius-slider"
        />

        <input
          type="number"
          placeholder="Min price"
          data-testid="price-min-input"
        />

        <input
          type="number"
          placeholder="Max price"
          data-testid="price-max-input"
        />

        <select data-testid="bedrooms-select">
          <option value="">Any bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>

        <button data-testid="draw-boundary-button">Draw boundary</button>
        <button data-testid="apply-filters-button">Apply filters</button>
      </div>

      <div data-testid="results-count">0 results</div>
    </div>
  );
};

export default AdvancedSearchPage;
