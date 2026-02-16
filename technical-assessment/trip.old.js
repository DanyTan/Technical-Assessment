const { test, expect } = require('@playwright/test');

test('open roadtrippers homepage', async ({ page }) => {
  await page.goto('https://roadtrippers.com');
  await expect(page).toHaveTitle(/Roadtrippers/i);
});
