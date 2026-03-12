import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPBOX_STYLE =
  import.meta.env.VITE_MAPBOX_STYLE || "https://demotiles.maplibre.org/style.json";

const MapContainer = ({
  properties,
  onMarkerClick,
  searchPolygon,
  onSearchPolygonChange
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const drawingRef = useRef({
    isDrawing: false,
    points: [] // [ [lng, lat], ... ]
  });

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

    map.on("load", () => {
      window.mapboxMap = map;
      window.mapboxMapLoaded = true;

      // Add empty polygon source/layers for drawing
      map.addSource("drawn-polygon", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      map.addLayer({
        id: "drawn-polygon-fill",
        type: "fill",
        source: "drawn-polygon",
        paint: {
          "fill-color": "#2563eb",
          "fill-opacity": 0.2
        }
      });

      map.addLayer({
        id: "drawn-polygon-outline",
        type: "line",
        source: "drawn-polygon",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2
        }
      });

      // Click to add vertices when drawing mode is on
      const handleMapClick = (e) => {
        const drawing = drawingRef.current;
        if (!drawing.isDrawing) return;

        const { lng, lat } = e.lngLat;
        drawing.points.push([lng, lat]);
        updatePolygonSource();
      };

      // Double-click to finish polygon
      const handleMapDblClick = (e) => {
        const drawing = drawingRef.current;
        if (!drawing.isDrawing) return;

        e.preventDefault(); // prevent zoom

        if (drawing.points.length < 3) {
          // Not enough points for a polygon
          drawing.isDrawing = false;
          drawing.points = [];
          updatePolygonSource();
          if (onSearchPolygonChange) onSearchPolygonChange(null);
          return;
        }

        // Close polygon and commit to parent
        const ring = [...drawing.points, drawing.points[0]];
        const polygonGeom = {
          type: "Polygon",
          coordinates: [ring]
        };

        drawing.isDrawing = false;
        drawing.points = ring;

        updatePolygonSource(polygonGeom);

        if (onSearchPolygonChange) {
          onSearchPolygonChange(polygonGeom);
        }
      };

      const updatePolygonSource = (geom) => {
        const source = map.getSource("drawn-polygon");
        if (!source) return;

        let featureCollection;

        if (geom && geom.type === "Polygon") {
          featureCollection = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: geom
              }
            ]
          };
        } else if (drawingRef.current.points.length >= 2) {
          // Show live polyline while drawing
          featureCollection = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [...drawingRef.current.points, drawingRef.current.points[0]]
                  ]
                }
              }
            ]
          };
        } else {
          featureCollection = {
            type: "FeatureCollection",
            features: []
          };
        }

        source.setData(featureCollection);
      };

      map.on("click", handleMapClick);
      map.on("dblclick", handleMapDblClick);

      // Store handlers for cleanup
      map.__drawHandlers = { handleMapClick, handleMapDblClick, updatePolygonSource };
    });

    return () => {
      // remove markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const map = mapRef.current;

      if (map && map.__drawHandlers) {
        const { handleMapClick, handleMapDblClick } = map.__drawHandlers;
        map.off("click", handleMapClick);
        map.off("dblclick", handleMapDblClick);
        delete map.__drawHandlers;
      }

      if (map && map.getSource("drawn-polygon")) {
        try {
          if (map.getLayer("drawn-polygon-fill")) {
            map.removeLayer("drawn-polygon-fill");
          }
          if (map.getLayer("drawn-polygon-outline")) {
            map.removeLayer("drawn-polygon-outline");
          }
          map.removeSource("drawn-polygon");
        } catch (e) {
          // ignore
        }
      }

      if (map) {
        map.remove();
      }
      mapRef.current = null;
      window.mapboxMap = undefined;
      window.mapboxMapLoaded = false;
    };
  }, [onSearchPolygonChange]);

  // Update markers & bounds when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !properties) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (properties.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    properties.forEach((p) => {
      const el = document.createElement("div");
      el.setAttribute("data-testid", `map-marker-${p.id}`);

      // Marker styling: pin-like shape
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.backgroundColor = "#120fe0";
      el.style.transform = "rotate(-45deg)";
      el.style.position = "relative";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";

      const inner = document.createElement("div");
      inner.style.width = "8px";
      inner.style.height = "8px";
      inner.style.borderRadius = "50%";
      inner.style.backgroundColor = "white";
      inner.style.position = "absolute";
      inner.style.top = "6px";
      inner.style.left = "6px";
      el.appendChild(inner);

      el.addEventListener("click", () => {
        if (onMarkerClick) {
          onMarkerClick(p.id);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([p.longitude, p.latitude]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 40 });
    }
  }, [properties, onMarkerClick]);

  // When parent changes searchPolygon (e.g., from saved state), redraw it
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.__drawHandlers) return;
    const { updatePolygonSource } = map.__drawHandlers;

    if (!searchPolygon) {
      drawingRef.current.points = [];
      updatePolygonSource(null);
      return;
    }

    if (
      searchPolygon.type === "Polygon" &&
      Array.isArray(searchPolygon.coordinates) &&
      searchPolygon.coordinates[0]?.length >= 3
    ) {
      drawingRef.current.points = searchPolygon.coordinates[0].slice(0, -1);
      updatePolygonSource(searchPolygon);
    }
  }, [searchPolygon]);

  const startDrawing = () => {
    const map = mapRef.current;
    if (!map || !map.__drawHandlers) return;

    drawingRef.current.isDrawing = true;
    drawingRef.current.points = [];
    map.__drawHandlers.updatePolygonSource(null);

    if (onSearchPolygonChange) {
      onSearchPolygonChange(null);
    }
  };

  const clearPolygon = () => {
    const map = mapRef.current;
    if (!map || !map.__drawHandlers) return;

    drawingRef.current.isDrawing = false;
    drawingRef.current.points = [];
    map.__drawHandlers.updatePolygonSource(null);

    if (onSearchPolygonChange) {
      onSearchPolygonChange(null);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 2,
          display: "flex",
          gap: "0.5rem"
        }}
      >
        <button
          type="button"
          onClick={startDrawing}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Draw polygon
        </button>
        <button
          type="button"
          onClick={clearPolygon}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Clear polygon
        </button>
      </div>

      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {window.mapboxMapLoaded && (
        <div data-testid="map-loaded" style={{ display: "none" }} />
      )}
    </div>
  );
};

export default MapContainer;
