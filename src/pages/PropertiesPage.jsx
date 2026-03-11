import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllProperties } from '../api/propertiesApi';
import { geocodeLocation } from '../api/geocodingApi';
import { haversineDistanceKm } from '../utils/geo';
import MapContainer from '../components/MapContainer.jsx';

const PropertiesPage = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Load all properties once
  useEffect(() => {
    getAllProperties().then((props) => {
      console.log('Loaded in PropertiesPage:', props.length);
      setAllProperties(props);
      if (props.length > 0) {
        setMapCenter({
          lng: props[0].longitude,
          lat: props[0].latitude
        });
      }
    });
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
    console.log('handleMarkerClick called with id', id);
    setSelectedPropertyId(id);
    const card = document.querySelector(
      `[data-testid="property-card-${id}"]`
    );
    console.log('Found card?', !!card);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Filter properties within radius of mapCenter
  const visibleProperties = useMemo(() => {
    if (!mapCenter) return allProperties;

    return allProperties.filter((p) => {
      const distance = haversineDistanceKm(
        mapCenter.lat,
        mapCenter.lng,
        p.latitude,
        p.longitude
      );
      return distance <= radiusKm;
    });
  }, [allProperties, mapCenter, radiusKm]);

  return (
    <div data-testid="properties-container">
      <div data-testid="view-toggle">
        View toggle
      </div>

      {/* Location autocomplete */}
      <div style={{ marginBottom: '0.5rem', maxWidth: 400 }}>
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Search location"
          data-testid="location-autocomplete"
          style={{ width: '100%', padding: '0.5rem' }}
        />
        {suggestions.length > 0 && (
          <div
            style={{
              border: '1px solid #e5e7eb',
              background: 'white',
              maxHeight: 200,
              overflowY: 'auto'
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s.id}
                data-testid={`autocomplete-suggestion-${s.index}`}
                onClick={() => handleSuggestionClick(s)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Radius slider */}
      <div style={{ marginBottom: '0.5rem', maxWidth: 400 }}>
        <label>
          Radius: {radiusKm} km
          <input
            type="range"
            min="1"
            max="50"
            value={radiusKm}
            onChange={handleRadiusChange}
            data-testid="search-radius-slider"
            style={{ width: '100%', display: 'block' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', minHeight: '400px' }}>
        <div
          style={{ flex: 1, border: '1px solid #ccc', minHeight: 400 }}
          data-testid="map-container"
        >
          <MapContainer
            properties={visibleProperties}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            minHeight: 400,
            overflowY: 'auto'
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
                borderBottom: '1px solid #e5e7eb',
                padding: '0.75rem',
                backgroundColor:
                  selectedPropertyId === p.id ? '#dbeafe' : 'white'
              }}
            >
              <div data-testid={`property-title-${p.id}`}>
                {p.title}
              </div>
              <div data-testid={`property-price-${p.id}`}>
                ${p.price.toLocaleString()}
              </div>
              <div data-testid={`property-address-${p.id}`}>
                {p.address}, {p.city}, {p.state} {p.zipcode}
              </div>
              <button
                type="button"
                data-testid={`save-property-${p.id}`}
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
