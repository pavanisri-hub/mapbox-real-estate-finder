const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Fallback mock results for common cities, used when real API isn't available
const MOCK_GEOCODES = [
  {
    query: "San Francisco",
    center: [-122.4194, 37.7749],
    label: "San Francisco, California, United States"
  },
  {
    query: "Los Angeles",
    center: [-118.2437, 34.0522],
    label: "Los Angeles, California, United States"
  },
  {
    query: "New York",
    center: [-74.006, 40.7128],
    label: "New York, New York, United States"
  }
];

function getMockResults(query) {
  const q = query.toLowerCase();
  const matches = MOCK_GEOCODES.filter((m) =>
    m.query.toLowerCase().includes(q)
  );

  return matches.map((m, index) => ({
    id: `${m.query}-${index}`,
    index,
    label: m.label,
    center: m.center // [lng, lat]
  }));
}

export async function geocodeLocation(query) {
  if (!query || query.trim().length < 3) return [];

  // If no token, use mock data
  if (!MAPBOX_ACCESS_TOKEN) {
    return getMockResults(query);
  }

  try {
    const url = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(query) +
        ".json"
    );
    url.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
    url.searchParams.set("limit", "5");

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("Geocoding failed", res.status);
      // Fall back to mock results
      return getMockResults(query);
    }

    const data = await res.json();
    const features = data.features || [];

    if (features.length === 0) {
      // If Mapbox returns nothing, try mock
      return getMockResults(query);
    }

    return features.map((feature, index) => ({
      id: feature.id,
      index,
      label: feature.place_name,
      center: feature.center // [lng, lat]
    }));
  } catch (e) {
    console.error("Geocoding error", e);
    // Network or other error → use mock
    return getMockResults(query);
  }
}
