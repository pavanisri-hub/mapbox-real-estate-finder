import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPBOX_STYLE =
  import.meta.env.VITE_MAPBOX_STYLE || 'https://demotiles.maplibre.org/style.json';

const MapContainer = ({ properties, onMarkerClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Create the map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: [-98.5, 39.8],
      zoom: 3.5
    });

    mapRef.current = map;
    window.mapboxMapLoaded = false;

    map.on('load', () => {
      window.mapboxMap = map;
      window.mapboxMapLoaded = true;

      if (properties && properties.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        properties.forEach((p) => {
          bounds.extend([p.longitude, p.latitude]);
        });
        map.fitBounds(bounds, { padding: 40 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      window.mapboxMap = undefined;
      window.mapboxMapLoaded = false;
    };
    // run only once on mount
  }, []); 

  // Add markers when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !properties) return;

    properties.forEach((p) => {
  const el = document.createElement('div');
  el.setAttribute('data-testid', `map-marker-${p.id}`);

  // Marker styling: pin-like shape
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50% 50% 50% 0';
  el.style.backgroundColor = '#120fe0';        // red-ish
  el.style.transform = 'rotate(-45deg)';
  el.style.position = 'relative';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';

  const inner = document.createElement('div');
  inner.style.width = '8px';
  inner.style.height = '8px';
  inner.style.borderRadius = '50%';
  inner.style.backgroundColor = 'white';
  inner.style.position = 'absolute';
  inner.style.top = '6px';
  inner.style.left = '6px';
  el.appendChild(inner);

  el.addEventListener('click', () => {
    console.log('Marker clicked for property', p.id);
    if (onMarkerClick) {
      onMarkerClick(p.id);
    }
  });

  new maplibregl.Marker({ element: el })
    .setLngLat([p.longitude, p.latitude])
    .addTo(map);
});

  }, [properties, onMarkerClick]);

  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {window.mapboxMapLoaded && (
        <div data-testid="map-loaded" style={{ display: 'none' }} />
      )}
    </>
  );
};

export default MapContainer;
