const { test, expect } = require('@playwright/test');

test('login with test account', async ({ page }) => {
  // Fail fast (if env variables are missing)
  expect(process.env.RT_EMAIL, 'RT_EMAIL is missing from .env').toBeTruthy();
  expect(process.env.RT_PASSWORD, 'RT_PASSWORD is missing from .env').toBeTruthy();

  await page.goto('https://roadtrippers.com/');

  // Cookies
  const acceptCookies = page.getByRole('button', { name: /accept all cookies/i });
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
  }

  // Marketing overlay
  const gistFrame = page.locator('#gist-overlay iframe[title="Message"]');
  if (await gistFrame.isVisible().catch(() => false)) {
    const cf = await gistFrame.contentFrame();
    if (cf) {
      const closeGist = cf.getByRole('button').first();
      if (await closeGist.isVisible().catch(() => false)) {
        await closeGist.click().catch(() => {});
      }
    }
  }

  // Click Log In
  const loginLink = page.getByRole('link', { name: 'Log In', exact: true });
  await expect(loginLink).toBeVisible({ timeout: 15000 });
  await loginLink.click();
  await page.waitForLoadState('domcontentloaded');

  // Close popup 
  const closePopup = page.getByRole('button', { name: /close popup/i });
  if (await closePopup.isVisible().catch(() => false)) {
    await closePopup.click().catch(() => {});
  }

  // Fill credentials
  await page.getByRole('textbox', { name: /username or email address/i }).fill(process.env.RT_EMAIL);
  await page.getByRole('textbox', { name: /password/i }).fill(process.env.RT_PASSWORD);

  // Submit
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  // Assertion: not on the Login page anymore
  await expect(page).not.toHaveURL(/login/i);
});
