# Part 2 — Manual Test Plan
## Feature: Share Trip Itinerary (Facebook, X, Email) + Privacy (Public / Friends-only / Private) + Shareable Link

**Author:** <Yordanka Urilska>  
**Date:** <February 18 2026>  
**Product area:** Trip Planning / Itinerary Sharing  
**Platforms:** Web (Roadtrippers)

---

## 1. Purpose and Quality Goals

### Purpose
Validate that users can share trip itineraries through supported channels (Facebook, X, Email, shareable link) and that **privacy and access control** are enforced correctly across user states (owner, logged-in non-owner, logged-out).

### Quality Goals
- **Security & privacy correctness**: no unintended data exposure via links, previews, caching, or redirects.
- **Consistency** across supported browsers and responsive breakpoints.
- **Resilience**: stable behavior with popups/overlays, network interruptions, and partial flows.
- **Usability**: clear feedback, accessible controls, predictable outcomes.

---

## 2. Scope

### In Scope
- Entry points to sharing from itinerary/trip view (button/menu, icons, keyboard focus)
- Share methods:
  - Facebook share
  - X share
  - Email share
  - Copy share link
- Privacy modes:
  - Public
  - Friends-only
  - Private
- Link lifecycle:
  - Link generation, reuse, revocation, and behavior after privacy changes
- Authorization behaviors for:
  - Trip owner (A1)
  - Logged-in non-owner (A2)
  - Logged-out user (A3)
- UX feedback states:
  - Success toasts, errors, validation messages
- Basic analytics hooks (if visible in UI) and clipboard behaviors (where applicable)

### Out of Scope
- Third-party platform uptime/bugs (Facebook/X outages)
- Deliverability issues due to recipient mailbox rules/spam filtering
- Native app share sheets (unless feature is explicitly in native apps)
- Payment/membership gating except when it blocks sharing (then log as risk/defect)

---

## 3. Test Approach

### Test Levels
- **Functional UI validation** (happy paths + error paths)
- **Security & privacy validation** (access control, leak prevention)
- **Cross-browser / responsive** smoke
- **Exploratory sessions** focused on link lifecycle and edge data

### Strategy
- Start with *deterministic artifacts*: 2–3 prepared trips (short, medium, long)
- Validate **public → private transitions**, and **revocation**
- Validate social share opens correct URLs without exposing private metadata in preview
- Validate link behavior in **incognito / logged-out** sessions
- Validate that UI feedback is clear and consistent

---

## 4. Test Environment & Tools

### Browsers
- Chrome (latest)
- Firefox (latest)
- Safari/WebKit (latest)
- Edge (latest)

### Devices / Viewports
- Desktop: 1920×1080 and 1366×768
- Mobile: iPhone 12/13 viewport
- Tablet: iPad viewport

### Accounts
- **A1 (Owner):** creates and owns trips
- **A2 (Non-owner):** logged-in user without access unless granted (and “friend” status if applicable)
- **A3 (Anonymous):** logged-out / incognito

### Tools
- Browser DevTools: Network/Storage, console, cache, link redirects
- Screen recording/snapshots for evidence
- Optional: URL decoder / query inspection for shared links

---

## 5. Test Data

### Trips
- **T1 (Small):** 2 points (Start + Destination)
- **T2 (Medium):** 5–8 waypoints, includes POIs
- **T3 (Large):** 10+ waypoints (to observe performance and UI constraints)
- **T4 (Special chars):** trip title contains diacritics/emoji, e.g. “Café 🚗 Roadtrip”
- **T5 (Sensitive-like content):** notes/description (if available) to ensure privacy is respected

### Share Targets
- Email recipients:
  - valid format: `qa.test+share@example.com`
  - invalid formats for negative tests: `qa.test@`, `@example.com`
- Social share accounts: optional if needed, otherwise validate share dialog + URL payload.

---

## 6. Assumptions & Open Questions (document for reviewers)
- “Friends-only” means only users with an established relationship can access shared trip content.
- Shareable link exists for all privacy types, but must enforce access accordingly.
- Sharing might generate a stable link or a tokenized link; revocation should invalidate access.
- If “friends-only” cannot be simulated, validate “non-owner logged-in” access behavior and document limitation.

---

## 7. Key Risks (What can go wrong)
1. **Private data leakage** via social previews, link unfurling, caching, or prefetch.
2. **Revocation failure**: old links remain accessible after privacy change/revoke.
3. **Unauthorized access** via redirect chain or alternate domain.
4. **Clipboard + link generation** flaky on Safari / permission prompts.
5. **UI overlays** (cookie consent, promo) block share button.
6. **State mismatch**: shared link opens different content than owner sees.

---

## 8. High-Level Scenarios
- Share entry points (discoverability, permissions)
- Share flows by channel
- Privacy enforcement by user state
- Link lifecycle (create, use, change privacy, revoke, delete)
- UX feedback (success/error states)
- Cross-browser + responsive verification
- Accessibility baseline (keyboard + labels)

---

# 9. Test Cases

> Notation: **Priority** (P0/P1/P2), **Type** (F=functional, S=security/privacy, UX=usability, X=compatibility)

