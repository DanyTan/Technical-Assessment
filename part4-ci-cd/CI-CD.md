# Part 4 – CI/CD Integration

## Overview
Continuous Integration ensures that automated tests run on every code change, helping detect issues early and maintain software quality.

This project uses **GitHub Actions** to run Playwrigh tests automatically.

---

## Workflow Trigger

The CI pipeline runs:

- on every push
- on pull requests to the main branch

This guarantees that tests are executed before merging changes.

---

## Pipeline Steps

### 1. Checkout repository
The workflow downloads the latest repository code.

### 2. Setup Node.js
Node.js environment is installed to run the project.

### 3. Install dependencies

npm ci

Installs project dependencies.

### 4. Install Playwright browsers

npx playwright install --with-deps

Ensures required browsers are available.

### 5. Run automated tests

npx playwright test

Executes all automation tests.

### 6. Upload test artifacts
The pipeline uploads:

- Playwright HTML report
- traces (if failures occur)

This helps debugging failures.

---

## Workflow File Location

The pipeline configuration is stored in:

.github/workflows/playwright.yml


---

## Benefits of CI Integration

- ensures tests run automatically
- prevents regressions
- improves code reliability
- provides fast feedback to developers
- enables trace & report review for failures

---

## Possible Improvements

Future enhancements could include:

- running tests in parallel browsers
- adding test coverage metrics
- Slack/email notifications on failures
- scheduled nightly runs
