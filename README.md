# QA Engineer Technical Assessment - Roadpass Digital

This repository contains my submission for the QA Engineer technical assessment.

The project demonstrates automated testing, test planning, defect reporting, and technical communication.

---

## Repository Structure
TECHNICAL-ASSESSMENT
│
├── .github/workflows/
│   └── playwright.yml
│
├── part1-automation/
├── part2-test-plan/
├── part3-bug-reports/
├── part4-ci-cd/
│
├── playwright-report/
├── test-results/
│
├── .env
├── .gitignore
├── package.json
├── playwright.config.js
└── README.md


---

# Part 1 — Automated Testing

## Overview
Automated end-to-end tests were implemented using **Playwright** to validate a critical user flow in the Roadtrippers web application.

### Covered scenarios
✔ User login  
✔ Create trip (happy path)  
✔ Destination validation (negative scenario)  
✔ Overlay handling resilience  
✔ Stable autocomplete interactions  

### Architecture
- Page Object Model (POM)
- Reusable overlay handling utilities
- Environment-based credentials
- Stability improvements (force click fallback & keyboard selection)

---

## Setup

```bash
npm install

2️** Create .env file in project root**

RT_EMAIL=your_test_email
RT_PASSWORD=your_test_password

3️** Install Playwrighт browsers**

npx playwright install

**Running Tests**

**Run all tests**
npx playwright test

**Run Chromium only**
npx playwright test --project=chromium

**Run with visible browser**
npx playwright test --project=chromium --headed

**View HTML report**
npx playwright show-report

**Stability Considerations**

The Roadtrippers UI may display overlays (cookie consent, promotional modals) that can block interactions.

To ensure reliability, the test suite:

- closes consent and promo overlays

- retries blocked clicks

- uses keyboard fallback for autocomplete

- applies force click as a last resort

This approach keeps the business flow deterministic.

**Part 2 — Manual Test Plan**

A comprehensive test plan was created for the Trip Sharing feature.

📄 See:
part2-test-plan/TEST-PLAN.md

Coverage includes:

sharing via social platforms & email

privacy and access control

link lifecycle & revocation

security & data exposure risks

cross-browser & responsive behavior

accessibility baseline

**Part 3 — Bug Reports & Communication**

Documented reproducible issues discovered during testing.

📁 See:
part3-bug-reports/

Reported issues:

iOS freeze when adding >10 waypoints

Search accuracy issues with diacritics

Overlays blocking critical user actions

Includes a professional summary and an engineering communication email.

**Part 4 — CI/CD (Bonus)**

Includes a sample CI setup to run automated tests on pull requests.

Technology Stack

- Playwright Test

- Node.js

- JavaScript

- dotenv

**How to Review Quickly**

1. Read the test plan:
part2-test-plan/TEST-PLAN.md

2. Review bug reports & summary:
part3-bug-reports/

3. Run tests:
npx playwright test --project=chromium

4. View report:
npx playwright show-report
