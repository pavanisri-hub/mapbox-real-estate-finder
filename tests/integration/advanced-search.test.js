describe('Advanced search', () => {
  it('should apply filters and reduce results on properties page', async () => {
    await page.goto('http://localhost:3006/search');

    await page.type('[data-testid="location-autocomplete"]', 'San Francisco');
    await page.focus('[data-testid="price-min-input"]');
    await page.type('[data-testid="price-min-input"]', '400000');

    await page.focus('[data-testid="price-max-input"]');
    await page.type('[data-testid="price-max-input"]', '800000');

    await page.select('[data-testid="bedrooms-select"]', '2');
    await page.click('[data-testid="apply-filters-button"]');

    await page.waitForSelector('[data-testid="properties-container"]');

    const count = await page.$$eval(
      '[data-testid^="property-card-"]',
      (nodes) => nodes.length
    );

    expect(count).toBeGreaterThan(0);
  });
});
