# Bonus: Non-functional Testing Recommendations

This document provides additional recommendations and examples for performance, accessibility, API testing, and visual regression testing for the Roadtrippers trip planning and sharing features.

---

## 1) Performance Testing (Examples & Recommendations)

### Goals
- Ensure the trip planner remains responsive during heavy user flows (creating trips, adding waypoints, opening itinerary).
- Detect regressions in page load, UI responsiveness, and network performance.

### Suggested Performance Scenarios
1. **Create Trip – Cold Start**
   - Measure time to interactive after navigating to `https://maps.roadtrippers.com/`
   - KPI: TTI within an agreed threshold (e.g., < 6–8s on standard broadband)

2. **Add Waypoints – Scaling**
   - Add 1, 5, 10, 20 waypoints and measure:
     - UI responsiveness (no freezes)
     - time to render itinerary updates
   - KPI: no UI freeze > 1s; rendering time under a set threshold

3. **Itinerary Panel Open/Close**
   - Repeated open/close (20x) and measure:
     - responsiveness
     - memory growth symptoms

4. **Share Link Generation**
   - Measure time to generate shareable link and open the link in a new session/incognito.

### Tools / Approach
- **Lighthouse** (Chrome DevTools) for baseline metrics and regression comparison.
- **Playwright tracing** for diagnosing slow steps (`trace: on-first-retry` already configured).
- Optional: **k6** or **JMeter** for API load testing if endpoints are available.

### What to Track (KPIs)
- Page load: LCP, TTI, CLS (Lighthouse)
- UI responsiveness: long tasks / main-thread blocking
- Key user flow timings: login → itinerary visible → create trip → trip created
- API latency: p50 / p95 response time for trip creation & search endpoints

---

## 2) Accessibility Testing Considerations

### Scope
Trip planner, itinerary UI, and sharing feature (public/friends/private, share link).

### Checks (High Value)
- **Keyboard navigation**
  - All interactive elements reachable via Tab/Shift+Tab
  - Visible focus indicator
  - ESC closes modals and overlays

- **Screen reader / semantics**
  - Inputs have accessible names/labels (e.g., email field, destination field)
  - Buttons have meaningful names (“Create trip”, “Share”, “Copy link”)
  - Dynamic updates (autocomplete suggestions, itinerary changes) are announced appropriately

- **Color contrast**
  - Contrast ratio for text/buttons meets WCAG AA

- **Form validation**
  - Errors are associated with fields (aria-describedby) and announced

### Tools
- **Axe DevTools** (manual scan) or `@axe-core/playwright` (automated checks in CI)
- Chrome/Firefox accessibility tree inspection

### Suggested Outcome
- Add an “Accessibility smoke checklist” to release criteria for the sharing feature.

---

## 3) API Testing Examples (based on typical app behavior)

Even without direct access to internal APIs, QA can identify and validate critical API calls via Chrome DevTools → Network.

### What to Look For
- Trip creation endpoints (POST/PUT)
- Waypoint search/autocomplete endpoints
- Share link generation endpoints
- Privacy settings update endpoints

### Example API Test Cases (Conceptual)
1. **Search with diacritics**
   - Request: query = “Café Rouge”
   - Expect: results include matching attractions; diacritics are normalized correctly

2. **Create trip**
   - Validate:
     - response schema includes tripId, route summary
     - proper error response for missing destination (4xx + descriptive message)

3. **Share link generation**
   - Validate:
     - link is unique and non-guessable
     - respects privacy (private trip should not be accessible anonymously)

4. **Authorization**
   - 401/403 when requests executed without auth token
   - no leakage of sensitive data in responses

### Suggested Tools
- DevTools Network (export HAR), Postman collection, or Newman in CI
- If endpoints are stable: add a small API smoke suite as part of pipeline

---

## 4) Visual Regression Testing Approach

### Why
Trip planner UI is highly visual (maps, itinerary cards, overlays). Visual regressions are common when UI changes.

### Approach
- Use **Playwright screenshots** with `toHaveScreenshot()` for:
  - Itinerary panel opened
  - Create trip modal/form
  - Share dialog with privacy settings
  - Generated share link state

### Practical Tips (to reduce flakiness)
- Mask dynamic areas (map tiles, timestamps, user avatars)
- Disable animations where possible
- Use consistent viewport and fonts
- Run visual tests only on Chromium in CI

### Proposed Baseline Workflow
1. Generate baseline snapshots locally
2. Commit snapshots to repo
3. CI runs screenshot comparison
4. Review diffs on PRs and approve intentional UI changes