const { expect } = require('@playwright/test');
const { closeOverlays, safeClick } = require('../utils/overlays');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    this.page = page;

    this.emailSection = this.page.getByRole('heading', { name: /log in with email/i }).locator('..');
    this.emailField = this.emailSection.getByRole('textbox').first(); // textbox has no label
    this.passwordField = this.page.getByRole('textbox', { name: /password/i }).first();
    this.submitLogin = this.page.getByRole('button', { name: /^log in$/i }).first();
    this.heading = this.page.getByRole('heading', { name: /log in to your account/i });
  }

  async goto() {
    await this.page.goto('https://maps.roadtrippers.com/login', { waitUntil: 'domcontentloaded' });
    await closeOverlays(this.page);
    await this.page.waitForTimeout(500);
    await closeOverlays(this.page);
    await expect(this.heading).toBeVisible({ timeout: 30000 });
  }

  async login(email, password) {
    await expect(this.emailField).toBeVisible({ timeout: 30000 });
    await expect(this.passwordField).toBeVisible({ timeout: 30000 });
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await safeClick(this.submitLogin, this.page, 20000);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = { LoginPage };
