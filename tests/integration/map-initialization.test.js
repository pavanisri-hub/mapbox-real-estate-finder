describe('Map initialization', () => {
  it('should render the map and set window.mapboxMap', async () => {
    await page.goto('http://localhost:3006/properties');

    // Wait for map container in DOM
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 30000 });

    // Wait until window.mapboxMap is set
    await page.waitForFunction(() => !!window.mapboxMap, { timeout: 30000 });

    const hasMap = await page.evaluate(() => !!window.mapboxMap);
    expect(hasMap).toBe(true);
  });
});
