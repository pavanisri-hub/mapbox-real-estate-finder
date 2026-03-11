const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export async function geocodeLocation(query) {
  if (!query || query.trim().length < 3) return [];

  const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json');
  url.searchParams.set('access_token', MAPBOX_ACCESS_TOKEN);
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Geocoding failed', res.status);
    return [];
  }

  const data = await res.json();
  return (data.features || []).map((feature, index) => ({
    id: feature.id,
    index,
    label: feature.place_name,
    center: feature.center // [lng, lat]
  }));
}
