# Mapbox Real Estate Finder

A frontend-only real estate search app built with React + Vite and MapLibre GL JS. It loads mocked property data, shows them on an interactive map, and supports radius and polygon search, advanced filters, saved properties, and Puppeteer integration tests.

## Tech Stack

- React + Vite
- MapLibre GL JS (Mapbox GL JS compatible)
- Jest + Jest-Puppeteer + Puppeteer
- Docker + Docker Compose

## Features

- Properties listing with map and cards (`/properties`)
- Property detail page (`/property/:id`)
- Advanced search page (`/search`) with:
  - Location text input
  - Radius slider
  - Price range
  - Minimum bedrooms
- Saved properties page (`/saved-searches`)
- Interactive map:
  - Markers for each property
  - Location autocomplete
  - Radius-based filtering
  - Polygon drawing on the map to restrict results
- Integration tests with Puppeteer for:
  - Map initialization
  - Location autocomplete
  - Radius filtering
  - Marker → card highlight
  - Saving properties and viewing them on the Saved Searches page

## Project Structure

```txt
src/
  api/
    propertiesApi.*      # mock properties API
    geocodingApi.*       # geocoding helper
  components/
    MapContainer.jsx     # MapLibre map, markers, polygon draw
  pages/
    PropertiesPage.jsx
    PropertyDetailPage.jsx
    AdvancedSearchPage.jsx
    SavedSearchesPage.jsx
  utils/
    geo.*                # haversineDistanceKm, etc.

tests/
  integration/
    map-initialization.test.js
    location-autocomplete.test.js
    radius-filter.test.js
    marker-interaction.test.js
    advanced-search.test.js
    saved-properties.test.js

Dockerfile
Dockerfile.test
docker-compose.yml
jest.config.cjs
jest-puppeteer.config.cjs
.env.example

## Environment Variables

Copy `.env.example` to `.env` (or `.env.test`) and fill in values:

```env
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here
VITE_MAPBOX_STYLE=https://demotiles.maplibre.org/style.json
VITE_MAPBOX_STYLE can be any valid Mapbox/MapLibre style URL.

Running the App Locally
npm install
npm run dev
Then open the URL printed by Vite (commonly http://localhost:5173).

Main routes:

http://localhost:5173/properties

http://localhost:5173/search

http://localhost:5173/saved-searches

Running Integration Tests Locally
Jest-Puppeteer will start the Vite dev server on port 3006 and run tests against it:


npm run test:integration
The tests exercise:

Map initialization (window.mapboxMap present)

Location autocomplete and map recentering

Radius slider reducing visible properties

Marker click scrolling/highlighting the matching card

Saving a property and verifying it appears on /saved-searches

Docker Setup
The project ships with two Docker images:

app – runs the Vite dev server.

puppeteer-integration-tests – runs Jest + Puppeteer tests against the app container.

Build Images

docker compose build
You may see a warning about MAPBOX_ACCESS_TOKEN not being set; set it in your shell or .env if needed.

Run the App in Docker

docker compose up app
The app will be available at http://localhost:3006.

Run Integration Tests in Docker
This starts app, waits for it to be healthy, and then runs the Puppeteer tests:


docker compose up --abort-on-container-exit --exit-code-from puppeteer-integration-tests
The test results can be written to test-results/ if you configure a reporter.

Notes
Property data is fully mocked on the frontend; no real backend is required.

Map functionality uses MapLibre GL JS, which is API-compatible with Mapbox GL JS for this use case.

Polygon search is implemented with a custom click-to-draw interaction and GeoJSON polygon filtering, functionally equivalent to using mapbox-gl-draw.