## 9.1 Functional — Core
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-F-01 | Share entry point visible for owner on itinerary | P0 | F/UX |
| TC-F-02 | Copy share link (Public) and open in new tab | P0 | F |
| TC-F-03 | Share via Email (valid recipient) | P0 | F |
| TC-F-04 | Share via Facebook opens dialog with correct URL | P1 | F |
| TC-F-05 | Share via X opens compose with correct URL | P1 | F |

### TC-F-02 (Detailed)
**Preconditions:** A1 logged-in, trip T1 exists, privacy=Public  
**Steps:**
1. Open T1 itinerary
2. Click Share → Copy link
3. Paste into new tab
4. Verify loaded content matches T1 itinerary
**Expected:**
- Link opens without auth
- Itinerary content is visible
- URL format is consistent (token/slug) and stable

### TC-F-03 (Detailed)
**Preconditions:** A1 logged-in, trip exists  
**Steps:**
1. Open trip itinerary
2. Share → Email
3. Enter valid recipient email
4. Send
**Expected:**
- Client-side validation passes
- UI confirms send action (toast/banner)
- No duplicate sends on double-click (idempotent UX)

---

## 9.2 Security & Privacy — Access Control (P0)
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-S-01 | Private trip link blocked for logged-out | P0 | S |
| TC-S-02 | Private trip link blocked for logged-in non-owner | P0 | S |
| TC-S-03 | Friends-only blocked for non-friend/non-authorized | P0 | S |
| TC-S-04 | Public trip accessible to anonymous | P0 | S |
| TC-S-05 | Privacy change Public→Private immediately restricts old link | P0 | S |
| TC-S-06 | Revocation invalidates previously issued links | P0 | S |
| TC-S-07 | Trip deletion results in Not Found for link | P1 | S |

### TC-S-05 (Detailed)
**Preconditions:** A1 logged-in, trip is Public, share link exists  
**Steps:**
1. Copy share link while trip is Public
2. Open link in incognito (confirm works)
3. Change privacy to Private
4. Open the SAME link again in incognito
**Expected:**
- Access is denied/login required
- No itinerary content visible
- No partial content leakage (title, waypoints) beyond minimal error page

### TC-S-06 (Detailed)
**Preconditions:** A1 logged-in, link generated  
**Steps:**
1. Copy share link
2. Revoke sharing / disable link (or set to Private if that is the revoke mechanism)
3. Open link in another browser/incognito
**Expected:**
- Access denied or link invalid
- UI indicates revoked/expired link
- No cached content persists after refresh

---

## 9.3 Social Preview / Leak Checks (Senior add-on)
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-S-08 | Private trip does not unfurl/share preview metadata | P0 | S |
| TC-S-09 | Public trip unfurl shows correct title/thumbnail (if expected) | P2 | UX |
| TC-S-10 | Ensure share URL does not contain sensitive data in query params | P0 | S |

**TC-S-10 Steps (quick):**
1. Generate link (any privacy)
2. Inspect URL query params/token
3. Confirm no raw PII, email, internal IDs, or session identifiers included

---

## 9.4 Validation & Negative Testing
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-N-01 | Email share rejects invalid email format | P1 | F |
| TC-N-02 | Share action with network interruption shows error & retry path | P1 | F |
| TC-N-03 | Share button disabled/hidden when no trip loaded | P2 | UX |
| TC-N-04 | Rapid multi-click on Share does not create multiple links/toasts | P2 | UX |

---

## 9.5 Cross-Browser / Responsive
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-X-01 | Smoke: Public link open works in Chrome/Firefox/Safari/Edge | P0 | X |
| TC-X-02 | Smoke: Copy link works on Safari (clipboard permissions) | P1 | X |
| TC-X-03 | Mobile viewport: share UI accessible & not clipped | P1 | X/UX |

---

## 9.6 Accessibility Baseline (Quick)
| ID | Title | Priority | Type |
|---|---|---|---|
| TC-A-01 | Share controls reachable by keyboard (Tab order) | P2 | UX |
| TC-A-02 | Buttons have accessible names/labels | P2 | UX |
| TC-A-03 | Toast/errors readable and not color-only | P2 | UX |

---

## 10. Expected Results / Acceptance Criteria
Feature is acceptable when:
- All **P0** tests pass across at least Chrome + one additional browser.
- Privacy enforcement is correct for A1/A2/A3 across **Public/Private/Friends-only**.
- Existing links respect privacy changes and revocations immediately.
- No sensitive data is exposed in share URLs or previews.
- UI provides clear success/error feedback for share actions.
- No critical layout/access issues in mobile viewport.

---

## 11. Deliverables
- This Test Plan (Markdown)
- Evidence artifacts (screenshots or short recording) for:
  - Public link accessible
  - Private link blocked
  - Privacy change breaking old link
  - Email share success UI state

---

## 12. Notes / Recommendations
- Consider server-side invalidation for revoked links (token blacklist/rotation).
- Consider adding explicit “Link revoked/expired” error state to reduce confusion.
- Ensure caching headers for private content prevent accidental exposure via caches/prefetch.
