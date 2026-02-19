const { expect } = require('@playwright/test');
const { closeOverlays, safeClick } = require('../utils/overlays');

class TripPlannerPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.itineraryBtn = this.page.getByRole('button', { name: /itinerary/i });
    this.createATripBtn = this.page.getByRole('button', { name: /create a trip/i });

    this.startingPoint = this.page.getByRole('textbox', { name: /starting point/i });
    this.destination = this.page.getByRole('textbox', { name: /destination/i });

    this.createTripBtn = this.page.getByRole('button', { name: /^create trip$/i });

    this.launch = this.page.getByRole('button', { name: /launch trip/i });
    this.startExploring = this.page.getByRole('button', { name: /start exploring/i });
  }

  async goto() {
    await this.page.goto('https://maps.roadtrippers.com/', { waitUntil: 'domcontentloaded' });
    await closeOverlays(this.page);
  }

  async openCreateTrip() {
    await expect(this.itineraryBtn).toBeVisible();
    await safeClick(this.itineraryBtn, this.page, 20000);

    await expect(this.createATripBtn).toBeVisible({ timeout: 40000 });
    await safeClick(this.createATripBtn, this.page, 20000);
  }

  async fillRoute(startCity, endCity) {
    await expect(this.startingPoint).toBeVisible({ timeout: 40000 });
    await this.startingPoint.click({ timeout: 10000 });
    await this.startingPoint.fill(startCity);
    await this.page.waitForTimeout(400);
    await this.startingPoint.press('ArrowDown');
    await this.startingPoint.press('Enter');

    await expect(this.destination).toBeVisible({ timeout: 40000 });
    await this.destination.click({ timeout: 10000, force: true });
    await this.destination.fill(endCity);
    await this.page.waitForTimeout(400);
    await this.destination.press('ArrowDown');
    await this.destination.press('Enter');
    await this.page.waitForTimeout(400);

    // option if present, otherwise Enter
    const option = this.page.getByRole('button', { name: new RegExp(endCity, 'i') }).first();
    if (await option.isVisible({ timeout: 2500 }).catch(() => false)) {
      await option.click({ timeout: 10000 });
    } else {
      await this.destination.press('ArrowDown');
      await this.destination.press('Enter');
    }
  }

  async submitTrip() {
    await expect(this.createTripBtn).toBeVisible({ timeout: 40000 });
    await safeClick(this.createTripBtn, this.page, 25000);

    if (await this.launch.isVisible({ timeout: 3000 }).catch(() => false)) {
      await safeClick(this.launch, this.page, 15000);
    }
    if (await this.startExploring.isVisible({ timeout: 3000 }).catch(() => false)) {
      await safeClick(this.startExploring, this.page, 15000);
    }
  }

  async assertTripLoaded() {
    await expect(this.itineraryBtn).toBeVisible({ timeout: 40000 });
  }
}

module.exports = { TripPlannerPage };
