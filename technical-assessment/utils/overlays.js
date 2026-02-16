async function closeOverlays(page) {
  // OneTrust cookie consent
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

  // Promo modal in iframe (V-Day / Access Deal)
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

  // Close popup (if present)
  const closePopup = page.getByRole('button', { name: /close popup/i }).first();
  if (await closePopup.isVisible({ timeout: 800 }).catch(() => false)) {
    await closePopup.click({ timeout: 1500 }).catch(() => {});
  }

  // Last resort: remove OneTrust overlay elements
  await page
    .evaluate(() => {
      const sdk = document.querySelector('#onetrust-consent-sdk');
      if (sdk) sdk.remove();
      const dark = document.querySelector('.onetrust-pc-dark-filter');
      if (dark) dark.remove();
    })
    .catch(() => {});
}

async function safeClick(locator, page, timeout = 15000) {
  await closeOverlays(page);
  await locator.click({ timeout }).catch(async () => {
    await closeOverlays(page);
    await locator.click({ timeout, force: true });
  });
}

module.exports = { closeOverlays, safeClick };
