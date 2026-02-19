Subject: QA Assessment — Bug Report Summary (A/B/C) + Recommendations

Hello [Engineering Manager Name],

As part of the QA technical assessment, I documented the following issues:

1) **BUG A (iOS)** — The app freezes for ~3–5 seconds after adding more than 10 waypoints to a trip on iOS (iPhone 12/14). This impacts longer trip planning flows. **Severity/Priority: High/High.**

2) **BUG B (Search)** — Search returns incorrect results for queries containing diacritics (e.g., “Café Rouge”). This reduces search accuracy for international users. **Severity/Priority: Medium/High.**

3) **BUG C (Web)** — OneTrust cookie consent overlay and a promotional modal (sometimes iframe-based) intermittently intercept clicks and block critical actions such as “Log in”, “Itinerary”, and “Create trip”. **Severity/Priority: High/High.**

High-level recommendations:
- **BUG A:** Profile on iOS (Instruments) and optimize rendering/route recalculation; avoid main-thread blocking; consider list virtualization.
- **BUG B:** Review Unicode normalization/analyzers; ensure diacritic handling is intentional and ranking remains accurate; add i18n test coverage.
- **BUG C:** Ensure consent overlays fully detach and never intercept clicks after dismissal; avoid showing promo overlays on auth/critical flows; add “clickability” E2E guardrails for key controls.

Detailed reports are available in: `technical-assessment/BUGS/`.

Best regards,  
Yordanka
