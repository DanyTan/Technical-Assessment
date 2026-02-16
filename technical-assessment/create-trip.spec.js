const { test, expect } = require('@playwright/test');

/**
 * Closes known UI overlays that frequently intercept pointer events on Roadtrippers.
 * Uses short timeouts and best-effort actions to keep the main flow deterministic.
 */
async function closeOverlays(page) {
  // OneTrust cookie consent banner/modal
  const acceptAll = page.locator('#onetrust-accept-btn-handler');
  if (await acceptAll.isVisible({ timeout: 800 }).catch(() => false)) {
    await acceptAll.click({ timeout: 1500 }).catch(() => {});
  }

  const rejectAll = page.locator('#onetrust-reject-all-handler');
  if (await rejectAll.isVisible({ timeout: 800 }).catch(() => false)) {
    await rejectAll.click({ timeout: 1500 }).catch(() => {});
  }

  const onetrustClose = page
    .locator('#onetrust-close-btn-container button, button[aria-label="Close"], button[aria-label="close"]')
    .first();
  if (await onetrustClose.isVisible({ timeout: 800 }).catch(() => false)) {
    await onetrustClose.click({ timeout: 1500 }).catch(() => {});
  }

  // Promo campaign modal is rendered inside an iframe on some pages
  try {
    const frame = page.frameLocator('iframe');
    const promoText = frame.locator('text=/v-day|flash sale|access deal|50%\\s*off/i').first();
    if (await promoText.isVisible({ timeout: 800 }).catch(() => false)) {
      await frame.locator('button').first().click({ timeout: 2000 }).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
    }
  } catch (_) {
    // ignore
  }

  // Generic marketing popup
  const closePopup = page.getByRole('button', { name: /close popup/i }).first();
  if (await closePopup.isVisible({ timeout: 800 }).catch(() => false)) {
    await closePopup.click({ timeout: 1500 }).catch(() => {});
  }

  // Last resort: remove OneTrust overlay elements if they still block interactions
  await page
    .evaluate(() => {
      const sdk = document.querySelector('#onetrust-consent-sdk');
      if (sdk) sdk.remove();
      const dark = document.querySelector('.onetrust-pc-dark-filter');
      if (dark) dark.remove();
    })
    .catch(() => {});
}

/**
 * Click helper: normal click first; if blocked by overlays, retries with force after cleanup.
 */
async function safeClick(locator, page, timeout = 15000) {
  await closeOverlays(page);
  await locator.click({ timeout }).catch(async () => {
    await closeOverlays(page);
    await locator.click({ timeout, force: true });
  });
}

/**
 * Uses a fixed pool of valid cities to reduce flakiness in autocomplete suggestions.
 */
const cities = ['Chicago', 'Minneapolis', 'Denver', 'Seattle', 'Austin', 'Boston', 'Portland', 'San Diego'];
function randomCity(exclude) {
  const filtered = cities.filter((c) => c !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

test('happy path: login -> create trip', async ({ page }) => {
  test.setTimeout(150_000);

  expect(process.env.RT_EMAIL, 'RT_EMAIL is missing from .env').toBeTruthy();
  expect(process.env.RT_PASSWORD, 'RT_PASSWORD is missing from .env').toBeTruthy();

  // Open public homepage to handle cookie consent reliably
  await page.goto('https://roadtrippers.com/', { waitUntil: 'domcontentloaded' });
  await closeOverlays(page);

  const acceptCookies = page.getByRole('button', { name: /accept all cookies/i });
  if (await acceptCookies.isVisible({ timeout: 1500 }).catch(() => false)) {
    await acceptCookies.click({ timeout: 15_000 }).catch(async () => {
      await acceptCookies.click({ timeout: 15_000, force: true });
    });
  }
  await closeOverlays(page);

  // Login UI is hosted on maps.roadtrippers.com
  await page.goto('https://maps.roadtrippers.com/login', { waitUntil: 'domcontentloaded' });
  await closeOverlays(page);
  await page.waitForTimeout(500);
  await closeOverlays(page);

  await expect(page.getByRole('heading', { name: /log in to your account/i })).toBeVisible({ timeout: 30_000 });

  // The email textbox has no accessible label in the current DOM; locate it by its section context
  const emailSection = page.getByRole('heading', { name: /log in with email/i }).locator('..');
  const emailField = emailSection.getByRole('textbox').first();
  const passwordField = page.getByRole('textbox', { name: /password/i }).first();

  await expect(emailField).toBeVisible({ timeout: 30_000 });
  await expect(passwordField).toBeVisible({ timeout: 30_000 });

  await emailField.fill(process.env.RT_EMAIL);
  await passwordField.fill(process.env.RT_PASSWORD);

  const submitLogin = page.getByRole('button', { name: /^log in$/i }).first();
  await safeClick(submitLogin, page, 20_000);

  await page.waitForLoadState('domcontentloaded');

  // Navigate to the trip planner experience
  await page.goto('https://maps.roadtrippers.com/', { waitUntil: 'domcontentloaded' });
  await closeOverlays(page);

  const itineraryBtn = page.getByRole('button', { name: /itinerary/i });
  await expect(itineraryBtn).toBeVisible({ timeout: 40_000 });
  await safeClick(itineraryBtn, page, 20_000);

  const createATripBtn = page.getByRole('button', { name: /create a trip/i });
  await expect(createATripBtn).toBeVisible({ timeout: 40_000 });
  await safeClick(createATripBtn, page, 20_000);

  // Use random (but valid) locations to cover different data paths without being flaky
  const startCity = randomCity();
  const endCity = randomCity(startCity);
  console.log(`Trip: ${startCity} -> ${endCity}`);

  const starting = page.getByRole('textbox', { name: /starting point/i });
  await expect(starting).toBeVisible({ timeout: 40_000 });
  await starting.click({ timeout: 10_000 });
  await starting.fill(startCity);

  // Small pause to allow suggestions to render
  await page.waitForTimeout(400);
  await starting.press('ArrowDown');
  await starting.press('Enter');

  const destination = page.getByRole('textbox', { name: /destination/i });
  await expect(destination).toBeVisible({ timeout: 40_000 });
  await destination.click({ timeout: 10_000 });
  await destination.fill(endCity);

  await page.waitForTimeout(400);

  // Prefer selecting an explicit suggestion; fallback to keyboard selection when needed
  const option = page.getByRole('button', { name: new RegExp(endCity, 'i') }).first();
  if (await option.isVisible({ timeout: 2500 }).catch(() => false)) {
    await option.click({ timeout: 10_000 });
  } else {
    await destination.press('ArrowDown');
    await destination.press('Enter');
  }

  const createTripBtn = page.getByRole('button', { name: /^create trip$/i });
  await expect(createTripBtn).toBeVisible({ timeout: 40_000 });
  await safeClick(createTripBtn, page, 25_000);

  // Some runs show an onboarding sequence after creating a trip
  const launch = page.getByRole('button', { name: /launch trip/i });
  if (await launch.isVisible({ timeout: 3000 }).catch(() => false)) {
    await safeClick(launch, page, 15_000);
  }

  const startExploring = page.getByRole('button', { name: /start exploring/i });
  if (await startExploring.isVisible({ timeout: 3000 }).catch(() => false)) {
    await safeClick(startExploring, page, 15_000);
  }

  // Assert the trip view is loaded (Itinerary available)
  await expect(page.getByRole('button', { name: /itinerary/i })).toBeVisible({ timeout: 40_000 });
});
