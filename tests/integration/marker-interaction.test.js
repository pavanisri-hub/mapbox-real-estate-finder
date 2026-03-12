describe('Marker interaction', () => {
  it('should scroll and highlight card when marker is clicked', async () => {
    await page.goto('http://localhost:3006/properties');

    await page.waitForSelector('[data-testid="map-container"]', { timeout: 30000 });
    await page.waitForFunction(() => !!window.mapboxMap, { timeout: 30000 });

    const markerSelector = '[data-testid^="map-marker-"]';
    await page.waitForSelector(markerSelector);

    const firstMarkerTestId = await page.$eval(markerSelector, (el) =>
      el.getAttribute('data-testid')
    );
    const id = firstMarkerTestId.replace('map-marker-', '');

    await page.click(markerSelector);

    await new Promise((r) => setTimeout(r, 500));

    const bgColor = await page.$eval(
      `[data-testid="property-card-${id}"]`,
      (el) => getComputedStyle(el).backgroundColor
    );

    expect(bgColor).toBe('rgb(219, 234, 254)');
  });
});
