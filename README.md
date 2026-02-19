# Technical Assessment

## Part 1 — Automated Test Implementation (Playwright)

This project contains an automated end-to-end test for the Roadtrippers trip planning flow.

The test validates the following critical user journey:

- User logs in
- User creates a new trip
- User adds start and destination points
- Trip view is successfully loaded

---

## 🛠 Setup

### 1️⃣ Install dependencies

```bash
npm install
2️⃣ Create .env file in project root
Create a file named .env in the same directory as package.json.

RT_EMAIL=your_test_email
RT_PASSWORD=your_test_password
3️⃣ Install Playwright browsers
npx playwright install
▶️ Running Tests
Run Chromium only (recommended)
npx playwright test technical-assessment/create-trip.spec.js --project=chromium
Run with visible browser
npx playwright test technical-assessment/create-trip.spec.js --headed --project=chromium
📊 View HTML Report
npx playwright show-report
⚠️ Notes & Implementation Decisions
Overlay Handling
The Roadtrippers UI frequently displays:

OneTrust cookie consent

Marketing popups

Promo modals inside iframes

These elements may intercept pointer events and block user interactions.

To ensure test stability, a helper utility closeOverlays():

attempts to close overlays using short timeouts

retries clicks when blocked

removes OneTrust overlays from the DOM as a last resort

This keeps the business flow deterministic without slowing execution.

Login Page Specifics
Login is performed at:

https://maps.roadtrippers.com/login
The email field currently has no accessible label.
Therefore, it is located via the "Log in with email" section context.

Test Stability
To reduce flakiness:

random cities are selected from a validated list

autocomplete selections include fallback keyboard selection

safe click logic retries when overlays intercept clicks

🧪 Test Scenario Covered
Happy path:

Open site

Accept cookies & close overlays

Log in

Navigate to Trip Planner

Create a trip

Enter start & destination

Launch trip

Verify itinerary is visible

⏱ Execution Time
Average runtime:

~30–60 seconds (Chromium)

Author
Technical assessment implementation using Playwright.