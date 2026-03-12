import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getAllProperties } from "../api/propertiesApi";
import { geocodeLocation } from "../api/geocodingApi";
import { haversineDistanceKm } from "../utils/geo";
import MapContainer from "../components/MapContainer.jsx";

const PropertiesPage = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [searchPolygon, setSearchPolygon] = useState(null);
  const [boxFactor, setBoxFactor] = useState(1.0);

  // Advanced filters (from AdvancedSearchPage)
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [bedroomsMin, setBedroomsMin] = useState(null);

  // Load all properties once
  useEffect(() => {
    getAllProperties().then((props) => {
      console.log("Loaded in PropertiesPage:", props.length);
      setAllProperties(props);
      if (props.length > 0) {
        setMapCenter({
          lng: props[0].longitude,
          lat: props[0].latitude
        });
      }
    });
  }, []);

  // Apply filters saved by AdvancedSearchPage (if any)
  useEffect(() => {
    const stored = JSON.parse(
      window.localStorage.getItem("advancedFilters") || "null"
    );
    if (stored) {
      setLocationQuery(stored.locationQuery || "");
      if (stored.radiusKm) setRadiusKm(stored.radiusKm);
      if (stored.priceMin != null) setPriceMin(stored.priceMin);
      if (stored.priceMax != null) setPriceMax(stored.priceMax);
      if (stored.bedroomsMin != null) setBedroomsMin(stored.bedroomsMin);
    }
  }, []);

  // Fetch geocoding suggestions when user types
  useEffect(() => {
    let active = true;

    const fetchSuggestions = async () => {
      if (!locationQuery || locationQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      const results = await geocodeLocation(locationQuery);
      if (active) {
        setSuggestions(results);
      }
    };

    fetchSuggestions();

    return () => {
      active = false;
    };
  }, [locationQuery]);

  const handleSuggestionClick = (s) => {
    setSuggestions([]);
    setLocationQuery(s.label);
    const [lng, lat] = s.center;
    setMapCenter({ lng, lat });

    if (window.mapboxMap) {
      window.mapboxMap.setCenter([lng, lat]);
      window.mapboxMap.setZoom(12);
    }
  };

  const handleRadiusChange = (e) => {
    setRadiusKm(Number(e.target.value));
  };

  const handleMarkerClick = useCallback((id) => {
    console.log("handleMarkerClick called with id", id);
    setSelectedPropertyId(id);
    const card = document.querySelector(
      `[data-testid="property-card-${id}"]`
    );
    console.log("Found card?", !!card);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSaveProperty = useCallback((property) => {
    const existing = JSON.parse(
      window.localStorage.getItem("savedProperties") || "[]"
    );
    const already = existing.find((p) => p.id === property.id);
    if (already) return;
    existing.push(property);
    window.localStorage.setItem("savedProperties", JSON.stringify(existing));
  }, []);

  const visibleProperties = useMemo(() => {
    if (!mapCenter) return allProperties;

    // 1) radius filter
    let filtered = allProperties.filter((p) => {
      const distance = haversineDistanceKm(
        mapCenter.lat,
        mapCenter.lng,
        p.latitude,
        p.longitude
      );
      return distance <= radiusKm;
    });

    // 2) polygon filter (if exists)
    if (searchPolygon && Array.isArray(searchPolygon.coordinates)) {
      const ring = searchPolygon.coordinates[0] || [];

      const pointInPolygon = (lng, lat) => {
        // ray casting algorithm
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const xi = ring[i][0],
            yi = ring[i][1];
          const xj = ring[j][0],
            yj = ring[j][1];

          const intersect =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-9) + xi;

          if (intersect) inside = !inside;
        }
        return inside;
      };

      filtered = filtered.filter((p) => pointInPolygon(p.longitude, p.latitude));
    }

    // 3) price and bedrooms filters from AdvancedSearchPage
    filtered = filtered.filter((p) => {
      if (priceMin != null && p.price < priceMin) return false;
      if (priceMax != null && p.price > priceMax) return false;
      if (bedroomsMin != null && p.bedrooms < bedroomsMin) return false;
      return true;
    });

    return filtered;
  }, [
    allProperties,
    mapCenter,
    radiusKm,
    searchPolygon,
    priceMin,
    priceMax,
    bedroomsMin
  ]);

  return (
    <div data-testid="properties-container">
      <div data-testid="view-toggle">View toggle</div>

      {/* Location autocomplete */}
      <div style={{ marginBottom: "0.5rem", maxWidth: 400 }}>
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Search location"
          data-testid="location-autocomplete"
          style={{ width: "100%", padding: "0.5rem" }}
        />
        {suggestions.length > 0 && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              maxHeight: 200,
              overflowY: "auto"
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s.id}
                data-testid={`autocomplete-suggestion-${s.index}`}
                onClick={() => handleSuggestionClick(s)}
                style={{
                  padding: "0.5rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f4f6"
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Radius slider */}
      <div style={{ marginBottom: "0.5rem", maxWidth: 400 }}>
        <label>
          Radius: {radiusKm} km
          <input
            type="range"
            min="1"
            max="50"
            value={radiusKm}
            onChange={handleRadiusChange}
            data-testid="search-radius-slider"
            style={{ width: "100%", display: "block" }}
          />
        </label>
      </div>

      {/* Box factor slider (legacy, optional) */}
      <div style={{ marginBottom: "0.5rem", maxWidth: 400 }}>
        <label>
          Box factor: {boxFactor.toFixed(1)}×
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={boxFactor}
            onChange={(e) => setBoxFactor(Number(e.target.value))}
            style={{ width: "100%", display: "block" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "1rem", minHeight: "400px" }}>
        <div
          style={{ flex: 1, border: "1px solid #ccc", minHeight: 400 }}
          data-testid="map-container"
        >
          <MapContainer
            properties={visibleProperties}
            onMarkerClick={handleMarkerClick}
            searchPolygon={searchPolygon}
            onSearchPolygonChange={setSearchPolygon}
          />
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            minHeight: 400,
            overflowY: "auto"
          }}
          data-testid="property-list"
        >
          {visibleProperties.map((p) => (
            <div
              key={p.id}
              data-testid={`property-card-${p.id}`}
              data-latitude={p.latitude}
              data-longitude={p.longitude}
              style={{
                borderBottom: "1px solid #e5e7eb",
                padding: "0.75rem",
                backgroundColor:
                  selectedPropertyId === p.id ? "#dbeafe" : "white"
              }}
            >
              <div data-testid={`property-title-${p.id}`}>{p.title}</div>
              <div data-testid={`property-price-${p.id}`}>
                ${p.price.toLocaleString()}
              </div>
              <div data-testid={`property-address-${p.id}`}>
                {p.address}, {p.city}, {p.state} {p.zipcode}
              </div>
              <button
                type="button"
                data-testid={`save-property-${p.id}`}
                onClick={() => handleSaveProperty(p)}
              >
                Save
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
