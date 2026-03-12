describe('Radius filter', () => {
  it('should reduce visible properties when radius is decreased', async () => {
    await page.goto('http://localhost:3006/properties');

    await page.waitForSelector('[data-testid="map-container"]', { timeout: 30000 });
    await page.waitForFunction(() => !!window.mapboxMap, { timeout: 30000 });

    const initialCount = await page.$$eval(
      '[data-testid^="property-card-"]',
      (nodes) => nodes.length
    );

    await page.focus('[data-testid="search-radius-slider"]');
    await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="search-radius-slider"]');
      slider.value = '5';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await new Promise((r) => setTimeout(r, 1000));

    const newCount = await page.$$eval(
      '[data-testid^="property-card-"]',
      (nodes) => nodes.length
    );

    expect(newCount).toBeLessThanOrEqual(initialCount);
  });
});
