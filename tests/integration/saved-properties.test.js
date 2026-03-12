describe('Saved properties', () => {
  it('should save a property and show it on saved searches page', async () => {
    await page.goto('http://localhost:3006/properties');
    await page.evaluate(() => window.localStorage.clear());

    await page.goto('http://localhost:3006/properties');

    await page.waitForSelector('[data-testid="map-container"]', { timeout: 30000 });
    await page.waitForFunction(() => !!window.mapboxMap, { timeout: 30000 });

    const firstCardSelector = '[data-testid^="property-card-"]';
    await page.waitForSelector(firstCardSelector);

    const firstCardId = await page.$eval(firstCardSelector, (el) =>
      el.getAttribute('data-testid').replace('property-card-', '')
    );

    await page.click(`[data-testid="save-property-${firstCardId}"]`);

    // simple delay instead of page.waitForTimeout
    await new Promise((r) => setTimeout(r, 500));

    await page.goto('http://localhost:3006/saved-searches');

    const savedCount = await page.$$eval(
      '[data-testid^="saved-search-"]',
      (nodes) => nodes.length
    );

    expect(savedCount).toBeGreaterThan(0);
  });
});
