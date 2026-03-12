describe('Location autocomplete', () => {
  it('should center the map when an autocomplete suggestion is selected', async () => {
    await page.goto('http://localhost:3006/properties');

    await page.waitForSelector('[data-testid="map-container"]', { timeout: 30000 });
    await page.waitForFunction(() => !!window.mapboxMap, { timeout: 30000 });

    await page.type('[data-testid="location-autocomplete"]', 'San Francisco');
    await page.waitForSelector('[data-testid="autocomplete-suggestion-0"]');
    await page.click('[data-testid="autocomplete-suggestion-0"]');

    const mapCenter = await page.evaluate(() => {
      const center = window.mapboxMap.getCenter();
      return { lng: center.lng, lat: center.lat };
    });

    // Just check it's roughly in SF area
    expect(mapCenter.lng).toBeGreaterThan(-123);
    expect(mapCenter.lng).toBeLessThan(-122);
    expect(mapCenter.lat).toBeGreaterThan(37);
    expect(mapCenter.lat).toBeLessThan(38);
  });
});
