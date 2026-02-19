# BUG C — Cookie/promo overlays block critical actions

## Title
Web: OneTrust cookie overlay and promo modal intercept clicks and block critical flows (Log in / Itinerary / Create trip)

## Description
On the web experience (roadtrippers.com / maps.roadtrippers.com), UI overlays (OneTrust cookie consent + promotional modal, sometimes inside an iframe) intermittently intercept pointer events and block critical user interactions. This prevents reliable use of key flows such as logging in and creating a trip.

## Environment
- Platform: Web
- Domains observed:
  - https://roadtrippers.com
  - https://maps.roadtrippers.com
- Browser: Chrome (reproducible); likely impacts others
- Frequency: Intermittent but frequent, especially on fresh sessions/incognito

## Steps to Reproduce
1. Open the site in a fresh browser profile or incognito.
2. Attempt to click “Log in” or navigate to the trip planner and open “Itinerary”.
3. Observe cookie consent overlay and/or promo modal appearing.
4. Attempt to click UI elements underneath the overlays.

## Expected Result
- Overlays should not block core flows (login/trip creation), or should be dismissible in a deterministic, accessible way.
- Cookie consent should not leave an active dark overlay that intercepts clicks.
- Promo modal should not appear on critical auth screens or should never prevent interaction.

## Actual Result
- Clicks are intercepted by overlay layers (pointer events), causing timeouts/no action.
- Users may be unable to proceed until multiple overlays are dismissed.

## Severity
High

## Priority
High

## Impact
- Blocks onboarding/login and trip planning.
- Likely reduces conversion and increases user drop-off.

## Recommendations
- Ensure OneTrust consent flow fully removes/clears overlay layers after action.
- Prevent promo overlays from displaying on login and other critical flows.
- Ensure promo modal close control is consistently available (avoid iframe complexity) and keyboard accessible.
- Add monitoring/E2E guard for “clickability” of key controls (Log in, Itinerary, Create trip).
