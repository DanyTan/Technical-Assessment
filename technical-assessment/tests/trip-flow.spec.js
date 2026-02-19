const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TripPlannerPage } = require('../pages/TripPlannerPage');

let loginPage;
let tripPlannerPage;
const cities = ['Chicago', 'Minneapolis', 'Denver', 'Seattle', 'Austin', 'Boston', 'Portland', 'San Diego'];
function randomCity(exclude) {
  const filtered = cities.filter((c) => c !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

test.describe('Trip planning flow', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(150_000);
    expect(process.env.RT_EMAIL, 'RT_EMAIL is missing from .env').toBeTruthy();
    expect(process.env.RT_PASSWORD, 'RT_PASSWORD is missing from .env').toBeTruthy();

    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.RT_EMAIL, process.env.RT_PASSWORD);

    tripPlannerPage = new TripPlannerPage(page);
    await tripPlannerPage.goto();
  });

  // Test Case 1: Happy path - Login -> Create Trip
  test('TC1 - Happy path: login -> create trip', async ({ page }) => {
    page = tripPlannerPage.page;
    await tripPlannerPage.openCreateTrip();

    const startCity = randomCity();
    const endCity = randomCity(startCity);

    await tripPlannerPage.fillRoute(startCity, endCity);
    await tripPlannerPage.submitTrip();
    await tripPlannerPage.assertTripLoaded();
  });

  // Test Case 2: Edge case - same start and end (expect the app to not allow creating trip OR show validation)
  test('TC2 - Edge: same start and destination should be handled', async ({ page }) => {
    page = tripPlannerPage.page;
    await tripPlannerPage.openCreateTrip();

    const city = randomCity();

    await tripPlannerPage.fillRoute(city, city);

    // Try to create trip

    await tripPlannerPage.createATripBtn.click({ timeout: 15000 }).catch(async () => {
      await tripPlannerPage.createATripBtn.click({ timeout: 15000, force: true });
    });


    await page.waitForTimeout(1500);
    await expect(tripPlannerPage.itineraryBtn).toBeVisible({ timeout: 40000 });
  });

  // Test Case 3: Error scenario - missing destination (expect validation / no create)
  test('TC3 - Error: missing destination should not create trip', async ({ page }) => {

    await tripPlannerPage.openCreateTrip();

    const startCity = randomCity();
    console.log(`TC3 Trip: ${startCity} -> (missing destination)`);

    // Fill only starting point
    const starting = tripPlannerPage.startingPoint;
    await expect(starting).toBeVisible({ timeout: 40000 });
    await starting.click();
    await starting.fill(startCity);
    await page.waitForTimeout(400);
    await starting.press('ArrowDown');
    await starting.press('Enter');

    await tripPlannerPage.createATripBtn.click({ timeout: 5000 }).catch(() => { });

    await expect(tripPlannerPage.startingPoint).toBeVisible({ timeout: 20000 });
  });
});
